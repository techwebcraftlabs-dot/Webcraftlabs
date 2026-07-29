import { getTemporaryPassword } from '../../_lib/temporaryCredentials.js'
import { requireSession } from '../../_lib/auth.js'
import { handleError, sendJson } from '../../_lib/http.js'

export default async function handler(req, res) {
  try {
    await requireSession(req, { roles: ['Administrator'] })
    if (req.method !== 'GET') return sendJson(res, 405, { error: 'Method not allowed.' })
    const temporaryPassword = await getTemporaryPassword(req.query.id)
    sendJson(res, 200, { temporaryPassword })
  } catch (error) { handleError(res, error) }
}
