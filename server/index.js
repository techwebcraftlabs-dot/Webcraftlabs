import { createServer } from "node:http";

const routes = [
  ["POST", /^\/api\/auth\/login$/, () => import("../api/auth/login.js")],
  ["GET", /^\/api\/auth\/session$/, () => import("../api/auth/session.js")],
  ["POST", /^\/api\/auth\/logout$/, () => import("../api/auth/logout.js")],
  ["PATCH", /^\/api\/admin\/password$/, () => import("../api/admin/password.js")],
  ["GET", /^\/api\/dashboard\/stats$/, () => import("../api/dashboard/stats.js")],
  ["GET", /^\/api\/notifications$/, () => import("../api/notifications/index.js")],
  ["PATCH", /^\/api\/notifications$/, () => import("../api/notifications/index.js")],
  ["GET", /^\/api\/public-stats$/, () => import("../api/public-stats.js")],
  ["GET", /^\/api\/properties$/, () => import("../api/properties/index.js")],
  ["POST", /^\/api\/properties$/, () => import("../api/properties/index.js")],
  ["GET", /^\/api\/properties\/([^/]+)\/image$/, () => import("../api/properties/[id]/image.js")],
  ["PUT", /^\/api\/properties\/([^/]+)\/image$/, () => import("../api/properties/[id]/image.js")],
  ["GET", /^\/api\/properties\/([^/]+)\/agents$/, () => import("../api/properties/[id]/agents.js")],
  ["GET", /^\/api\/property-assignments$/, () => import("../api/property-assignments/index.js")],
  ["POST", /^\/api\/property-assignments$/, () => import("../api/property-assignments/index.js")],
  ["DELETE", /^\/api\/property-assignments$/, () => import("../api/property-assignments/index.js")],
  ["GET", /^\/api\/agents$/, () => import("../api/agents/index.js")],
  ["POST", /^\/api\/agents$/, () => import("../api/agents/index.js")],
  ["GET", /^\/api\/ayuda-loans$/, () => import("../api/ayuda-loans/index.js")],
  ["POST", /^\/api\/ayuda-loans$/, () => import("../api/ayuda-loans/index.js")],
  ["GET", /^\/api\/agents\/next-hlc-code$/, () => import("../api/agents/next-hlc-code.js")],
  ["GET", /^\/api\/agents\/tax-rates$/, () => import("../api/agents/tax-rates.js")],
  ["GET", /^\/api\/agents\/brs-options$/, () => import("../api/agents/brs-options.js")],
  ["GET", /^\/api\/agents\/([^/]+)$/, () => import("../api/agents/[id].js")],
  ["PUT", /^\/api\/agents\/([^/]+)$/, () => import("../api/agents/[id].js")],
  ["PATCH", /^\/api\/agents\/([^/]+)$/, () => import("../api/agents/[id].js")],
  ["PATCH", /^\/api\/agents\/([^/]+)\/password$/, () => import("../api/agents/[id]/password.js")],
  ["POST", /^\/api\/agents\/([^/]+)\/reset-password$/, () => import("../api/agents/[id]/reset-password.js")],
  ["GET", /^\/api\/agents\/([^/]+)\/temporary-password$/, () => import("../api/agents/[id]/temporary-password.js")],
  ["GET", /^\/api\/agents\/([^/]+)\/photo$/, () => import("../api/agents/[id]/photo.js")],
  ["PUT", /^\/api\/agents\/([^/]+)\/photo$/, () => import("../api/agents/[id]/photo.js")],
  ["GET", /^\/api\/developers$/, () => import("../api/developers/index.js")],
  ["POST", /^\/api\/developers$/, () => import("../api/developers/index.js")],
  ["PUT", /^\/api\/developers\/([^/]+)$/, () => import("../api/developers/[id].js")],
  ["DELETE", /^\/api\/developers\/([^/]+)$/, () => import("../api/developers/[id].js")],
  ["GET", /^\/api\/teams$/, () => import("../api/teams/index.js")],
  ["POST", /^\/api\/teams$/, () => import("../api/teams/index.js")],
  ["GET", /^\/api\/teams\/([^/]+)$/, () => import("../api/teams/[id].js")],
  ["PUT", /^\/api\/teams\/([^/]+)$/, () => import("../api/teams/[id].js")],
  ["DELETE", /^\/api\/teams\/([^/]+)$/, () => import("../api/teams/[id].js")],
  ["GET", /^\/api\/brs$/, () => import("../api/brs/index.js")],
  ["POST", /^\/api\/brs$/, () => import("../api/brs/index.js")],
  ["GET", /^\/api\/brs\/next-number$/, () => import("../api/brs/next-number.js")],
  ["GET", /^\/api\/brs\/([^/]+)$/, () => import("../api/brs/[id].js")],
  ["PUT", /^\/api\/brs\/([^/]+)$/, () => import("../api/brs/[id].js")],
  ["PATCH", /^\/api\/brs\/([^/]+)$/, () => import("../api/brs/[id].js")],
  ["GET", /^\/api\/brs\/([^/]+)\/attachments$/, () => import("../api/brs/[id]/attachments/index.js")],
  ["POST", /^\/api\/brs\/([^/]+)\/attachments$/, () => import("../api/brs/[id]/attachments/index.js")],
  ["GET", /^\/api\/brs\/([^/]+)\/attachments\/([^/]+)$/, () => import("../api/brs/[id]/attachments/[attachmentId].js")],
  ["GET", /^\/api\/commission-vouchers$/, () => import("../api/commission-vouchers/index.js")],
  ["POST", /^\/api\/commission-vouchers$/, () => import("../api/commission-vouchers/index.js")],
  ["PATCH", /^\/api\/commission-vouchers\/([^/]+)$/, () => import("../api/commission-vouchers/[id].js")],
  ["DELETE", /^\/api\/commission-vouchers\/([^/]+)$/, () => import("../api/commission-vouchers/[id].js")],
  ["GET", /^\/api\/commission-computations$/, () => import("../api/commission-computations/index.js")],
  ["POST", /^\/api\/commission-computations$/, () => import("../api/commission-computations/index.js")],
  ["PUT", /^\/api\/commission-computations\/([^/]+)$/, () => import("../api/commission-computations/[id].js")],
];

const port = Number(process.env.PORT || 3000);

const server = createServer(async (req, res) => {
  const { pathname } = new URL(req.url || "/", "http://localhost");
  const route = routes.find(([method, pattern]) => method === req.method && pattern.test(pathname));

  if (!route) {
    res.statusCode = 404;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Not found." }));
    return;
  }

  const [, pattern, loadHandler] = route;
  const match = pathname.match(pattern);
  req.query = match?.[1]
    ? { id: match[1], ...(match[2] ? { attachmentId: match[2] } : {}) }
    : {};

  try {
    const { default: handler } = await loadHandler();
    await handler(req, res);
  } catch (error) {
    console.error(error);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: error.message || "Server error." }));
    }
  }
});

server.listen(port, () => console.log(`Zonal API listening on ${port}`));
