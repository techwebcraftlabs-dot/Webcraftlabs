import { query } from "../../_lib/db.js";
import { handleError, sendJson } from "../../_lib/http.js";
import { ensurePropertyAssignmentsTable } from "../../_lib/propertyAssignments.js";

export default async function handler(req, res) {
  try {
    if (req.method !== "GET") return sendJson(res, 405, { error: "Method not allowed." });
    await ensurePropertyAssignmentsTable();
    const rows = await query(`
      SELECT a.id, CONCAT_WS(' ', a.first_name, a.middle_name, a.last_name) AS name,
             a.role, a.mobile_number AS phone, a.zonal_email AS email,
             a.locality AS area, a.facebook_url AS facebookUrl
      FROM property_agent_assignments pa
      INNER JOIN agents a ON a.id = pa.agent_id
      WHERE pa.property_id = :id AND a.status = 'Active'
      ORDER BY a.first_name, a.last_name
    `, { id: req.query.id });
    sendJson(res, 200, rows.map((row) => ({
      ...row,
      id: String(row.id),
      socials: {
        facebook: row.facebookUrl || "",
      },
    })));
  } catch (error) { handleError(res, error); }
}
