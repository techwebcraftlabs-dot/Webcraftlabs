import { getSession } from "../_lib/auth.js";
import { handleError, sendJson } from "../_lib/http.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    sendJson(res, 405, { error: "Method not allowed." });
    return;
  }
  try {
    const session = await getSession(req);
    if (!session) {
      sendJson(res, 401, { error: "Session expired." });
      return;
    }
    sendJson(res, 200, {
      role: session.role,
      agentId: session.agentId ? String(session.agentId) : null,
      fullName: session.agentId
        ? `${session.firstName || ""} ${session.lastName || ""}`.trim()
        : session.adminDisplayName || "Administrator",
      email: session.adminEmail || null,
      mustChangePassword: Boolean(session.passwordResetRequired),
    });
  } catch (error) {
    handleError(res, error);
  }
}
