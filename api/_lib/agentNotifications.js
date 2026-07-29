import { query } from './db.js'

const normalize = (value) => String(value || '').trim().toLowerCase().replace(/\s+/g, ' ')

export async function ensureAgentNotificationsTable() {
  await query(`CREATE TABLE IF NOT EXISTS agent_notifications (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    agent_id BIGINT UNSIGNED NOT NULL,
    event_key VARCHAR(190) NOT NULL,
    type VARCHAR(40) NOT NULL,
    title VARCHAR(150) NOT NULL,
    message VARCHAR(500) NOT NULL,
    reference_id VARCHAR(100) NULL,
    read_at DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY agent_notifications_event_unique (agent_id, event_key),
    KEY agent_notifications_agent_created_index (agent_id, created_at),
    CONSTRAINT agent_notifications_agent_foreign FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE
  )`)
}

function money(value) {
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(Number(value) || 0)
}

export async function syncAgentNotifications(agentId) {
  await ensureAgentNotificationsTable()
  // Older notifications were keyed per buyer computation, which produced
  // duplicates when one voucher batch contained multiple buyers.
  await query(`DELETE FROM agent_notifications
    WHERE agent_id = :agentId AND type = 'commission_released'
      AND event_key LIKE 'released:%'`, { agentId })
  const [agents, computations, vouchers] = await Promise.all([
    query(`SELECT id, TRIM(CONCAT_WS(' ', first_name, last_name)) AS simpleName,
      TRIM(CONCAT_WS(' ', first_name, NULLIF(middle_name, ''), last_name)) AS fullName
      FROM agents WHERE id = :agentId LIMIT 1`, { agentId }),
    query(`SELECT id, payload, created_at AS createdAt FROM commission_computations ORDER BY id`),
    query(`SELECT id, payload, updated_at AS updatedAt FROM commission_vouchers`),
  ])
  const agent = agents[0]
  if (!agent) return
  const aliases = new Set([normalize(agent.simpleName), normalize(agent.fullName)].filter(Boolean))
  const voucherById = new Map(vouchers.map((record) => {
    const payload = typeof record.payload === 'string' ? JSON.parse(record.payload) : record.payload || {}
    return [String(record.id), { ...payload, updatedAt: record.updatedAt }]
  }))

  for (const computation of computations) {
    const payload = typeof computation.payload === 'string' ? JSON.parse(computation.payload) : computation.payload || {}
    const voucher = voucherById.get(String(payload.selectedVoucherId || ''))
    if (normalize(voucher?.status) !== 'released') continue
    const matchingRows = (Array.isArray(payload.rows) ? payload.rows : []).filter((row) => aliases.has(normalize(row?.name)))
    if (!matchingRows.length) continue
    const voucherNo = payload.voucherNo || voucher?.voucherNo || `V-${voucher?.id || computation.id}`
    const voucherBatchKey = payload.voucherBatchId || voucher?.voucherBatchId || voucherNo
    const createdAt = voucher.releasedDate || voucher.updatedAt || computation.createdAt
    await query(`INSERT INTO agent_notifications
      (agent_id, event_key, type, title, message, reference_id, created_at)
      VALUES (:agentId, :eventKey, 'commission_released', 'Commission Released', :message, :referenceId, :createdAt)
      ON DUPLICATE KEY UPDATE message = VALUES(message), reference_id = VALUES(reference_id)`, {
      agentId,
      eventKey: `released-batch:${voucherBatchKey}`,
      message: `Voucher ${voucherNo} has been released.`,
      referenceId: String(computation.id),
      createdAt,
    })

    const clawback = matchingRows.reduce((total, row) => total +
      (Number(row.clawback) || Number(row.deductions?.clawback) || 0), 0)
    if (clawback > 0) {
      await query(`INSERT IGNORE INTO agent_notifications
        (agent_id, event_key, type, title, message, reference_id, created_at)
        VALUES (:agentId, :eventKey, 'clawback', 'Clawback Applied', :message, :referenceId, :createdAt)`, {
        agentId,
        eventKey: `clawback:${voucher?.id || payload.selectedVoucherId}:${computation.id}`,
        message: `${money(clawback)} clawback was applied to Voucher ${voucherNo}.`,
        referenceId: String(computation.id),
        createdAt,
      })
    }
  }
}

export async function listAgentNotifications(agentId) {
  const rows = await query(`SELECT id, type, title, message, reference_id AS referenceId,
    read_at AS readAt, created_at AS createdAt FROM agent_notifications
    WHERE agent_id = :agentId ORDER BY created_at DESC, id DESC LIMIT 50`, { agentId })
  const [count] = await query(`SELECT COUNT(*) AS unreadCount FROM agent_notifications
    WHERE agent_id = :agentId AND read_at IS NULL`, { agentId })
  return { notifications: rows, unreadCount: Number(count.unreadCount) }
}

export async function markAgentNotificationsRead(agentId, id = null) {
  await query(`UPDATE agent_notifications SET read_at = COALESCE(read_at, NOW())
    WHERE agent_id = :agentId${id ? ' AND id = :id' : ''}`, id ? { agentId, id } : { agentId })
}
