import { query } from "../_lib/db.js";
import { handleError, readJson, sendJson } from "../_lib/http.js";
import { columnMap, pickDeveloperPayload } from "./index.js";

export default async function handler(req, res) {
  const { id } = req.query;

  try {
    if (req.method === "PUT") {
      const body = await readJson(req);
      const payload = pickDeveloperPayload({
        ...body,
        developerRate: Number(body.developerRate) || 0,
      });
      const assignments = Object.keys(payload).map(
        (field) => `${columnMap[field]} = :${field}`
      );

      if (assignments.length === 0) {
        sendJson(res, 400, { error: "No developer fields to update." });
        return;
      }

      await query(
        `UPDATE developers
         SET ${assignments.join(", ")}, updated_at = NOW()
         WHERE id = :id`,
        { ...payload, id }
      );

      sendJson(res, 200, { message: "Developer updated." });
      return;
    }

    if (req.method === "DELETE") {
      await query("DELETE FROM developers WHERE id = :id", { id });
      sendJson(res, 200, { message: "Developer deleted." });
      return;
    }

    sendJson(res, 405, { error: "Method not allowed." });
  } catch (error) {
    handleError(res, error);
  }
}
