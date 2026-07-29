import { query } from "./db.js";

let tableReady;

export function ensureAgentPhotosTable() {
  if (!tableReady) {
    tableReady = query(`
      CREATE TABLE IF NOT EXISTS agent_photos (
        agent_id BIGINT UNSIGNED NOT NULL,
        mime_type VARCHAR(100) NOT NULL,
        file_data LONGBLOB NOT NULL,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (agent_id),
        CONSTRAINT agent_photos_agent_id_foreign
          FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE
      )
    `).catch((error) => {
      tableReady = undefined;
      throw error;
    });
  }

  return tableReady;
}
