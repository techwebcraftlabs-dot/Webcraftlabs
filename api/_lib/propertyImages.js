import { query } from "./db.js";

let tableReady;

export function ensurePropertyImagesTable() {
  if (!tableReady) {
    tableReady = query(`
      CREATE TABLE IF NOT EXISTS property_images (
        property_id BIGINT UNSIGNED NOT NULL,
        mime_type VARCHAR(100) NOT NULL,
        file_data LONGBLOB NOT NULL,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (property_id),
        CONSTRAINT property_images_property_id_foreign
          FOREIGN KEY (property_id) REFERENCES property_listings(id) ON DELETE CASCADE
      )
    `).catch((error) => {
      tableReady = undefined;
      throw error;
    });
  }
  return tableReady;
}
