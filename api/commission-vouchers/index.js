import { createJsonRecord, listJsonRecords } from "../_lib/jsonTable.js";
import { handleError, readJson, sendJson } from "../_lib/http.js";

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      sendJson(res, 200, await listJsonRecords("commission_vouchers"));
      return;
    }

    if (req.method === "POST") {
      const payload = await readJson(req);
      const id = await createJsonRecord("commission_vouchers", payload);
      sendJson(res, 201, { id: String(id), message: "Voucher saved." });
      return;
    }

    sendJson(res, 405, { error: "Method not allowed." });
  } catch (error) {
    handleError(res, error);
  }
}
