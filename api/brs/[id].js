import { getJsonRecord, updateJsonRecord } from "../_lib/jsonTable.js";
import { handleError, readJson, sendJson } from "../_lib/http.js";

export default async function handler(req, res) {
  const { id } = req.query;

  try {
    if (req.method === "GET") {
      const record = await getJsonRecord("brs_records", id);

      if (!record) {
        sendJson(res, 404, { error: "BRS record not found." });
        return;
      }

      sendJson(res, 200, record);
      return;
    }

    if (req.method === "PUT" || req.method === "PATCH") {
      const current = await getJsonRecord("brs_records", id);

      if (!current) {
        sendJson(res, 404, { error: "BRS record not found." });
        return;
      }

      const patch = await readJson(req);
      await updateJsonRecord("brs_records", id, { ...current, ...patch });
      sendJson(res, 200, { message: "BRS updated." });
      return;
    }

    sendJson(res, 405, { error: "Method not allowed." });
  } catch (error) {
    handleError(res, error);
  }
}
