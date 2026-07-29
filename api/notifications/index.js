import { requireSession } from '../_lib/auth.js'
import { handleError, readJson, sendJson } from '../_lib/http.js'
import {
  ensureAgentNotificationsTable,
  listAgentNotifications,
  markAgentNotificationsRead,
  syncAgentNotifications,
} from '../_lib/agentNotifications.js'

export default async function handler(req, res) {
  try {
    const session = await requireSession(req)
    if (!session.agentId) {
      sendJson(res, 200, { notifications: [], unreadCount: 0 })
      return
    }
    if (req.method === 'GET') {
      await syncAgentNotifications(session.agentId)
      sendJson(res, 200, await listAgentNotifications(session.agentId))
      return
    }
    if (req.method === 'PATCH') {
      await ensureAgentNotificationsTable()
      const payload = await readJson(req)
      await markAgentNotificationsRead(session.agentId, payload.id || null)
      sendJson(res, 200, await listAgentNotifications(session.agentId))
      return
    }
    sendJson(res, 405, { error: 'Method not allowed.' })
  } catch (error) {
    handleError(res, error)
  }
}
