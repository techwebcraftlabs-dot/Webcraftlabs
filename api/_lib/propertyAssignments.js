import { query } from "./db.js";

let tableReady;
export function ensurePropertyAssignmentsTable() {
  if (!tableReady) {
    tableReady = query(`
      CREATE TABLE IF NOT EXISTS property_agent_assignments (
        property_id BIGINT UNSIGNED NOT NULL,
        agent_id BIGINT UNSIGNED NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (property_id, agent_id),
        KEY property_agent_assignments_agent_index (agent_id),
        CONSTRAINT property_agent_assignments_property_foreign FOREIGN KEY (property_id) REFERENCES property_listings(id) ON DELETE CASCADE,
        CONSTRAINT property_agent_assignments_agent_foreign FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE
      )
    `).catch((error) => { tableReady = undefined; throw error; });
  }
  return tableReady;
}
