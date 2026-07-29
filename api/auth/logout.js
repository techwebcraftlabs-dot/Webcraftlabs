import { destroySession } from "../_lib/auth.js";
import { handleError, sendJson } from "../_lib/http.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Method not allowed." });
    return;
  }
  try {
    await destroySession(req, res);
    sendJson(res, 200, { message: "Logged out." });
  } catch (error) {
    handleError(res, error);
  }
}
