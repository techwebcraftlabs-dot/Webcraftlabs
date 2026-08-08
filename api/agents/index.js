import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";

import { ensureColumn, query } from "../_lib/db.js";
import { agentColumnMap, agentFields, agentSelect, pickAgentPayload } from "../_lib/agents.js";
import { handleError, readJson, sendJson } from "../_lib/http.js";
import { requireSession } from "../_lib/auth.js";
import { nextHlcCode } from "../_lib/numbering.js";
import { saveTemporaryPassword } from "../_lib/temporaryCredentials.js";
import { ensureTeamsTable } from "../_lib/teams.js";

export default async function handler(req, res) {
  try {
    const session = await requireSession(req, { roles: ["Administrator", "EVP"] });
    await ensureColumn("agents", "zonal_tax_rate", "DECIMAL(5, 2) NOT NULL DEFAULT 5.00");
    await ensureColumn("agents", "pass_on_vat", "TINYINT(1) NOT NULL DEFAULT 0 AFTER zonal_tax_rate");
    await ensureColumn("agents", "bdo_account_number", "VARCHAR(100) NULL AFTER mobile_number");
    await ensureColumn("agents", "sub_team", "VARCHAR(150) NULL AFTER team");
    await ensureTeamsTable();
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
      const zonalTaxRate = Number(body.zonalTaxRate ?? 5);
      if (!Number.isFinite(zonalTaxRate) || zonalTaxRate < 0 || zonalTaxRate > 100) {
        sendJson(res, 400, { error: "Zonal tax rate must be between 0% and 100%." });
        return;
      }

      if (!body.zonalEmail) {
        sendJson(res, 400, { error: "Zonal email is required." });
        return;
      }
      const zonalEmail = String(body.zonalEmail).trim().toLowerCase();
      if (zonalEmail.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(zonalEmail)) {
        sendJson(res, 400, { error: "Enter a valid Zonal email address." });
        return;
      }

      const payload = {
        ...pickAgentPayload(body),
        zonalEmail,
        hlcCode: await nextHlcCode(),
        status: session.role === "Administrator" ? (body.status || "For Approval") : "For Approval",
        zonalTaxRate,
      };
      if (payload.subTeam) {
        const [assignment] = await query(
          `SELECT TRIM(CONCAT(COALESCE(a.first_name, ''), ' ', COALESCE(a.last_name, ''))) AS sdName
           FROM team_subteams s
           INNER JOIN teams t ON t.id = s.team_id
           LEFT JOIN agents a ON a.id = s.sd_agent_id
           WHERE t.team_name = :team AND s.subteam_name = :subTeam`,
          { team: payload.team, subTeam: payload.subTeam }
        );
        if (!assignment) {
          sendJson(res, 400, { error: "Select a valid sub-team for the chosen team." });
          return;
        }
        payload.salesDirector = assignment.sdName || null;
      }
      if (session.role === "EVP" && !["Agent", "HLC", "Sales Director"].includes(payload.role)) {
        sendJson(res, 403, { error: "EVP accounts can add Agent, HLC, or Sales Director roles only." });
        return;
      }
      const temporaryPassword = `Zr!${randomBytes(12).toString("base64url")}`;
      const passwordHash = await bcrypt.hash(temporaryPassword, 12);
      const fields = agentFields.filter((field) => Object.hasOwn(payload, field));
      const columns = fields.map((field) => agentColumnMap[field]);
      const placeholders = fields.map((field) => `:${field}`);

      const result = await query(
        `INSERT INTO agents (${columns.join(", ")}, password_hash, password_changed_at,
           password_reset_required, created_at, updated_at)
         VALUES (${placeholders.join(", ")}, :passwordHash, NOW(), 1, NOW(), NOW())`,
        { ...payload, passwordHash }
      );
      await saveTemporaryPassword(result.insertId, temporaryPassword);

      sendJson(res, 201, {
        id: String(result.insertId),
        hlcCode: payload.hlcCode,
        temporaryPassword,
        message: "Agent created.",
      });
      return;
    }

    sendJson(res, 405, { error: "Method not allowed." });
  } catch (error) {
    handleError(res, error);
  }
}
