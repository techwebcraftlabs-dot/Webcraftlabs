import { ensurePropertyImagesTable } from "../../_lib/propertyImages.js";
import { query } from "../../_lib/db.js";
import { handleError, readJson, sendJson, setSecurityHeaders } from "../../_lib/http.js";
import { requireSession } from "../../_lib/auth.js";
import { hasValidFileSignature, SAFE_IMAGE_TYPES } from "../../_lib/fileValidation.js";

const MAX_IMAGE_SIZE = 2 * 1024 * 1024;

export default async function handler(req, res) {
  const { id } = req.query;
  try {
    if (req.method === "PUT") {
      await requireSession(req, { roles: ["Administrator", "EVP"] });
    }
    await ensurePropertyImagesTable();

    if (req.method === "GET") {
      const rows = await query(`SELECT mime_type AS mimeType, file_data AS fileData FROM property_images WHERE property_id = :id LIMIT 1`, { id });
      if (!rows[0]) return sendJson(res, 404, { error: "Property image not found." });
      res.statusCode = 200;
      setSecurityHeaders(res);
      res.setHeader("Content-Type", rows[0].mimeType);
      res.setHeader("Cache-Control", "public, max-age=3600");
      res.setHeader("X-Content-Type-Options", "nosniff");
      res.end(rows[0].fileData);
      return;
    }

    if (req.method === "PUT") {
      const body = await readJson(req);
      const mimeType = String(body.mimeType || "");
      const fileData = Buffer.from(String(body.data || ""), "base64");
      if (!SAFE_IMAGE_TYPES.has(mimeType)) return sendJson(res, 400, { error: "Use a JPG, PNG, or WebP property image." });
      if (!fileData.length || fileData.length > MAX_IMAGE_SIZE) return sendJson(res, 400, { error: "Property image must be 2 MB or smaller." });
      if (!hasValidFileSignature(fileData, mimeType)) return sendJson(res, 400, { error: "The uploaded file content does not match its image type." });
      await query(`INSERT INTO property_images (property_id, mime_type, file_data) VALUES (:id, :mimeType, :fileData) ON DUPLICATE KEY UPDATE mime_type = VALUES(mime_type), file_data = VALUES(file_data)`, { id, mimeType, fileData });
      sendJson(res, 200, { message: "Property image saved." });
      return;
    }
    sendJson(res, 405, { error: "Method not allowed." });
  } catch (error) { handleError(res, error); }
}
