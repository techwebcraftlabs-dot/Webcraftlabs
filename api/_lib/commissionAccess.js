import { query } from "./db.js";
import { listJsonRecords } from "./jsonTable.js";

const normalizeName = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

async function getAgentAliases(session) {
  if (!session.agentId) return new Set();

  const rows = await query(
    `SELECT first_name AS firstName, middle_name AS middleName, last_name AS lastName
     FROM agents WHERE id = :id LIMIT 1`,
    { id: session.agentId }
  );
  const agent = rows[0] || session;
  const aliases = [
    [agent.firstName, agent.middleName, agent.lastName].filter(Boolean).join(" "),
    [agent.firstName, agent.lastName].filter(Boolean).join(" "),
  ].map(normalizeName).filter(Boolean);

  return new Set(aliases);
}

function isAgentRow(row, aliases) {
  return aliases.has(normalizeName(row?.name));
}

export async function getCommissionScope(session) {
  if (session.role === "Administrator") {
    return { isAdministrator: true, aliases: new Set(), brsIds: new Set() };
  }

  const aliases = await getAgentAliases(session);
  const brsRecords = await listJsonRecords("brs_records");
  const brsIds = new Set(
    brsRecords
      .filter((record) =>
        (Array.isArray(record.rateDistribution) ? record.rateDistribution : [])
          .some((row) => isAgentRow(row, aliases))
      )
      .map((record) => String(record.id))
  );

  return { isAdministrator: false, aliases, brsIds };
}

export function filterCommissionVouchers(vouchers, scope) {
  if (scope.isAdministrator) return vouchers;
  return vouchers.filter((voucher) =>
    scope.brsIds.has(String(voucher?.brsDocId)) &&
    normalizeName(voucher?.status) !== "hold"
  );
}

export function filterCommissionComputations(computations, scope, vouchers = []) {
  if (scope.isAdministrator) return computations;

  const heldVoucherIds = new Set();
  const heldBatchIds = new Set();
  vouchers.forEach((voucher) => {
    if (normalizeName(voucher?.status) !== "hold") return;
    if (voucher?.id) heldVoucherIds.add(String(voucher.id));
    if (voucher?.voucherBatchId) heldBatchIds.add(String(voucher.voucherBatchId));
  });

  return computations
    .filter((item) =>
      scope.brsIds.has(String(item?.brsDocId)) &&
      !heldVoucherIds.has(String(item?.selectedVoucherId)) &&
      !heldBatchIds.has(String(item?.voucherBatchId))
    )
    .map((item) => ({
      ...item,
      rows: (Array.isArray(item.rows) ? item.rows : [])
        .filter((row) => isAgentRow(row, scope.aliases)),
    }));
}

export function assertVoucherInScope(voucher, scope) {
  if (scope.isAdministrator || scope.brsIds.has(String(voucher?.brsDocId))) return;
  const error = new Error("Commission voucher access denied.");
  error.statusCode = 403;
  error.publicMessage = "You can only access vouchers for sales where you are included.";
  throw error;
}
