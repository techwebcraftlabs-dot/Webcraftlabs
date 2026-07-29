import { query } from "./db.js";

let tableReady;

export function ensureBrsAttachmentsTable() {
  if (!tableReady) {
    tableReady = query(`
      CREATE TABLE IF NOT EXISTS brs_attachments (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        brs_id BIGINT UNSIGNED NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        mime_type VARCHAR(255) NOT NULL DEFAULT 'application/octet-stream',
        file_size INT UNSIGNED NOT NULL,
        file_data LONGBLOB NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY brs_attachments_brs_id_index (brs_id),
        CONSTRAINT brs_attachments_brs_id_foreign
          FOREIGN KEY (brs_id) REFERENCES brs_records(id) ON DELETE CASCADE
      )
    `).catch((error) => {
      tableReady = undefined;
      throw error;
    });
  }

  return tableReady;
}
