import { query } from "./db.js";

let sequenceTablePromise;

function ensureSequenceTable() {
  if (!sequenceTablePromise) {
    sequenceTablePromise = query(`
      CREATE TABLE IF NOT EXISTS document_sequences (
        sequence_key VARCHAR(50) NOT NULL,
        current_value INT UNSIGNED NOT NULL DEFAULT 0,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (sequence_key)
      )
    `).catch((error) => {
      sequenceTablePromise = undefined;
      throw error;
    });
  }

  return sequenceTablePromise;
}

async function nextSequenceValue(sequenceKey) {
  await ensureSequenceTable();
  const result = await query(
    `INSERT INTO document_sequences (sequence_key, current_value)
     VALUES (:sequenceKey, LAST_INSERT_ID(1))
     ON DUPLICATE KEY UPDATE current_value = LAST_INSERT_ID(current_value + 1)`,
    { sequenceKey }
  );
  return Number(result.insertId);
}

async function previewSequenceValue(sequenceKey) {
  await ensureSequenceTable();
  const rows = await query(
    `SELECT current_value AS currentValue
     FROM document_sequences
     WHERE sequence_key = :sequenceKey
     LIMIT 1`,
    { sequenceKey }
  );
  return Number(rows[0]?.currentValue || 0) + 1;
}

export async function nextHlcCode(date = new Date()) {
  const year = String(date.getFullYear());
  const sequence = await nextSequenceValue(`hlc:${year}`);
  return `${year}${String(sequence).padStart(2, "0")}`;
}

export async function previewNextHlcCode(date = new Date()) {
  const year = String(date.getFullYear());
  const sequence = await previewSequenceValue(`hlc:${year}`);
  return `${year}${String(sequence).padStart(2, "0")}`;
}

export async function nextBrsNumber(date = new Date()) {
  const year = String(date.getFullYear());
  const sequence = await nextSequenceValue(`brs:${year}`);
  return `${year.slice(-2)}${String(sequence).padStart(2, "0")}`;
}

export async function previewNextBrsNumber(date = new Date()) {
  const year = String(date.getFullYear());
  const sequence = await previewSequenceValue(`brs:${year}`);
  return `${year.slice(-2)}${String(sequence).padStart(2, "0")}`;
}
