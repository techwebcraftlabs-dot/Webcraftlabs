import { createJsonRecord, listJsonRecords } from "../_lib/jsonTable.js";
import { handleError, readJson, sendJson } from "../_lib/http.js";
import { requireSession } from "../_lib/auth.js";
import { filterCommissionComputations, getCommissionScope } from "../_lib/commissionAccess.js";

export default async function handler(req, res) {
  try {
    const session = await requireSession(req);
    if (req.method === "GET") {
      const scope = await getCommissionScope(session);
      const [computations, vouchers] = await Promise.all([
        listJsonRecords("commission_computations"),
        listJsonRecords("commission_vouchers"),
      ]);
      sendJson(res, 200, filterCommissionComputations(computations, scope, vouchers));
      return;
    }

    if (req.method === "POST") {
      await requireSession(req, { roles: ["Administrator", "HLC", "EVP"] });
      const payload = await readJson(req);
      const id = await createJsonRecord("commission_computations", payload);
      sendJson(res, 201, { id: String(id), message: "Computation saved." });
      return;
    }

    sendJson(res, 405, { error: "Method not allowed." });
  } catch (error) {
    handleError(res, error);
  }
}
