import { getJsonRecord, updateJsonRecord } from "../_lib/jsonTable.js";
import { handleError, readJson, sendJson } from "../_lib/http.js";
import { requireSession } from "../_lib/auth.js";
import { assertBrsAccess, assertValidBrsRates } from "../_lib/brsAccess.js";

export default async function handler(req, res) {
  const { id } = req.query;

  try {
    const session = await requireSession(req);
    if (req.method === "GET") {
      const record = await getJsonRecord("brs_records", id);

      if (!record) {
        sendJson(res, 404, { error: "BRS record not found." });
        return;
      }

      assertBrsAccess(session, record);

      sendJson(res, 200, record);
      return;
    }

    if (req.method === "PUT" || req.method === "PATCH") {
      const current = await getJsonRecord("brs_records", id);

      if (!current) {
        sendJson(res, 404, { error: "BRS record not found." });
        return;
      }


      assertBrsAccess(session, current);

      if (session.role !== "Administrator") {
        const error = new Error("Only administrators can update submitted BRS records.");
        error.statusCode = 403;
        error.publicMessage = "Submitted BRS records are read-only while waiting for administrator review.";
        throw error;
      }

      const patch = await readJson(req);
      const { createdByAgentId, createdByRole, brsId } = current;
      const updated = {
        ...current,
        ...patch,
        createdByAgentId,
        createdByRole,
        brsId,
      };
      const nextStatus = String(updated.status || "For Approval");
      updated.approvedAt = nextStatus === "Approved"
        ? (current.status === "Approved" && current.approvedAt ? current.approvedAt : new Date().toISOString())
        : null;
      updated.approvedByAgentId = nextStatus === "Approved" ? session.agentId : null;
      assertValidBrsRates(updated);
      await updateJsonRecord("brs_records", id, updated);
      sendJson(res, 200, { message: "BRS updated." });
      return;
    }

    sendJson(res, 405, { error: "Method not allowed." });
  } catch (error) {
    handleError(res, error);
  }
}
