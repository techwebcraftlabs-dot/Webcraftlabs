import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";

import { query } from "../../_lib/db.js";
import { enforceRequestRateLimit, handleError, sendJson } from "../../_lib/http.js";
import { requireSession } from "../../_lib/auth.js";
import { saveTemporaryPassword } from "../../_lib/temporaryCredentials.js";

function createTemporaryPassword() {
  return `Zr!${randomBytes(9).toString("base64url")}`;
}

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Method not allowed." });
    return;
  }

  try {
    await requireSession(req, { roles: ["Administrator"] });
    enforceRequestRateLimit(req);
    const rows = await query(
      `SELECT id FROM agents WHERE id = :id LIMIT 1`,
      { id }
    );

    if (!rows[0]) {
      sendJson(res, 404, { error: "Agent not found." });
      return;
    }

    const temporaryPassword = createTemporaryPassword();
    const passwordHash = await bcrypt.hash(temporaryPassword, 12);

    await query(
      `UPDATE agents
       SET password_hash = :passwordHash,
           password_changed_at = NOW(), password_reset_required = 1,
           updated_at = NOW()
       WHERE id = :id`,
      { id, passwordHash }
    );
    await query("DELETE FROM auth_sessions WHERE agent_id = :id", { id });
    await saveTemporaryPassword(id, temporaryPassword);

    sendJson(res, 200, {
      message: "Password reset successfully.",
      temporaryPassword,
    });
  } catch (error) {
    handleError(res, error);
  }
}
