export function sendJson(res, status, data) {
  setSecurityHeaders(res);
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.end(JSON.stringify(data));
}

export function setSecurityHeaders(res) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
}

export async function readJson(req) {
  enforceRequestRateLimit(req);

  const maxBytes = 5 * 1024 * 1024;
  const contentLength = Number(req.headers?.["content-length"] || 0);
  if (contentLength > maxBytes) throw requestTooLargeError();

  if (req.body && typeof req.body === "object") {
    if (Buffer.byteLength(JSON.stringify(req.body)) > maxBytes) throw requestTooLargeError();
    return req.body;
  }

  if (typeof req.body === "string") {
    return JSON.parse(req.body || "{}");
  }

  const chunks = [];

  for await (const chunk of req) {
    chunks.push(chunk);
    if (chunks.reduce((total, item) => total + item.length, 0) > maxBytes) {
      throw requestTooLargeError();
    }
  }

  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

function requestTooLargeError() {
  const error = new Error("Request body too large.");
  error.statusCode = 413;
  error.publicMessage = "Uploaded data is too large.";
  return error;
}

export function handleError(res, error) {
  console.error(error);
  if (error.retryAfter) {
    res.setHeader("Retry-After", String(error.retryAfter));
  }
  sendJson(res, error.statusCode || 500, {
    error: error.publicMessage || "Server error.",
  });
}

const rateLimitBuckets = new Map();
let lastRateLimitCleanup = 0;

export function enforceRequestRateLimit(req) {
  const now = Date.now();
  const pathname = String(req.url || "").split("?")[0];
  const preset = getRateLimitPreset(pathname);
  const forwardedFor = process.env.TRUST_PROXY === "true"
    ? req.headers?.["x-forwarded-for"]
    : "";
  const clientIp = String(forwardedFor || req.socket?.remoteAddress || "unknown")
    .split(",")[0]
    .trim();
  const key = `${preset.scope}:${clientIp}`;
  const current = rateLimitBuckets.get(key);

  if (!current || now >= current.resetAt) {
    rateLimitBuckets.set(key, { count: 1, resetAt: now + preset.windowMs });
  } else if (current.count >= preset.limit) {
    const error = new Error("Rate limit exceeded.");
    error.statusCode = 429;
    error.publicMessage = "Too many requests. Please wait and try again.";
    error.retryAfter = Math.max(1, Math.ceil((current.resetAt - now) / 1000));
    throw error;
  } else {
    current.count += 1;
  }

  if (now - lastRateLimitCleanup > 60000) {
    lastRateLimitCleanup = now;
    for (const [bucketKey, bucket] of rateLimitBuckets) {
      if (now >= bucket.resetAt) rateLimitBuckets.delete(bucketKey);
    }
  }
}

function getRateLimitPreset(pathname) {
  if (pathname.includes("/auth/login")) {
    return { scope: "login", limit: 10, windowMs: 60 * 1000 };
  }

  if (pathname.includes("/password")) {
    return { scope: "password", limit: 10, windowMs: 15 * 60 * 1000 };
  }

  if (pathname.includes("/photo") || pathname.includes("/attachments")) {
    return { scope: "upload", limit: 20, windowMs: 60 * 1000 };
  }

  return { scope: "write", limit: 60, windowMs: 60 * 1000 };
}
