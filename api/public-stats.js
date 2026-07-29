import { query } from "./_lib/db.js";
import { handleError, sendJson } from "./_lib/http.js";

export default async function handler(req, res) {
  try {
    if (req.method !== "GET") {
      sendJson(res, 405, { error: "Method not allowed." });
      return;
    }

    const [stats] = await query(`
      SELECT
        (SELECT COUNT(*) FROM agents WHERE status = 'Active') AS activeAgents,
        (SELECT COUNT(DISTINCT developer_name) FROM developers WHERE status = 'Active') AS developers,
        (SELECT COUNT(*) FROM property_listings) AS properties
    `);

    sendJson(res, 200, {
      activeAgents: Number(stats.activeAgents) || 0,
      developers: Number(stats.developers) || 0,
      properties: Number(stats.properties) || 0,
      customerSatisfaction: 98,
    });
  } catch (error) {
    handleError(res, error);
  }
}
