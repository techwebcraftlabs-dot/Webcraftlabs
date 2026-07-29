export function canAccessBrs(session, record) {
  return Boolean(session && record);
}

export function filterAccessibleBrs(session, records) {
  return records.filter((record) => canAccessBrs(session, record));
}

export function assertBrsAccess(session, record) {
  if (canAccessBrs(session, record)) return;
  const error = new Error("BRS access denied.");
  error.statusCode = 403;
  error.publicMessage = "You do not have permission to access this BRS record.";
  throw error;
}

export function assertValidBrsRates(record) {
  const rows = Array.isArray(record?.rateDistribution) ? record.rateDistribution : [];
  const developerRate = rows
    .filter((row) => String(row.role || "").trim().toLowerCase() === "developer")
    .reduce((total, row) => total + (Number(row.rate) || 0), 0);
  const distributedRate = rows
    .filter((row) => String(row.role || "").trim().toLowerCase() !== "developer")
    .reduce((total, row) => total + (Number(row.rate) || 0), 0);
  const difference = developerRate - distributedRate;
  if (Math.abs(difference) <= 0.0001) return;

  const direction = difference > 0 ? "kulang" : "sobra";
  const error = new Error("Invalid BRS rate distribution.");
  error.statusCode = 400;
  error.publicMessage = `Hindi ma-save ang BRS: ${direction} ng ${Math.abs(difference).toFixed(2)}% ang rate distribution.`;
  throw error;
}
