import { ensureBrsAttachmentsTable } from "../../../_lib/brsAttachments.js";
import { query } from "../../../_lib/db.js";
import { getJsonRecord } from "../../../_lib/jsonTable.js";
import { handleError, readJson, sendJson } from "../../../_lib/http.js";
import { requireSession } from "../../../_lib/auth.js";
import { assertBrsAccess } from "../../../_lib/brsAccess.js";
import { hasValidExtension, hasValidFileSignature, SAFE_ATTACHMENT_TYPES } from "../../../_lib/fileValidation.js";

const MAX_FILE_SIZE = 3 * 1024 * 1024;

export default async function handler(req, res) {
  const { id } = req.query;

  try {
    const session = await requireSession(req);
    await ensureBrsAttachmentsTable();

    const record = await getJsonRecord("brs_records", id);
    if (!record) {
      sendJson(res, 404, { error: "BRS record not found." });
      return;
    }
    assertBrsAccess(session, record);

    if (req.method === "GET") {
      const rows = await query(
        `SELECT id, file_name AS fileName, mime_type AS mimeType,
                file_size AS fileSize, created_at AS createdAt
         FROM brs_attachments WHERE brs_id = :id
         ORDER BY created_at ASC, id ASC`,
        { id }
      );
      sendJson(res, 200, rows.map((row) => ({ ...row, id: String(row.id) })));
      return;
    }

    if (req.method === "POST") {
      const payload = await readJson(req);
      const fileName = String(payload.fileName || "").trim().slice(0, 255);
      const mimeType = String(payload.mimeType || "application/octet-stream").slice(0, 255);
      const fileData = Buffer.from(String(payload.data || ""), "base64");

      if (!fileName || !fileData.length) {
        sendJson(res, 400, { error: "Please select a valid file." });
        return;
      }
      if (fileData.length > MAX_FILE_SIZE) {
        sendJson(res, 413, { error: "Each attachment must be 3 MB or smaller." });
        return;
      }
      if (!SAFE_ATTACHMENT_TYPES.has(mimeType) ||
          !hasValidExtension(fileName, mimeType) ||
          !hasValidFileSignature(fileData, mimeType)) {
        sendJson(res, 400, { error: "Only genuine PDF, JPG, PNG, or WebP attachments are allowed." });
        return;
      }

      const result = await query(
        `INSERT INTO brs_attachments
          (brs_id, file_name, mime_type, file_size, file_data)
         VALUES (:brsId, :fileName, :mimeType, :fileSize, :fileData)`,
        { brsId: id, fileName, mimeType, fileSize: fileData.length, fileData }
      );
      sendJson(res, 201, { id: String(result.insertId), fileName });
      return;
    }

    sendJson(res, 405, { error: "Method not allowed." });
  } catch (error) {
    handleError(res, error);
  }
}
