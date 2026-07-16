import { query } from "./db.js";

export async function listJsonRecords(tableName) {
  const rows = await query(
    `SELECT id, payload, created_at AS createdAt, updated_at AS updatedAt
     FROM ${tableName}
     ORDER BY created_at DESC, id DESC`
  );

  return rows.map(toRecord);
}

export async function getJsonRecord(tableName, id) {
  const rows = await query(
    `SELECT id, payload, created_at AS createdAt, updated_at AS updatedAt
     FROM ${tableName}
     WHERE id = :id
     LIMIT 1`,
    { id }
  );

  return rows[0] ? toRecord(rows[0]) : null;
}

export async function createJsonRecord(tableName, payload) {
  const result = await query(
    `INSERT INTO ${tableName} (payload, created_at, updated_at)
     VALUES (:payload, NOW(), NOW())`,
    { payload: JSON.stringify(payload) }
  );

  return result.insertId;
}

export async function updateJsonRecord(tableName, id, payload) {
  await query(
    `UPDATE ${tableName}
     SET payload = :payload, updated_at = NOW()
     WHERE id = :id`,
    { id, payload: JSON.stringify(payload) }
  );
}

export async function deleteJsonRecord(tableName, id) {
  await query(`DELETE FROM ${tableName} WHERE id = :id`, { id });
}

function toRecord(row) {
  const payload =
    typeof row.payload === "string" ? JSON.parse(row.payload) : row.payload;

  return {
    id: String(row.id),
    ...(payload || {}),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}
