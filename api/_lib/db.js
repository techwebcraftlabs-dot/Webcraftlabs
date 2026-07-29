import mysql from "mysql2/promise";

import { loadLocalEnv } from "./env.js";

let pool;
const ensuredColumns = new Set();

export function getPool() {
  loadLocalEnv();

  if (!pool) {
    pool = mysql.createPool({
      host: process.env.MYSQL_HOST,
      port: Number(process.env.MYSQL_PORT || 3306),
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      waitForConnections: true,
      connectionLimit: 5,
      namedPlaceholders: true,
      ssl:
        process.env.MYSQL_SSL === "true"
          ? { rejectUnauthorized: true }
          : undefined,
    });
  }

  return pool;
}

export async function query(sql, params) {
  const [rows] = await getPool().execute(sql, params);
  return rows;
}

// Railway's MySQL version does not support `ADD COLUMN IF NOT EXISTS`.
// Check the information schema first so schema upgrades remain idempotent.
export async function ensureColumn(tableName, columnName, definition) {
  const cacheKey = `${tableName}.${columnName}`;
  if (ensuredColumns.has(cacheKey)) return;

  const rows = await query(
    `SELECT 1
     FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = :tableName
       AND COLUMN_NAME = :columnName
     LIMIT 1`,
    { tableName, columnName }
  );

  if (!rows.length) {
    await query(`ALTER TABLE \`${tableName}\` ADD COLUMN \`${columnName}\` ${definition}`);
  }

  ensuredColumns.add(cacheKey);
}
