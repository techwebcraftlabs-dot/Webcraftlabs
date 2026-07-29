import { createJsonRecord, listJsonRecords } from "../_lib/jsonTable.js";
import { handleError, readJson, sendJson } from "../_lib/http.js";
import { requireSession } from "../_lib/auth.js";
import { filterCommissionVouchers, getCommissionScope } from "../_lib/commissionAccess.js";

export default async function handler(req, res) {
  try {
    const session = await requireSession(req);
    if (req.method === "GET") {
      const scope = await getCommissionScope(session);
      const vouchers = await listJsonRecords("commission_vouchers");
      sendJson(res, 200, filterCommissionVouchers(vouchers, scope));
      return;
    }

    if (req.method === "POST") {
      await requireSession(req, { roles: ["Administrator", "HLC", "EVP"] });
      const payload = await readJson(req);
      const releasedDate = String(payload.status || "").trim().toLowerCase() === "released"
        ? new Date().toISOString()
        : null;
      const id = await createJsonRecord("commission_vouchers", { ...payload, releasedDate });
      sendJson(res, 201, { id: String(id), message: "Voucher saved." });
      return;
    }

    sendJson(res, 405, { error: "Method not allowed." });
  } catch (error) {
    handleError(res, error);
  }
}
