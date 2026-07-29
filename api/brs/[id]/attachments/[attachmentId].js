import { ensureBrsAttachmentsTable } from "../../../_lib/brsAttachments.js";
import { query } from "../../../_lib/db.js";
import { handleError, sendJson, setSecurityHeaders } from "../../../_lib/http.js";
import { requireSession } from "../../../_lib/auth.js";
import { getJsonRecord } from "../../../_lib/jsonTable.js";
import { assertBrsAccess } from "../../../_lib/brsAccess.js";

export default async function handler(req, res) {
  const { id, attachmentId } = req.query;

  try {
    const session = await requireSession(req);
    if (req.method !== "GET") {
      sendJson(res, 405, { error: "Method not allowed." });
      return;
    }

    await ensureBrsAttachmentsTable();
    const record = await getJsonRecord("brs_records", id);
    if (!record) {
      sendJson(res, 404, { error: "BRS record not found." });
      return;
    }
    assertBrsAccess(session, record);
    const rows = await query(
      `SELECT file_name AS fileName, mime_type AS mimeType, file_data AS fileData
       FROM brs_attachments
       WHERE id = :attachmentId AND brs_id = :brsId LIMIT 1`,
      { attachmentId, brsId: id }
    );
    const file = rows[0];

    if (!file) {
      sendJson(res, 404, { error: "Attachment not found." });
      return;
    }

    const safeName = file.fileName.replace(/[\r\n"\\]/g, "_");
    const safeInlineType =
      file.mimeType === "application/pdf" ||
      String(file.mimeType || "").startsWith("image/");
    res.statusCode = 200;
    setSecurityHeaders(res);
    res.setHeader("Content-Type", file.mimeType || "application/octet-stream");
    res.setHeader("Content-Disposition", `${safeInlineType ? "inline" : "attachment"}; filename="${safeName}"`);
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Content-Security-Policy", "sandbox; default-src 'none'; img-src 'self' data:; style-src 'unsafe-inline'");
    res.end(file.fileData);
  } catch (error) {
    handleError(res, error);
  }
}
