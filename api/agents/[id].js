import bcrypt from "bcryptjs";

import { ensureColumn, query } from "../_lib/db.js";
import { agentColumnMap, agentSelect, pickAgentPayload } from "../_lib/agents.js";
import { handleError, readJson, sendJson } from "../_lib/http.js";
import { requireSession } from "../_lib/auth.js";

export default async function handler(req, res) {
  const { id } = req.query;

  try {
    const session = await requireSession(req, { selfId: id });
    await ensureColumn("agents", "zonal_tax_rate", "DECIMAL(5, 2) NOT NULL DEFAULT 5.00");
    await ensureColumn("agents", "bdo_account_number", "VARCHAR(100) NULL AFTER mobile_number");
    if (req.method === "GET") {
      const rows = await query(
        `SELECT ${agentSelect}
         FROM agents
         WHERE id = :id
         LIMIT 1`,
        { id }
      );

      if (!rows[0]) {
        sendJson(res, 404, { error: "Agent not found." });
        return;
      }

      sendJson(res, 200, rows[0]);
      return;
    }

    if (req.method === "PUT" || req.method === "PATCH") {
      const body = await readJson(req);
      if (Object.hasOwn(body, "zonalTaxRate")) {
        const zonalTaxRate = Number(body.zonalTaxRate);
        if (!Number.isFinite(zonalTaxRate) || zonalTaxRate < 0 || zonalTaxRate > 100) {
          sendJson(res, 400, { error: "Zonal tax rate must be between 0% and 100%." });
          return;
        }
      }
      const personalFields = new Set([
        "firstName", "lastName", "middleName", "personalEmail", "mobileNumber", "bdoAccountNumber",
        "address", "birthDate", "birthPlace", "civilStatus", "gender",
      ]);
      const safeBody = session.role === "Administrator"
        ? Object.fromEntries(
            Object.entries(body).filter(([field]) => field !== "hlcCode")
          )
        : Object.fromEntries(Object.entries(body).filter(([field]) => personalFields.has(field)));
      const payload = pickAgentPayload(safeBody);
      const assignments = Object.keys(payload).map(
        (field) => `${agentColumnMap[field]} = :${field}`
      );
      const params = { ...payload, id };

      if (session.role === "Administrator" && body.password) {
        assignments.push("password_hash = :passwordHash");
        assignments.push("password_changed_at = NOW()");
        assignments.push("password_reset_required = 1");
        params.passwordHash = await bcrypt.hash(body.password, 12);
      }

      if (assignments.length === 0) {
        sendJson(res, 400, { error: "No agent fields to update." });
        return;
      }

      await query(
        `UPDATE agents
         SET ${assignments.join(", ")}, updated_at = NOW()
         WHERE id = :id`,
        params
      );

      sendJson(res, 200, { message: "Agent updated." });
      return;
    }

    sendJson(res, 405, { error: "Method not allowed." });
  } catch (error) {
    handleError(res, error);
  }
}
