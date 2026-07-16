import {
  deleteJsonRecord,
  getJsonRecord,
  updateJsonRecord,
} from "../_lib/jsonTable.js";
import { handleError, readJson, sendJson } from "../_lib/http.js";

export default async function handler(req, res) {
  const { id } = req.query;

  try {
    if (req.method === "PUT" || req.method === "PATCH") {
      const current = await getJsonRecord("commission_vouchers", id);

      if (!current) {
        sendJson(res, 404, { error: "Voucher not found." });
        return;
      }

      const patch = await readJson(req);
      await updateJsonRecord("commission_vouchers", id, { ...current, ...patch });
      sendJson(res, 200, { message: "Voucher updated." });
      return;
    }

    if (req.method === "DELETE") {
      await deleteJsonRecord("commission_vouchers", id);
      sendJson(res, 200, { message: "Voucher deleted." });
      return;
    }

    sendJson(res, 405, { error: "Method not allowed." });
  } catch (error) {
    handleError(res, error);
  }
}
