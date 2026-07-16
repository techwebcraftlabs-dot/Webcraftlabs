import mysql from "mysql2/promise";

import { loadLocalEnv } from "./env.js";

let pool;

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
