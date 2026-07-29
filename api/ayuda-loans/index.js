import { query } from '../_lib/db.js'
import { ensureAyudaTables, listAyudaLoans, syncAyudaPaymentsFromComputations } from '../_lib/ayudaLoans.js'
import { requireSession } from '../_lib/auth.js'
import { handleError, readJson, sendJson } from '../_lib/http.js'

export default async function handler(req, res) {
  try {
    const session = await requireSession(req)
    await ensureAyudaTables()
    if (req.method === 'GET') {
      await syncAyudaPaymentsFromComputations()
      const requestedAgentId = String(req.query?.agentId || '')
      const agentId = session.role === 'Administrator' ? (requestedAgentId || null) : session.agentId
      return sendJson(res, 200, await listAyudaLoans(agentId))
    }
    await requireSession(req, { roles: ['Administrator'] })
    const body = await readJson(req)
    if (req.method === 'POST' && body.action === 'payment') {
      const amount = Number(body.amount)
      const [loan] = await query(`SELECT id, original_amount AS originalAmount,
        COALESCE((SELECT SUM(amount) FROM ayuda_payments WHERE loan_id = ayuda_loans.id), 0) AS totalPaid,
        COALESCE((SELECT amount FROM ayuda_payments WHERE loan_id = ayuda_loans.id AND commission_computation_id = :computationId), 0) AS currentPayment
        FROM ayuda_loans WHERE id = :loanId`, { loanId: body.loanId, computationId: body.computationId || null })
      if (!loan) return sendJson(res, 404, { error: 'Ayuda loan not found.' })
      const balance = Number(loan.originalAmount) - Number(loan.totalPaid) + Number(loan.currentPayment)
      if (!Number.isFinite(amount) || amount <= 0 || amount > balance) return sendJson(res, 400, { error: 'Ayuda payment must be greater than zero and cannot exceed the remaining balance.' })
      await query(`INSERT INTO ayuda_payments (loan_id, commission_computation_id, amount, notes)
        VALUES (:loanId, :computationId, :amount, :notes)
        ON DUPLICATE KEY UPDATE amount = VALUES(amount), notes = VALUES(notes)`, { loanId: body.loanId, computationId: body.computationId || null, amount, notes: body.notes || 'Commission deduction' })
      const [remaining] = await query(`SELECT GREATEST(original_amount - COALESCE((SELECT SUM(amount) FROM ayuda_payments WHERE loan_id = ayuda_loans.id), 0), 0) AS balance FROM ayuda_loans WHERE id = :loanId`, { loanId: body.loanId })
      if (Number(remaining.balance) <= 0) await query(`UPDATE ayuda_loans SET status = 'Paid' WHERE id = :loanId`, { loanId: body.loanId })
      return sendJson(res, 200, { message: 'Ayuda payment recorded.', remainingBalance: Number(remaining.balance) })
    }
    if (req.method === 'POST') {
      const amount = Number(body.originalAmount)
      if (!body.agentId || !Number.isFinite(amount) || amount <= 0) return sendJson(res, 400, { error: 'Agent and valid loan amount are required.' })
      const result = await query(`INSERT INTO ayuda_loans (agent_id, original_amount, installment_amount, released_date, notes, created_by) VALUES (:agentId, :amount, 0, :releasedDate, :notes, :createdBy)`, { agentId: body.agentId, amount, releasedDate: body.releasedDate || new Date().toISOString().slice(0, 10), notes: body.notes || null, createdBy: session.agentId || null })
      return sendJson(res, 201, { id: String(result.insertId), message: 'Ayuda loan created.' })
    }
    sendJson(res, 405, { error: 'Method not allowed.' })
  } catch (error) { handleError(res, error) }
}
