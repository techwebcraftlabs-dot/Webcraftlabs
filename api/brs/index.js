import { createJsonRecord, listJsonRecords } from "../_lib/jsonTable.js";
import { handleError, readJson, sendJson } from "../_lib/http.js";
import { requireSession } from "../_lib/auth.js";
import { nextBrsNumber } from "../_lib/numbering.js";
import { assertValidBrsRates, filterAccessibleBrs } from "../_lib/brsAccess.js";

export default async function handler(req, res) {
  try {
    const session = await requireSession(req);
    if (req.method === "GET") {
      const records = await listJsonRecords("brs_records");
      sendJson(res, 200, filterAccessibleBrs(session, records));
      return;
    }

    if (req.method === "POST") {
      const body = await readJson(req);
      assertValidBrsRates(body);

      const payload = {
        ...body,
        status: session.role === "Administrator" ? (body.status || "For Approval") : "For Approval",
        brsId: await nextBrsNumber(),
        createdByAgentId: session.agentId ? String(session.agentId) : null,
        createdByRole: session.role,
      };
      const id = await createJsonRecord("brs_records", payload);
      sendJson(res, 201, {
        id: String(id),
        brsId: payload.brsId,
        message: "BRS saved.",
      });
      return;
    }

    sendJson(res, 405, { error: "Method not allowed." });
  } catch (error) {
    handleError(res, error);
  }
}
