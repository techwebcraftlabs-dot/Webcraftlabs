import bcrypt from "bcryptjs";

import { query } from "../_lib/db.js";
import { destroyOtherAdminSessions, requireSession } from "../_lib/auth.js";
import { handleError, readJson, sendJson } from "../_lib/http.js";

export default async function handler(req, res) {
  if (req.method !== "PATCH") {
    sendJson(res, 405, { error: "Method not allowed." });
    return;
  }

  try {
    const session = await requireSession(req, { roles: ["Administrator"] });
    if (!session.adminAccountId) {
      sendJson(res, 403, { error: "No administrator account is linked to this session." });
      return;
    }

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
      "SELECT password_hash AS passwordHash FROM admin_accounts WHERE id = :id LIMIT 1",
      { id: session.adminAccountId }
    );
    const account = rows[0];
    if (!account || !(await bcrypt.compare(currentPassword, account.passwordHash))) {
      sendJson(res, 401, { error: "Current password is incorrect." });
      return;
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await query(
      `UPDATE admin_accounts
       SET password_hash = :passwordHash, password_changed_at = NOW(), updated_at = NOW()
       WHERE id = :id`,
      { id: session.adminAccountId, passwordHash }
    );
    await destroyOtherAdminSessions(req, session.adminAccountId);
    sendJson(res, 200, { message: "Password changed successfully." });
  } catch (error) {
    handleError(res, error);
  }
}
