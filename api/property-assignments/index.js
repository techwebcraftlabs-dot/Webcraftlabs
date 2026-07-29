import { requireSession } from "../_lib/auth.js";
import { query } from "../_lib/db.js";
import { handleError, readJson, sendJson } from "../_lib/http.js";
import { ensurePropertyAssignmentsTable } from "../_lib/propertyAssignments.js";

export default async function handler(req, res) {
  try {
    const session = await requireSession(req, { roles: ["Agent"] });
    await ensurePropertyAssignmentsTable();

    if (req.method === "GET") {
      const rows = await query(`SELECT property_id AS propertyId FROM property_agent_assignments WHERE agent_id = :agentId`, { agentId: session.agentId });
      sendJson(res, 200, rows.map((row) => String(row.propertyId)));
      return;
    }

    if (req.method === "POST" || req.method === "DELETE") {
      const { propertyId } = await readJson(req);
      if (!propertyId) return sendJson(res, 400, { error: "Property is required." });
      if (req.method === "POST") {
        await query(`INSERT IGNORE INTO property_agent_assignments (property_id, agent_id) VALUES (:propertyId, :agentId)`, { propertyId, agentId: session.agentId });
      } else {
        await query(`DELETE FROM property_agent_assignments WHERE property_id = :propertyId AND agent_id = :agentId`, { propertyId, agentId: session.agentId });
      }
      sendJson(res, 200, { message: req.method === "POST" ? "Property selected." : "Property removed." });
      return;
    }
    sendJson(res, 405, { error: "Method not allowed." });
  } catch (error) { handleError(res, error); }
}
