import { requireSession } from "../_lib/auth.js";
import { handleError, sendJson } from "../_lib/http.js";
import { previewNextHlcCode } from "../_lib/numbering.js";

export default async function handler(req, res) {
  try {
    await requireSession(req, { roles: ["Administrator", "EVP"] });

    if (req.method !== "GET") {
      sendJson(res, 405, { error: "Method not allowed." });
      return;
    }

    sendJson(res, 200, { hlcCode: await previewNextHlcCode() });
  } catch (error) {
    handleError(res, error);
  }
}
