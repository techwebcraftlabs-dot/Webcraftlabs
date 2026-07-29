import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

import { query } from "./db.js";
import { ensureAdminAccountsTable } from "./adminAccounts.js";

const isProduction = () => process.env.NODE_ENV === "production";
const cookieName = () => isProduction() ? "__Host-zonal_session" : "zonal_session";
const SESSION_LIFETIME_MS = 8 * 60 * 60 * 1000;
let tableReady;

function ensureSessionTable() {
  if (!tableReady) {
    tableReady = (async () => {
      await ensureAdminAccountsTable();
      await query(`
      CREATE TABLE IF NOT EXISTS auth_sessions (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        token_hash CHAR(64) NOT NULL,
        agent_id BIGINT UNSIGNED NULL,
        admin_account_id BIGINT UNSIGNED NULL,
        role VARCHAR(50) NOT NULL,
        expires_at DATETIME NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY auth_sessions_token_hash_unique (token_hash),
        KEY auth_sessions_expires_at_index (expires_at),
        CONSTRAINT auth_sessions_agent_id_foreign
          FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE,
        CONSTRAINT auth_sessions_admin_account_id_foreign
          FOREIGN KEY (admin_account_id) REFERENCES admin_accounts(id) ON DELETE CASCADE
      )
      `);
      const columns = await query(`
        SELECT COLUMN_NAME AS columnName
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'auth_sessions'
          AND COLUMN_NAME = 'admin_account_id'
      `);
      if (!columns.length) {
        await query("ALTER TABLE auth_sessions ADD COLUMN admin_account_id BIGINT UNSIGNED NULL AFTER agent_id");
        await query("CREATE INDEX auth_sessions_admin_account_index ON auth_sessions (admin_account_id)");
      }
    })().catch((error) => {
      tableReady = undefined;
      throw error;
    });
  }
  return tableReady;
}

const hashToken = (token) => createHash("sha256").update(token).digest("hex");

function getCookie(req, name) {
  const cookies = String(req.headers?.cookie || "").split(";");
  for (const cookie of cookies) {
    const [key, ...valueParts] = cookie.trim().split("=");
    if (key === name) return decodeURIComponent(valueParts.join("="));
  }
  return "";
}

function cookieHeader(value, req, maxAge) {
  const secure =
    isProduction() ||
    String(req.headers?.["x-forwarded-proto"] || "").includes("https");
  return `${cookieName()}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${secure ? "; Secure" : ""}`;
}

export async function createSession(req, res, { agentId = null, adminAccountId = null, role }) {
  await ensureSessionTable();
  await query("DELETE FROM auth_sessions WHERE expires_at <= NOW()");
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_LIFETIME_MS);
  await query(
    `INSERT INTO auth_sessions (token_hash, agent_id, admin_account_id, role, expires_at)
     VALUES (:tokenHash, :agentId, :adminAccountId, :role, :expiresAt)`,
    { tokenHash: hashToken(token), agentId, adminAccountId, role, expiresAt }
  );
  res.setHeader("Set-Cookie", cookieHeader(token, req, Math.floor(SESSION_LIFETIME_MS / 1000)));
}

export async function getSession(req) {
  await ensureSessionTable();
  const token = getCookie(req, cookieName());
  if (!token) return null;
  const rows = await query(
    `SELECT s.agent_id AS agentId, s.admin_account_id AS adminAccountId,
            CASE WHEN s.agent_id IS NULL THEN s.role ELSE a.role END AS role,
            a.status,
            a.password_reset_required AS passwordResetRequired,
            a.first_name AS firstName, a.last_name AS lastName, a.team,
            admin.display_name AS adminDisplayName,
            admin.email AS adminEmail
     FROM auth_sessions s
     LEFT JOIN agents a ON a.id = s.agent_id
     LEFT JOIN admin_accounts admin ON admin.id = s.admin_account_id
     WHERE s.token_hash = :tokenHash AND s.expires_at > NOW() LIMIT 1`,
    { tokenHash: hashToken(token) }
  );
  const session = rows[0];
  if (!session || (session.agentId && session.status !== "Active")) return null;
  if (session.role === "Administrator" && !session.adminAccountId) return null;
  return session;
}

export async function requireSession(req, { roles, selfId } = {}) {
  const session = await getSession(req);
  if (!session) throw publicError(401, "Please log in again.");
  if (roles && !roles.includes(session.role)) throw publicError(403, "You do not have permission to perform this action.");
  if (selfId && session.role !== "Administrator" && String(session.agentId) !== String(selfId)) {
    throw publicError(403, "You can only access your own profile.");
  }
  if (session.passwordResetRequired && !isAllowedDuringPasswordReset(req, session)) {
    throw publicError(403, "You must change your temporary password before continuing.");
  }
  verifyRequestOrigin(req);
  return session;
}

function isAllowedDuringPasswordReset(req, session) {
  const pathname = new URL(req.url || "/", "http://localhost").pathname;
  if (pathname === "/api/auth/session" || pathname === "/api/auth/logout") return true;
  if (pathname === `/api/agents/${session.agentId}/password`) return true;
  if (req.method === "GET" && pathname === `/api/agents/${session.agentId}/photo`) return true;
  return req.method === "GET" && pathname === `/api/agents/${session.agentId}`;
}

export async function destroySession(req, res) {
  await ensureSessionTable();
  const token = getCookie(req, cookieName());
  if (token) await query("DELETE FROM auth_sessions WHERE token_hash = :tokenHash", { tokenHash: hashToken(token) });
  res.setHeader("Set-Cookie", cookieHeader("", req, 0));
}

export async function destroyOtherAgentSessions(req, agentId) {
  await ensureSessionTable();
  const token = getCookie(req, cookieName());
  if (!token) return;
  await query(
    `DELETE FROM auth_sessions
     WHERE agent_id = :agentId AND token_hash <> :currentTokenHash`,
    { agentId, currentTokenHash: hashToken(token) }
  );
}

export async function destroyOtherAdminSessions(req, adminAccountId) {
  await ensureSessionTable();
  const token = getCookie(req, cookieName());
  if (!token) return;
  await query(
    `DELETE FROM auth_sessions
     WHERE admin_account_id = :adminAccountId AND token_hash <> :currentTokenHash`,
    { adminAccountId, currentTokenHash: hashToken(token) }
  );
}

function verifyRequestOrigin(req) {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return;
  const origin = req.headers?.origin;
  const host = req.headers?.host;
  const frontendOrigin = process.env.FRONTEND_ORIGIN;
  const fetchSite = String(req.headers?.["sec-fetch-site"] || "").toLowerCase();
  if (fetchSite === "cross-site") throw publicError(403, "Invalid request origin.");
  if ((!origin || !host) && isProduction()) throw publicError(403, "Missing request origin.");
  if (!origin || !host) return;
  if (frontendOrigin && origin === frontendOrigin) return;
  const originHost = new URL(origin).host;
  const left = Buffer.from(originHost);
  const right = Buffer.from(String(host));
  if (left.length !== right.length || !timingSafeEqual(left, right)) {
    throw publicError(403, "Invalid request origin.");
  }
}

function publicError(statusCode, publicMessage) {
  const error = new Error(publicMessage);
  error.statusCode = statusCode;
  error.publicMessage = publicMessage;
  return error;
}
