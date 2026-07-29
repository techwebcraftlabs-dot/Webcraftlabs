import { query } from "../_lib/db.js";
import { handleError, sendJson } from "../_lib/http.js";
import { requireSession } from "../_lib/auth.js";
import { getCommissionScope, filterCommissionComputations, filterCommissionVouchers } from "../_lib/commissionAccess.js";
import { listJsonRecords } from "../_lib/jsonTable.js";

export default async function handler(req, res) {
  try {
    const session = await requireSession(req);
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
        (SELECT COUNT(*) FROM property_listings) AS totalProperties,
        (SELECT COUNT(*) FROM agents WHERE status = 'For Approval') AS forApproval
    `);

    const databaseStats = Object.fromEntries(
      Object.entries(stats).map(([key, value]) => [key, Number(value) || 0])
    );
    const scope = await getCommissionScope(session);
    const [allBrs, allVouchers, allComputations] = await Promise.all([
      listJsonRecords("brs_records"),
      listJsonRecords("commission_vouchers"),
      listJsonRecords("commission_computations"),
    ]);
    const accessibleBrs = scope.isAdministrator ? allBrs : allBrs.filter((record) => scope.brsIds.has(String(record.id)));
    const vouchers = filterCommissionVouchers(allVouchers, scope);
    const computations = filterCommissionComputations(allComputations, scope, allVouchers);
    const bookedBrs = accessibleBrs.filter((record) => normalize(record.status) !== "rejected");
    const latestComputations = getLatestComputations(computations);
    const now = new Date();
    const url = new URL(req.url || "/api/dashboard/stats", "http://localhost");
    const period = url.searchParams.get("period") === "week" ? "week" : "month";
    const selectedYear = validYear(url.searchParams.get("year"), now.getUTCFullYear());
    const selectedMonth = validMonth(url.searchParams.get("month"), now.getUTCMonth() + 1);
    const selectedWeek = validWeek(url.searchParams.get("week"), now);
    const filteredBrs = url.searchParams.has("period")
      ? bookedBrs.filter((record) => isDateInPeriod(getBrsDate(record), period, selectedYear, selectedMonth, selectedWeek))
      : bookedBrs;
    const periodComputations = latestComputations.filter((item) => {
      const date = getComputationDate(item, vouchers);
      return isDateInPeriod(date, period, selectedYear, selectedMonth, selectedWeek);
    });
    const commissionRows = latestComputations.flatMap(getRows);
    const periodRows = periodComputations.flatMap(getRows);
    const dashboardSales = filteredBrs.map((record) => toDashboardSale(record, scope));
    const personalSalesRecords = scope.isAdministrator
      ? dashboardSales
      : dashboardSales.filter((record) => record.isPersonalSale);
    // Team Sales is the complete sales total where the agent participated.
    // Personal/HLC sales intentionally remain included in this reporting total.
    const teamSalesRecords = scope.isAdministrator ? [] : dashboardSales;

    sendJson(res, 200, {
      ...databaseStats,
      role: session.role,
      isAdministrator: scope.isAdministrator,
      totalUnits: filteredBrs.length,
      approvedSales: accessibleBrs.filter((record) => normalize(record.status) === "approved").length,
      pendingSales: accessibleBrs.filter((record) => !["approved", "rejected"].includes(normalize(record.status))).length,
      totalSales: filteredBrs.reduce((sum, record) => sum + numberValue(record.tcp), 0),
      personalSales: personalSalesRecords.reduce((sum, record) => sum + numberValue(record.tcp), 0),
      personalSalesUnits: personalSalesRecords.length,
      teamSales: teamSalesRecords.reduce((sum, record) => sum + numberValue(record.tcp), 0),
      teamSalesUnits: teamSalesRecords.length,
      totalVouchers: vouchers.length,
      releasedVouchers: vouchers.filter((item) => normalize(item.status) === "released").length,
      pendingVouchers: vouchers.filter((item) => normalize(item.status) !== "released").length,
      commissionForRelease: commissionRows.reduce((sum, row) => sum + numberValue(row.forRelease), 0),
      netCommission: commissionRows.reduce((sum, row) => sum + numberValue(row.netAmount), 0),
      periodSavings: periodRows.reduce((sum, row) => sum + numberValue(row.deductions?.savings), 0),
      periodNetCommission: periodRows.reduce((sum, row) => sum + numberValue(row.netAmount), 0),
      commissionPeriod: period,
      commissionPeriodLabel: formatPeriodLabel(period, selectedYear, selectedMonth, selectedWeek),
      salesRecords: dashboardSales,
      personalSalesRecords,
      teamSalesRecords,
    });
  } catch (error) {
    handleError(res, error);
  }
}

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function numberValue(value) {
  return Number(String(value || 0).replace(/,/g, "")) || 0;
}

function validYear(value, fallback) {
  const year = Number(value);
  return Number.isInteger(year) && year >= 2000 && year <= 2100 ? year : fallback;
}

function validMonth(value, fallback) {
  const month = Number(value);
  return Number.isInteger(month) && month >= 1 && month <= 12 ? month : fallback;
}

function validWeek(value, fallbackDate) {
  if (/^\d{4}-W\d{2}$/.test(String(value || ""))) return String(value);
  return toIsoWeek(fallbackDate);
}

function formatPeriodLabel(period, year, month, week) {
  if (period === "week") {
    const { start, end } = getIsoWeekRange(week);
    const options = { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" };
    return `${start.toLocaleDateString("en-US", options)} – ${end.toLocaleDateString("en-US", options)}`;
  }
  return new Date(Date.UTC(year, month - 1, 1)).toLocaleString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

function isDateInPeriod(date, period, year, month, week) {
  if (!date) return false;
  if (period === "week") {
    const { start, endExclusive } = getIsoWeekRange(week);
    return date >= start && date < endExclusive;
  }
  return date.getUTCFullYear() === year && date.getUTCMonth() + 1 === month;
}

function getIsoWeekRange(weekValue) {
  const [yearText, weekText] = String(weekValue).split("-W");
  const januaryFourth = new Date(Date.UTC(Number(yearText), 0, 4));
  const day = januaryFourth.getUTCDay() || 7;
  const start = new Date(januaryFourth);
  start.setUTCDate(januaryFourth.getUTCDate() - day + 1 + (Number(weekText) - 1) * 7);
  const endExclusive = new Date(start);
  endExclusive.setUTCDate(start.getUTCDate() + 7);
  const end = new Date(endExclusive);
  end.setUTCDate(endExclusive.getUTCDate() - 1);
  return { start, end, endExclusive };
}

function toIsoWeek(value) {
  const date = new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()));
  const day = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
  return `${date.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

function getBrsDate(record) {
  // Dashboard sales follow the date the BRS was posted. The closing date is
  // retained as a fallback for older records that do not have a posted date.
  const value = record?.postedAt || record?.closedAt || record?.createdAt || record?.updatedAt;
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function getRows(computation) {
  return Array.isArray(computation?.rows) ? computation.rows : [];
}

function getLatestComputations(computations) {
  const latest = new Map();
  computations.forEach((item) => {
    const key = String(item.selectedVoucherId || `${item.voucherBatchId || "no-batch"}:${item.brsDocId || item.id}`);
    const current = latest.get(key);
    if (!current || getTimestamp(item) > getTimestamp(current)) latest.set(key, item);
  });
  return Array.from(latest.values());
}

function getTimestamp(item) {
  return new Date(item?.updatedAt || item?.createdAt || 0).getTime() || 0;
}

function getComputationDate(computation, vouchers) {
  const voucher = vouchers.find((item) =>
    String(item.id) === String(computation.selectedVoucherId) ||
    (item.voucherBatchId && item.voucherBatchId === computation.voucherBatchId && String(item.brsDocId) === String(computation.brsDocId))
  );
  const value = voucher?.releasedDate || voucher?.voucherDate || computation.updatedAt || computation.createdAt;
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function toDashboardSale(record, scope) {
  const rows = Array.isArray(record.rateDistribution) ? record.rateDistribution : [];
  const hlc = rows.find((row) => normalize(row.role) === "hlc");
  const matchingRows = scope.isAdministrator ? [] : rows.filter((row) => scope.aliases.has(normalizeName(row.name)));
  const isPersonalSale = matchingRows.some((row) => normalize(row.role) === "hlc");
  const teamRoles = matchingRows.filter((row) => normalize(row.role) !== "hlc").map((row) => row.role).filter(Boolean);
  return {
    id: record.id,
    status: record.status,
    tcp: numberValue(record.tcp),
    developer: record.developer || "",
    project: record.project || "",
    teamName: record.teamName || "",
    hlcCode: record.hlcCode || "",
    hlcName: hlc?.name || "",
    salesCategory: scope.isAdministrator ? "overall" : isPersonalSale ? "personal" : "team",
    isPersonalSale,
    isTeamSale: !scope.isAdministrator && matchingRows.length > 0,
    participationRoles: isPersonalSale ? ["HLC"] : [...new Set(teamRoles)],
  };
}

function normalizeName(value) {
  return String(value || "").trim().toLowerCase().replace(/\s+/g, " ");
}
