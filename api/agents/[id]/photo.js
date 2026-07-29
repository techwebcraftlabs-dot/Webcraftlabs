import { ensureAgentPhotosTable } from "../../_lib/agentPhotos.js";
import { query } from "../../_lib/db.js";
import { handleError, readJson, sendJson, setSecurityHeaders } from "../../_lib/http.js";
import { requireSession } from "../../_lib/auth.js";
import { hasValidFileSignature, SAFE_IMAGE_TYPES } from "../../_lib/fileValidation.js";

const MAX_PHOTO_SIZE = 2 * 1024 * 1024;

export default async function handler(req, res) {
  const { id } = req.query;

  try {
    await requireSession(
      req,
      req.method === "PUT" ? { roles: ["Administrator"] } : { selfId: id }
    );
    await ensureAgentPhotosTable();

    if (req.method === "GET") {
      const rows = await query(
        `SELECT mime_type AS mimeType, file_data AS fileData
         FROM agent_photos WHERE agent_id = :id LIMIT 1`,
        { id }
      );

      if (!rows[0]) {
        sendJson(res, 404, { error: "Profile photo not found." });
        return;
      }

      res.statusCode = 200;
      setSecurityHeaders(res);
      res.setHeader("Content-Type", rows[0].mimeType);
      res.setHeader("Cache-Control", "private, max-age=3600");
      res.setHeader("X-Content-Type-Options", "nosniff");
      res.end(rows[0].fileData);
      return;
    }

    if (req.method === "PUT") {
      const body = await readJson(req);
      const mimeType = String(body.mimeType || "");
      const fileData = Buffer.from(String(body.data || ""), "base64");

      if (!SAFE_IMAGE_TYPES.has(mimeType)) {
        sendJson(res, 400, { error: "Use a JPG, PNG, or WebP profile photo." });
        return;
      }
      if (!fileData.length || fileData.length > MAX_PHOTO_SIZE) {
        sendJson(res, 400, { error: "Profile photo must be 2 MB or smaller." });
        return;
      }
      if (!hasValidFileSignature(fileData, mimeType)) {
        sendJson(res, 400, { error: "The uploaded file content does not match its image type." });
        return;
      }

      await query(
        `INSERT INTO agent_photos (agent_id, mime_type, file_data)
         VALUES (:id, :mimeType, :fileData)
         ON DUPLICATE KEY UPDATE mime_type = VALUES(mime_type), file_data = VALUES(file_data)`,
        { id, mimeType, fileData }
      );
      sendJson(res, 200, { message: "Profile photo saved." });
      return;
    }

    sendJson(res, 405, { error: "Method not allowed." });
  } catch (error) {
    handleError(res, error);
  }
}
