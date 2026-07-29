import { createHash } from "node:crypto";

import { query } from "./db.js";

const FAILURE_LIMIT = 10;
const WINDOW_MINUTES = 1;
let tableReady;

function ensureTable() {
  if (!tableReady) {
    tableReady = query(`
      CREATE TABLE IF NOT EXISTS login_throttles (
        account_hash CHAR(64) NOT NULL,
        failed_attempts INT UNSIGNED NOT NULL DEFAULT 0,
        window_started_at DATETIME NOT NULL,
        locked_until DATETIME NULL,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (account_hash),
        KEY login_throttles_locked_until_index (locked_until)
      )
    `).catch((error) => { tableReady = undefined; throw error; });
  }
  return tableReady;
}

const accountHash = (email) => createHash("sha256")
  .update(String(email || "").trim().toLowerCase())
  .digest("hex");

export async function assertLoginAllowed(email) {
  await ensureTable();
  const rows = await query(
    `SELECT locked_until AS lockedUntil FROM login_throttles
     WHERE account_hash = :accountHash LIMIT 1`,
    { accountHash: accountHash(email) }
  );
  if (rows[0]?.lockedUntil && new Date(rows[0].lockedUntil).getTime() > Date.now()) {
    const error = new Error("Account temporarily locked.");
    error.statusCode = 429;
    error.publicMessage = "Too many login attempts. Please wait 1 minute and try again.";
    throw error;
  }
}

export async function recordLoginFailure(email) {
  await ensureTable();
  const key = accountHash(email);
  const rows = await query(
    `SELECT failed_attempts AS failedAttempts, window_started_at AS windowStartedAt
     FROM login_throttles WHERE account_hash = :accountHash LIMIT 1`,
    { accountHash: key }
  );
  const withinWindow = rows[0]?.windowStartedAt &&
    Date.now() - new Date(rows[0].windowStartedAt).getTime() < WINDOW_MINUTES * 60 * 1000;
  const failedAttempts = withinWindow ? Number(rows[0].failedAttempts || 0) + 1 : 1;
  const lockedUntil = failedAttempts >= FAILURE_LIMIT
    ? new Date(Date.now() + WINDOW_MINUTES * 60 * 1000)
    : null;

  await query(
    `INSERT INTO login_throttles
       (account_hash, failed_attempts, window_started_at, locked_until)
     VALUES (:accountHash, :failedAttempts, NOW(), :lockedUntil)
     ON DUPLICATE KEY UPDATE failed_attempts = VALUES(failed_attempts),
       window_started_at = IF(:resetWindow, NOW(), window_started_at),
       locked_until = VALUES(locked_until)`,
    { accountHash: key, failedAttempts, lockedUntil, resetWindow: withinWindow ? 0 : 1 }
  );
}

export async function clearLoginFailures(email) {
  await ensureTable();
  await query("DELETE FROM login_throttles WHERE account_hash = :accountHash", {
    accountHash: accountHash(email),
  });
}
