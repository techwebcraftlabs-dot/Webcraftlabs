import { query } from "../_lib/db.js";
import { handleError, sendJson } from "../_lib/http.js";
import { requireSession } from "../_lib/auth.js";

export default async function handler(req, res) {
  try {
    await requireSession(req);
    if (req.method !== "GET") {
      sendJson(res, 405, { error: "Method not allowed." });
      return;
    }

    const agents = await query(`
      SELECT id, hlc_code AS hlcCode, first_name AS firstName,
             middle_name AS middleName, last_name AS lastName, role,
             recruiter, sales_director AS salesDirector, evp, locality, team
      FROM agents
      WHERE status = 'Active'
      ORDER BY first_name, last_name
    `);
    sendJson(res, 200, agents);
  } catch (error) {
    handleError(res, error);
  }
}
