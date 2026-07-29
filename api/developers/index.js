import { query } from "../_lib/db.js";
import { handleError, readJson, sendJson } from "../_lib/http.js";
import { requireSession } from "../_lib/auth.js";

const selectFields = `
  id,
  developer_name AS developerName,
  project,
  lts,
  developer_rate AS developerRate,
  assigned_lsd AS assignedLsd,
  project_location AS projectLocation,
  status,
  notes,
  created_at AS createdAt,
  updated_at AS updatedAt
`;

const columnMap = {
  developerName: "developer_name",
  project: "project",
  lts: "lts",
  developerRate: "developer_rate",
  assignedLsd: "assigned_lsd",
  projectLocation: "project_location",
  status: "status",
  notes: "notes",
};

function pickDeveloperPayload(body) {
  return Object.fromEntries(
    Object.keys(columnMap)
      .filter((field) => Object.hasOwn(body, field))
      .map((field) => [field, body[field] === "" ? null : body[field]])
  );
}

function parseDeveloperRate(value) {
  return Number(String(value || "").replace(/[%\s,]/g, "")) || 0;
}

export default async function handler(req, res) {
  try {
    await requireSession(req, req.method === "POST" ? { roles: ["Administrator"] } : undefined);
    if (req.method === "GET") {
      const developers = await query(
        `SELECT ${selectFields}
         FROM developers
         ORDER BY created_at DESC, id DESC`
      );

      sendJson(res, 200, developers);
      return;
    }

    if (req.method === "POST") {
      const body = await readJson(req);

      if (!body.developerName || !body.project) {
        sendJson(res, 400, { error: "Developer and Project are required." });
        return;
      }

      const payload = pickDeveloperPayload({
        ...body,
        developerRate: parseDeveloperRate(body.developerRate),
        status: body.status || "Active",
      });
      const fields = Object.keys(payload);
      const columns = fields.map((field) => columnMap[field]);
      const placeholders = fields.map((field) => `:${field}`);

      await query(
        `INSERT INTO developers (${columns.join(", ")}, created_at, updated_at)
         VALUES (${placeholders.join(", ")}, NOW(), NOW())`,
        payload
      );

      sendJson(res, 201, { message: "Developer added." });
      return;
    }

    sendJson(res, 405, { error: "Method not allowed." });
  } catch (error) {
    handleError(res, error);
  }
}

export { columnMap, parseDeveloperRate, pickDeveloperPayload, selectFields };
