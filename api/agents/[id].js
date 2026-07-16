import bcrypt from "bcryptjs";

import { query } from "../_lib/db.js";
import { agentColumnMap, agentSelect, pickAgentPayload } from "../_lib/agents.js";
import { handleError, readJson, sendJson } from "../_lib/http.js";

export default async function handler(req, res) {
  const { id } = req.query;

  try {
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
      const payload = pickAgentPayload(body);
      const assignments = Object.keys(payload).map(
        (field) => `${agentColumnMap[field]} = :${field}`
      );
      const params = { ...payload, id };

      if (body.password) {
        assignments.push("password_hash = :passwordHash");
        params.passwordHash = await bcrypt.hash(body.password, 10);
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
