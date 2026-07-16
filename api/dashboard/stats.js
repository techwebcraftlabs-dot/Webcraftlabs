import { query } from "../_lib/db.js";
import { handleError, sendJson } from "../_lib/http.js";

export default async function handler(req, res) {
  try {
    if (req.method !== "GET") {
      sendJson(res, 405, { error: "Method not allowed." });
      return;
    }

    const [stats] = await query(`
      SELECT
        (SELECT COUNT(*) FROM agents WHERE status = 'Active') AS totalAgents,
        (SELECT COUNT(*) FROM agents WHERE status = 'Active') AS activeAgents,
        (SELECT COUNT(DISTINCT developer_name) FROM developers) AS totalDevelopers,
        (SELECT COUNT(*) FROM developers WHERE status = 'Active') AS activeProjects,
        (SELECT COUNT(DISTINCT project) FROM developers) AS totalProperties,
        (SELECT COUNT(*) FROM agents WHERE status = 'For Approval') AS forApproval
    `);

    sendJson(res, 200, Object.fromEntries(
      Object.entries(stats).map(([key, value]) => [key, Number(value) || 0])
    ));
  } catch (error) {
    handleError(res, error);
  }
}
