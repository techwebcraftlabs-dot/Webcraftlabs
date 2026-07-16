import bcrypt from "bcryptjs";

import { query } from "../_lib/db.js";
import { loadLocalEnv } from "../_lib/env.js";
import { handleError, readJson, sendJson } from "../_lib/http.js";
import { agentSelect } from "../_lib/agents.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Method not allowed." });
    return;
  }

  try {
    loadLocalEnv();

    const { email, password } = await readJson(req);

    if (!email || !password) {
      sendJson(res, 400, { error: "Please enter email and password." });
      return;
    }

    const rows = await query(
      `SELECT ${agentSelect}, password_hash AS passwordHash
       FROM agents
       WHERE zonal_email = :email
       LIMIT 1`,
      { email }
    );

    const agent = rows[0];

    if (agent) {
      const matchesHash = agent.passwordHash
        ? await bcrypt.compare(password, agent.passwordHash)
        : false;
      const matchesLegacyPassword = agent.password && agent.password === password;

      if (!matchesHash && !matchesLegacyPassword) {
        sendJson(res, 401, { error: "Incorrect email or password." });
        return;
      }

      if (agent.status !== "Active") {
        sendJson(res, 403, { error: "Your account is still for approval." });
        return;
      }

      delete agent.passwordHash;

      sendJson(res, 200, {
        role: agent.role || "Agent",
        fullName: `${agent.firstName || ""} ${agent.lastName || ""}`.trim(),
        agentId: agent.id,
        agentData: agent,
      });
      return;
    }

    if (
      process.env.ADMIN_EMAIL &&
      process.env.ADMIN_PASSWORD &&
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      sendJson(res, 200, {
        role: "Administrator",
        fullName: "Administrator",
      });
      return;
    }

    sendJson(res, 401, { error: "Incorrect email or password." });
  } catch (error) {
    handleError(res, error);
  }
}
