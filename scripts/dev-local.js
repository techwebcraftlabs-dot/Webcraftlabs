import { createServer } from "node:http";

import { createServer as createViteServer } from "vite";

const routes = [
  ["POST", /^\/api\/auth\/login$/, () => import("../api/auth/login.js")],
  ["GET", /^\/api\/dashboard\/stats$/, () => import("../api/dashboard/stats.js")],
  ["GET", /^\/api\/agents$/, () => import("../api/agents/index.js")],
  ["POST", /^\/api\/agents$/, () => import("../api/agents/index.js")],
  ["GET", /^\/api\/agents\/([^/]+)$/, () => import("../api/agents/[id].js")],
  ["PUT", /^\/api\/agents\/([^/]+)$/, () => import("../api/agents/[id].js")],
  ["PATCH", /^\/api\/agents\/([^/]+)$/, () => import("../api/agents/[id].js")],
  ["GET", /^\/api\/developers$/, () => import("../api/developers/index.js")],
  ["POST", /^\/api\/developers$/, () => import("../api/developers/index.js")],
  ["PUT", /^\/api\/developers\/([^/]+)$/, () => import("../api/developers/[id].js")],
  ["DELETE", /^\/api\/developers\/([^/]+)$/, () => import("../api/developers/[id].js")],
  ["GET", /^\/api\/brs$/, () => import("../api/brs/index.js")],
  ["POST", /^\/api\/brs$/, () => import("../api/brs/index.js")],
  ["GET", /^\/api\/brs\/([^/]+)$/, () => import("../api/brs/[id].js")],
  ["PUT", /^\/api\/brs\/([^/]+)$/, () => import("../api/brs/[id].js")],
  ["PATCH", /^\/api\/brs\/([^/]+)$/, () => import("../api/brs/[id].js")],
  ["GET", /^\/api\/commission-vouchers$/, () => import("../api/commission-vouchers/index.js")],
  ["POST", /^\/api\/commission-vouchers$/, () => import("../api/commission-vouchers/index.js")],
  ["PATCH", /^\/api\/commission-vouchers\/([^/]+)$/, () => import("../api/commission-vouchers/[id].js")],
  ["DELETE", /^\/api\/commission-vouchers\/([^/]+)$/, () => import("../api/commission-vouchers/[id].js")],
  ["GET", /^\/api\/commission-computations$/, () => import("../api/commission-computations/index.js")],
  ["POST", /^\/api\/commission-computations$/, () => import("../api/commission-computations/index.js")],
  ["PUT", /^\/api\/commission-computations\/([^/]+)$/, () => import("../api/commission-computations/[id].js")],
];

const port = Number(process.env.PORT || 5173);

const vite = await createViteServer({
  appType: "spa",
  server: {
    hmr: {
      port: 24679,
    },
    middlewareMode: true,
  },
});

const server = createServer(async (req, res) => {
  const { pathname } = new URL(req.url || "/", `http://localhost:${port}`);
  const route = routes.find(([method, pattern]) => {
    return method === req.method && pattern.test(pathname || "");
  });

  if (route) {
    const [, pattern, loadHandler] = route;
    const match = (pathname || "").match(pattern);
    req.query = match?.[1] ? { id: match[1] } : {};

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

    return;
  }

  vite.middlewares(req, res);
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`Port ${port} is already in use. Stop the old dev server and run npm run dev again.`);
    process.exit(1);
  }

  throw error;
});

server.listen(port, () => {
  console.log(`Local app ready at http://localhost:${port}`);
});
