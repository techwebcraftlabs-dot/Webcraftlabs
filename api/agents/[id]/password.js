import bcrypt from "bcryptjs";

import { query } from "../../_lib/db.js";
import { handleError, readJson, sendJson } from "../../_lib/http.js";
import { destroyOtherAgentSessions, requireSession } from "../../_lib/auth.js";
import { deleteTemporaryPassword } from "../../_lib/temporaryCredentials.js";

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method !== "PATCH") {
    sendJson(res, 405, { error: "Method not allowed." });
    return;
  }

  try {
    await requireSession(req, { selfId: id });
    const { currentPassword, newPassword } = await readJson(req);

    if (!currentPassword || !newPassword) {
      sendJson(res, 400, { error: "Current and new passwords are required." });
      return;
    }

    if (String(newPassword).length < 12) {
      sendJson(res, 400, { error: "New password must be at least 12 characters." });
      return;
    }
    if (Buffer.byteLength(String(newPassword), "utf8") > 72) {
      sendJson(res, 400, { error: "New password is too long." });
      return;
    }
    if (newPassword === currentPassword) {
      sendJson(res, 400, { error: "New password must be different from the current password." });
      return;
    }

    const rows = await query(
      `SELECT password_hash AS passwordHash
       FROM agents WHERE id = :id LIMIT 1`,
      { id }
    );
    const agent = rows[0];

    if (!agent) {
      sendJson(res, 404, { error: "Agent not found." });
      return;
    }

    const matchesHash = agent.passwordHash
      ? await bcrypt.compare(currentPassword, agent.passwordHash)
      : false;
    if (!matchesHash) {
      sendJson(res, 401, { error: "Current password is incorrect." });
      return;
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await query(
      `UPDATE agents
       SET password_hash = :passwordHash,
           password_changed_at = NOW(), password_reset_required = 0,
           updated_at = NOW()
       WHERE id = :id`,
      { id, passwordHash }
    );
    await destroyOtherAgentSessions(req, id);
    await deleteTemporaryPassword(id);

    sendJson(res, 200, { message: "Password changed successfully." });
  } catch (error) {
    handleError(res, error);
  }
}
