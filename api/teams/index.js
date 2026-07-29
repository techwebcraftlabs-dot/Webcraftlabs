import { query } from '../_lib/db.js'
import { handleError, readJson, sendJson } from '../_lib/http.js'
import { requireSession } from '../_lib/auth.js'
import { ensureTeamsTable, getSubteams, replaceSubteams, teamSummaryQuery } from '../_lib/teams.js'

export default async function handler(req, res) {
  try {
    const session = await requireSession(req, { roles: ['Administrator', 'Sales Director', 'EVP'] })
    await ensureTeamsTable()

    if (req.method === 'GET') {
      const teams = await query(`${teamSummaryQuery} HAVING (:isAdmin = 1 OR t.team_name = :teamName) ORDER BY t.team_name`, {
        isAdmin: session.role === 'Administrator' ? 1 : 0,
        teamName: session.team || '',
      })
      const records = await Promise.all(teams.map(async (team) => ({ ...team, totalSd: Number(team.totalSd), totalHlc: Number(team.totalHlc), totalMembers: Number(team.totalMembers), subteams: await getSubteams(team.id) })))
      sendJson(res, 200, records)
      return
    }

    if (req.method === 'POST') {
      await requireSession(req, { roles: ['Administrator'] })
      const body = await readJson(req)
      const teamName = String(body.teamName || '').trim().toUpperCase()
      if (!teamName) return sendJson(res, 400, { error: 'Team name is required.' })
      if (body.evpAgentId) {
        const [evp] = await query(`SELECT id FROM agents WHERE id = :id AND role = 'EVP' AND status = 'Active'`, { id: body.evpAgentId })
        if (!evp) return sendJson(res, 400, { error: 'Assigned team leader must be an active EVP.' })
      }
      for (const item of body.subteams || []) {
        if (item.sdAgentId) {
          const [sd] = await query(`SELECT id FROM agents WHERE id = :id AND role = 'Sales Director' AND status = 'Active'`, { id: item.sdAgentId })
          if (!sd) return sendJson(res, 400, { error: 'Each assigned sub-team leader must be an active Sales Director.' })
        }
      }
      const result = await query(`INSERT INTO teams (team_name, evp_agent_id, established_date, status) VALUES (:teamName, :evpAgentId, :establishedDate, :status)`, {
        teamName, evpAgentId: body.evpAgentId || null, establishedDate: body.establishedDate || null, status: body.status || 'Active',
      })
      await replaceSubteams(result.insertId, body.subteams)
      sendJson(res, 201, { message: 'Team created.' })
      return
    }

    sendJson(res, 405, { error: 'Method not allowed.' })
  } catch (error) { handleError(res, error) }
}
