import { query } from './db.js'

export async function ensureAyudaTables() {
  await query(`CREATE TABLE IF NOT EXISTS ayuda_loans (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    agent_id BIGINT UNSIGNED NOT NULL,
    original_amount DECIMAL(14,2) NOT NULL,
    installment_amount DECIMAL(14,2) NOT NULL DEFAULT 0,
    released_date DATE NOT NULL,
    notes TEXT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'Active',
    created_by BIGINT UNSIGNED NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id), KEY ayuda_loans_agent_index (agent_id),
    CONSTRAINT ayuda_loans_agent_foreign FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE
  )`)
  await query(`ALTER TABLE ayuda_loans MODIFY COLUMN installment_amount DECIMAL(14,2) NOT NULL DEFAULT 0`)
  await query(`CREATE TABLE IF NOT EXISTS ayuda_payments (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    loan_id BIGINT UNSIGNED NOT NULL,
    commission_computation_id BIGINT UNSIGNED NULL,
    amount DECIMAL(14,2) NOT NULL,
    paid_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    notes VARCHAR(255) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY ayuda_payment_computation_unique (loan_id, commission_computation_id),
    CONSTRAINT ayuda_payments_loan_foreign FOREIGN KEY (loan_id) REFERENCES ayuda_loans(id) ON DELETE CASCADE
  )`)
}

export async function listAyudaLoans(agentId = null) {
  const rows = await query(`SELECT l.id, l.agent_id AS agentId,
    TRIM(CONCAT_WS(' ', a.first_name, a.last_name)) AS agentName,
    TRIM(CONCAT_WS(' ', a.first_name, NULLIF(a.middle_name, ''), a.last_name)) AS agentFullName,
    a.hlc_code AS hlcCode, l.original_amount AS originalAmount,
    l.installment_amount AS installmentAmount,
    DATE_FORMAT(l.released_date, '%Y-%m-%d') AS releasedDate,
    l.notes, l.status, l.created_at AS createdAt,
    COALESCE(SUM(p.amount), 0) AS totalPaid,
    GREATEST(l.original_amount - COALESCE(SUM(p.amount), 0), 0) AS remainingBalance
    FROM ayuda_loans l JOIN agents a ON a.id = l.agent_id
    LEFT JOIN ayuda_payments p ON p.loan_id = l.id
    ${agentId ? 'WHERE l.agent_id = :agentId' : ''}
    GROUP BY l.id, a.first_name, a.middle_name, a.last_name, a.hlc_code
    ORDER BY l.created_at DESC`, agentId ? { agentId } : undefined)
  return Promise.all(rows.map(async (row) => {
    const payments = await query(`SELECT p.id, p.commission_computation_id AS computationId, p.amount, p.paid_at AS paidAt, p.notes,
      JSON_UNQUOTE(JSON_EXTRACT(c.payload, '$.buyer')) AS buyer,
      JSON_UNQUOTE(JSON_EXTRACT(c.payload, '$.voucherNo')) AS voucherNo
      FROM ayuda_payments p LEFT JOIN commission_computations c ON c.id = p.commission_computation_id
      WHERE p.loan_id = :loanId ORDER BY p.paid_at DESC`, { loanId: row.id })
    return { ...row, originalAmount: Number(row.originalAmount), installmentAmount: Number(row.installmentAmount), totalPaid: Number(row.totalPaid), remainingBalance: Number(row.remainingBalance), payments: payments.map((payment) => ({ ...payment, amount: Number(payment.amount) })) }
  }))
}

