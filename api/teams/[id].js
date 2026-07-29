import { getPool, query } from '../_lib/db.js'
import { handleError, readJson, sendJson } from '../_lib/http.js'
import { requireSession } from '../_lib/auth.js'
import { ensureTeamsTable, getSubteams, replaceSubteams } from '../_lib/teams.js'

export default async function handler(req, res) {
  try {
    const id = String(req.query?.id || '')
    await ensureTeamsTable()

    if (req.method === 'GET') {
      const session = await requireSession(req, { roles: ['Administrator', 'Sales Director', 'EVP'] })
      const [team] = await query(`SELECT id, team_name AS teamName, evp_agent_id AS evpAgentId, DATE_FORMAT(established_date, '%Y-%m-%d') AS establishedDate, status FROM teams WHERE id = :id`, { id })
      if (!team) return sendJson(res, 404, { error: 'Team not found.' })
      if (session.role !== 'Administrator' && team.teamName !== session.team) return sendJson(res, 403, { error: 'You can only view your assigned planet team.' })
      const members = await query(`SELECT id, hlc_code AS hlcCode, first_name AS firstName, last_name AS lastName, role, sub_team AS subTeam, zonal_email AS zonalEmail, status, created_at AS createdAt FROM agents WHERE team = :teamName ORDER BY sub_team, role, first_name, last_name`, { teamName: team.teamName })
      sendJson(res, 200, { ...team, subteams: await getSubteams(id), members })
      return
    }

    await requireSession(req, { roles: ['Administrator'] })
    if (req.method === 'PUT') {
      const body = await readJson(req)
      const teamName = String(body.teamName || '').trim().toUpperCase()
      if (!teamName) return sendJson(res, 400, { error: 'Team name is required.' })
      if (body.evpAgentId) {
        const [evp] = await query(`SELECT id FROM agents WHERE id = :evpId AND role = 'EVP' AND status = 'Active'`, { evpId: body.evpAgentId })
        if (!evp) return sendJson(res, 400, { error: 'Assigned team leader must be an active EVP.' })
      }
      for (const item of body.subteams || []) {
        if (item.sdAgentId) {
          const [sd] = await query(`SELECT id FROM agents WHERE id = :id AND role = 'Sales Director' AND status = 'Active'`, { id: item.sdAgentId })
          if (!sd) return sendJson(res, 400, { error: 'Each assigned sub-team leader must be an active Sales Director.' })
        }
      }
      const [current] = await query(`SELECT team_name AS teamName FROM teams WHERE id = :id`, { id })
      if (!current) return sendJson(res, 404, { error: 'Team not found.' })
      await query(`UPDATE teams SET team_name = :teamName, evp_agent_id = :evpAgentId, established_date = :establishedDate, status = :status WHERE id = :id`, { id, teamName, evpAgentId: body.evpAgentId || null, establishedDate: body.establishedDate || null, status: body.status || 'Active' })
      if (current.teamName !== teamName) await query(`UPDATE agents SET team = :teamName WHERE team = :oldTeamName`, { teamName, oldTeamName: current.teamName })
      await replaceSubteams(id, body.subteams)
      sendJson(res, 200, { message: 'Team updated.' })
      return
    }
    if (req.method === 'DELETE') {
      const connection = await getPool().getConnection()
      try {
        await connection.beginTransaction()
        const [[team]] = await connection.execute(`SELECT team_name AS teamName FROM teams WHERE id = :id FOR UPDATE`, { id })
        if (!team) {
          await connection.rollback()
          return sendJson(res, 404, { error: 'Team not found.' })
        }
        await connection.execute(`UPDATE agents SET team = NULL, sub_team = NULL WHERE team = :teamName`, { teamName: team.teamName })
        await connection.execute(`DELETE FROM teams WHERE id = :id`, { id })
        await connection.commit()
        sendJson(res, 200, { message: 'Team deleted. Its agents are now unassigned.' })
      } catch (error) {
        await connection.rollback()
        throw error
      } finally {
        connection.release()
      }
      return
    }
    sendJson(res, 405, { error: 'Method not allowed.' })
  } catch (error) { handleError(res, error) }
}
