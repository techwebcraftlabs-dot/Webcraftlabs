import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto'

import { query } from './db.js'
import { loadLocalEnv } from './env.js'

let tableReady

function ensureTable() {
  if (!tableReady) tableReady = query(`CREATE TABLE IF NOT EXISTS agent_temporary_credentials (
    agent_id BIGINT UNSIGNED NOT NULL,
    encrypted_password TEXT NOT NULL,
    iv CHAR(24) NOT NULL,
    auth_tag CHAR(32) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (agent_id),
    CONSTRAINT agent_temporary_credentials_agent_foreign FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE
  )`).catch((error) => { tableReady = undefined; throw error })
  return tableReady
}

function encryptionKey() {
  loadLocalEnv()
  const secret = process.env.CREDENTIAL_ENCRYPTION_KEY || process.env.ADMIN_PASSWORD
  if (!secret) throw new Error('Credential encryption key is not configured.')
  return createHash('sha256').update(secret).digest()
}

export async function saveTemporaryPassword(agentId, password) {
  await ensureTable()
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', encryptionKey(), iv)
  const encrypted = Buffer.concat([cipher.update(String(password), 'utf8'), cipher.final()])
  await query(`INSERT INTO agent_temporary_credentials (agent_id, encrypted_password, iv, auth_tag)
    VALUES (:agentId, :encryptedPassword, :iv, :authTag)
    ON DUPLICATE KEY UPDATE encrypted_password = VALUES(encrypted_password), iv = VALUES(iv), auth_tag = VALUES(auth_tag), updated_at = NOW()`, {
    agentId, encryptedPassword: encrypted.toString('base64'), iv: iv.toString('base64'), authTag: cipher.getAuthTag().toString('hex'),
  })
}

export async function getTemporaryPassword(agentId) {
  await ensureTable()
  const [row] = await query(`SELECT encrypted_password AS encryptedPassword, iv, auth_tag AS authTag FROM agent_temporary_credentials WHERE agent_id = :agentId`, { agentId })
  if (!row) return null
  const decipher = createDecipheriv('aes-256-gcm', encryptionKey(), Buffer.from(row.iv, 'base64'))
  decipher.setAuthTag(Buffer.from(row.authTag, 'hex'))
  return Buffer.concat([decipher.update(Buffer.from(row.encryptedPassword, 'base64')), decipher.final()]).toString('utf8')
}

export async function deleteTemporaryPassword(agentId) {
  await ensureTable()
  await query('DELETE FROM agent_temporary_credentials WHERE agent_id = :agentId', { agentId })
}