export async function syncAyudaPaymentsFromComputations() {
  await ensureAyudaTables()
  const [agents, loans, computations, vouchers, existingPayments] = await Promise.all([
    query(`SELECT id, TRIM(CONCAT_WS(' ', first_name, last_name)) AS simpleName,
      TRIM(CONCAT_WS(' ', first_name, NULLIF(middle_name, ''), last_name)) AS fullName FROM agents`),
    query(`SELECT l.id, l.agent_id AS agentId, l.original_amount AS originalAmount,
      COALESCE((SELECT SUM(amount) FROM ayuda_payments WHERE loan_id = l.id), 0) AS totalPaid
      FROM ayuda_loans l ORDER BY l.released_date, l.id`),
    query(`SELECT id, payload, created_at AS createdAt FROM commission_computations ORDER BY id`),
    query(`SELECT id, payload FROM commission_vouchers`),
    query(`SELECT id, commission_computation_id AS computationId FROM ayuda_payments WHERE commission_computation_id IS NOT NULL`),
  ])
  const normalize = (value) => String(value || '').trim().toLowerCase().replace(/\s+/g, ' ')
  const agentByName = new Map()
  for (const agent of agents) {
    agentByName.set(normalize(agent.simpleName), agent)
    agentByName.set(normalize(agent.fullName), agent)
  }
  let synced = 0
  const voucherById = new Map(vouchers.map((voucher) => [String(voucher.id), typeof voucher.payload === 'string' ? JSON.parse(voucher.payload) : voucher.payload || {}]))
  const computationById = new Map(computations.map((computation) => [String(computation.id), typeof computation.payload === 'string' ? JSON.parse(computation.payload) : computation.payload || {}]))
  let reversed = 0
  for (const payment of existingPayments) {
    const computationPayload = computationById.get(String(payment.computationId))
    const voucher = voucherById.get(String(computationPayload?.selectedVoucherId || ''))
    if (voucher?.status !== 'Released') {
      await query(`DELETE FROM ayuda_payments WHERE id = :id`, { id: payment.id })
      reversed += 1
    }
  }
  for (const loan of loans) {
    const [paid] = await query(`SELECT COALESCE(SUM(amount), 0) AS totalPaid FROM ayuda_payments WHERE loan_id = :loanId`, { loanId: loan.id })
    loan.totalPaid = Number(paid.totalPaid)
  }
  const unmatched = []
  for (const computation of computations) {
    const payload = typeof computation.payload === 'string' ? JSON.parse(computation.payload) : computation.payload || {}
    const voucher = voucherById.get(String(payload.selectedVoucherId || ''))
    if (voucher?.status !== 'Released') continue
    const deductionsByAgent = new Map()
    for (const row of payload.rows || []) {
      const amount = Number(row.deductions?.ayuda) || 0
      if (amount <= 0) continue
      const agent = agentByName.get(normalize(row.name))
      if (!agent) { unmatched.push({ computationId: computation.id, name: row.name, amount }); continue }
      deductionsByAgent.set(agent.id, (deductionsByAgent.get(agent.id) || 0) + amount)
    }
    for (const [agentId, totalAmount] of deductionsByAgent) {
      let remainingDeduction = totalAmount
      const agentLoans = loans.filter((loan) => String(loan.agentId) === String(agentId))
      for (const loan of agentLoans) {
        if (remainingDeduction <= 0) break
        const [existing] = await query(`SELECT id FROM ayuda_payments WHERE loan_id = :loanId AND commission_computation_id = :computationId`, { loanId: loan.id, computationId: computation.id })
        if (existing) { remainingDeduction = 0; break }
        const available = Math.max(0, Number(loan.originalAmount) - Number(loan.totalPaid))
        const applied = Math.min(remainingDeduction, available)
        if (applied <= 0) continue
        await query(`INSERT INTO ayuda_payments (loan_id, commission_computation_id, amount, paid_at, notes)
          VALUES (:loanId, :computationId, :amount, :paidAt, :notes)`, {
          loanId: loan.id, computationId: computation.id, amount: applied,
          paidAt: computation.createdAt, notes: `Commission deduction for ${payload.buyer || payload.voucherNo || 'saved computation'}`,
        })
        loan.totalPaid = Number(loan.totalPaid) + applied
        remainingDeduction -= applied
        synced += 1
      }
    }
  }
  await query(`UPDATE ayuda_loans l SET status = CASE WHEN
    COALESCE((SELECT SUM(p.amount) FROM ayuda_payments p WHERE p.loan_id = l.id), 0) >= l.original_amount
    THEN 'Paid' ELSE 'Active' END`)
  return { synced, reversed, unmatched }
}
