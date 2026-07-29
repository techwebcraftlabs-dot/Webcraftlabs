const NEW_LISTING_WINDOW_MS = 7 * 24 * 60 * 60 * 1000

export function isNewListing(property, now = Date.now()) {
  const createdAt = new Date(property?.createdAt || '').getTime()
  if (!Number.isFinite(createdAt)) return false
  const age = Number(now) - createdAt
  return age >= 0 && age < NEW_LISTING_WINDOW_MS
}
