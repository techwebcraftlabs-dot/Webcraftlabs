import { getJsonRecord, updateJsonRecord } from "../_lib/jsonTable.js";
import { handleError, readJson, sendJson } from "../_lib/http.js";

export default async function handler(req, res) {
  const { id } = req.query;

  try {
    if (req.method === "PUT" || req.method === "PATCH") {
      const current = await getJsonRecord("commission_computations", id);

      if (!current) {
        sendJson(res, 404, { error: "Computation not found." });
        return;
      }

      const patch = await readJson(req);
      await updateJsonRecord("commission_computations", id, {
        ...current,
        ...patch,
      });
      sendJson(res, 200, { message: "Computation updated." });
      return;
    }

    sendJson(res, 405, { error: "Method not allowed." });
  } catch (error) {
    handleError(res, error);
  }
}
