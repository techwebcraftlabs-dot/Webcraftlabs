import { ensureColumn, query } from '../_lib/db.js'
import { requireSession } from '../_lib/auth.js'
import { handleError, sendJson } from '../_lib/http.js'

export default async function handler(req, res) {
  try {
    await requireSession(req, { roles: ['Administrator', 'HLC', 'EVP'] })
    if (req.method !== 'GET') return sendJson(res, 405, { error: 'Method not allowed.' })
    await ensureColumn('agents', 'zonal_tax_rate', 'DECIMAL(5, 2) NOT NULL DEFAULT 5.00')
    await ensureColumn('agents', 'pass_on_vat', 'TINYINT(1) NOT NULL DEFAULT 0 AFTER zonal_tax_rate')
    const rows = await query(`SELECT id,
      TRIM(CONCAT_WS(' ', first_name, NULLIF(middle_name, ''), last_name)) AS fullName,
      TRIM(CONCAT_WS(' ', first_name, last_name)) AS simpleName,
      zonal_tax_rate AS zonalTaxRate,
      pass_on_vat AS passOnVat
      FROM agents WHERE status = 'Active' ORDER BY first_name, last_name`)
    sendJson(res, 200, rows.map((row) => ({ ...row, zonalTaxRate: Number(row.zonalTaxRate) || 0, passOnVat: Boolean(row.passOnVat) })))
  } catch (error) { handleError(res, error) }
}
