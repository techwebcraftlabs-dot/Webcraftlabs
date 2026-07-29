import {
  deleteJsonRecord,
  getJsonRecord,
  updateJsonRecord,
} from "../_lib/jsonTable.js";
import { enforceRequestRateLimit, handleError, readJson, sendJson } from "../_lib/http.js";
import { requireSession } from "../_lib/auth.js";
import { assertVoucherInScope, getCommissionScope } from "../_lib/commissionAccess.js";

export default async function handler(req, res) {
  const { id } = req.query;

  try {
    const session = await requireSession(req, { roles: ["Administrator", "HLC", "EVP"] });
    if (req.method === "PUT" || req.method === "PATCH") {
      const current = await getJsonRecord("commission_vouchers", id);

      if (!current) {
        sendJson(res, 404, { error: "Voucher not found." });
        return;
      }

      assertVoucherInScope(current, await getCommissionScope(session));

      const patch = await readJson(req);
      const nextStatus = String(patch.status ?? current.status ?? "").trim().toLowerCase();
      const wasReleased = String(current.status || "").trim().toLowerCase() === "released";
      const releasedDate = nextStatus === "released"
        ? (wasReleased && current.releasedDate ? current.releasedDate : new Date().toISOString())
        : null;
      await updateJsonRecord("commission_vouchers", id, { ...current, ...patch, releasedDate });
      sendJson(res, 200, { message: "Voucher updated.", releasedDate });
      return;
    }

    if (req.method === "DELETE") {
      enforceRequestRateLimit(req);
      const current = await getJsonRecord("commission_vouchers", id);
      if (!current) {
        sendJson(res, 404, { error: "Voucher not found." });
        return;
      }
      assertVoucherInScope(current, await getCommissionScope(session));
      await deleteJsonRecord("commission_vouchers", id);
      sendJson(res, 200, { message: "Voucher deleted." });
      return;
    }

    sendJson(res, 405, { error: "Method not allowed." });
  } catch (error) {
    handleError(res, error);
  }
}
