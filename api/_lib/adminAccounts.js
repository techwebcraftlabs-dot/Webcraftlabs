import { query } from "./db.js";

let tableReady;

export function ensureAdminAccountsTable() {
  if (!tableReady) {
    tableReady = query(`
      CREATE TABLE IF NOT EXISTS admin_accounts (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        email VARCHAR(255) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        display_name VARCHAR(150) NOT NULL DEFAULT 'Administrator',
        password_changed_at DATETIME NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY admin_accounts_email_unique (email)
      )
    `).catch((error) => {
      tableReady = undefined;
      throw error;
    });
  }
  return tableReady;
}
