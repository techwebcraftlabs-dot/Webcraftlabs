import { requireSession } from "../_lib/auth.js";
import { handleError, sendJson } from "../_lib/http.js";
import { previewNextBrsNumber } from "../_lib/numbering.js";

export default async function handler(req, res) {
  try {
    await requireSession(req);

    if (req.method !== "GET") {
      sendJson(res, 405, { error: "Method not allowed." });
      return;
    }

    sendJson(res, 200, { brsId: await previewNextBrsNumber() });
  } catch (error) {
    handleError(res, error);
  }
}
