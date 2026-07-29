import bcrypt from "bcryptjs";

import { query } from "../_lib/db.js";
import { loadLocalEnv } from "../_lib/env.js";
import { handleError, readJson, sendJson } from "../_lib/http.js";
import { agentSelect } from "../_lib/agents.js";
import { createSession } from "../_lib/auth.js";
import { assertLoginAllowed, clearLoginFailures, recordLoginFailure } from "../_lib/loginThrottle.js";
import { ensureAdminAccountsTable } from "../_lib/adminAccounts.js";

const dummyPasswordHash = bcrypt.hash("not-a-real-zonal-password", 12);

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
    if (String(email).length > 254 || Buffer.byteLength(String(password), "utf8") > 72) {
      sendJson(res, 400, { error: "Invalid email or password." });
      return;
    }

    await assertLoginAllowed(email);

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
      if (!matchesHash) {
        await recordLoginFailure(email);
        sendJson(res, 401, { error: "Incorrect email or password." });
        return;
      }

      if (agent.status !== "Active") {
        sendJson(res, 403, { error: "Your account is still for approval." });
        return;
      }

      delete agent.passwordHash;
      await createSession(req, res, {
        agentId: agent.id,
        role: agent.role || "Agent",
      });
      await clearLoginFailures(email);

      sendJson(res, 200, {
        role: agent.role || "Agent",
        fullName: `${agent.firstName || ""} ${agent.lastName || ""}`.trim(),
        agentId: agent.id,
        mustChangePassword: Boolean(agent.passwordResetRequired),
      });
      return;
    }

    await ensureAdminAccountsTable();
    const adminRows = await query(
      `SELECT id, password_hash AS passwordHash, display_name AS displayName
       FROM admin_accounts
       WHERE email = :email
       LIMIT 1`,
      { email }
    );
    const admin = adminRows[0];
    const matchesAdminHash = admin?.passwordHash
      ? await bcrypt.compare(password, admin.passwordHash)
      : await bcrypt.compare(String(password), await dummyPasswordHash);

    if (admin && matchesAdminHash) {
      await createSession(req, res, {
        adminAccountId: admin.id,
        role: "Administrator",
      });
      await clearLoginFailures(email);
      sendJson(res, 200, {
        role: "Administrator",
        fullName: admin.displayName || "Administrator",
      });
      return;
    }

    await recordLoginFailure(email);
    sendJson(res, 401, { error: "Incorrect email or password." });
  } catch (error) {
    handleError(res, error);
  }
}
