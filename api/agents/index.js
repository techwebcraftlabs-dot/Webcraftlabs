import bcrypt from "bcryptjs";

import { query } from "../_lib/db.js";
import { agentColumnMap, agentFields, agentSelect, pickAgentPayload } from "../_lib/agents.js";
import { handleError, readJson, sendJson } from "../_lib/http.js";

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const agents = await query(
        `SELECT ${agentSelect}
         FROM agents
         ORDER BY created_at DESC, id DESC`
      );

      sendJson(res, 200, agents);
      return;
    }

    if (req.method === "POST") {
      const body = await readJson(req);

      if (!body.zonalEmail || !body.password) {
        sendJson(res, 400, { error: "Zonal email and password are required." });
        return;
      }

      const payload = {
        ...pickAgentPayload(body),
        status: body.status || "For Approval",
      };
      const passwordHash = await bcrypt.hash(body.password, 10);
      const fields = agentFields.filter((field) => Object.hasOwn(payload, field));
      const columns = fields.map((field) => agentColumnMap[field]);
      const placeholders = fields.map((field) => `:${field}`);

      await query(
        `INSERT INTO agents (${columns.join(", ")}, password_hash, created_at, updated_at)
         VALUES (${placeholders.join(", ")}, :passwordHash, NOW(), NOW())`,
        { ...payload, passwordHash }
      );

      sendJson(res, 201, { message: "Agent created." });
      return;
    }

    sendJson(res, 405, { error: "Method not allowed." });
  } catch (error) {
    handleError(res, error);
  }
}
