export function getPropertyPriceRange(property) {
  const from = Math.max(0, Number(property?.priceFrom ?? property?.priceValue) || 0)
  const rawTo = Number(property?.priceTo)
  const to = Number.isFinite(rawTo) && rawTo > 0 ? Math.max(from, rawTo) : from
  return { from, to }
}

export function formatPropertyPrice(property) {
  const { from, to } = getPropertyPriceRange(property)
  const format = (value) => `₱${value.toLocaleString('en-PH')}`
  return to > from ? `${format(from)} – ${format(to)}` : format(from)
}

export function propertyPriceIntersects(property, minimum, maximum = Infinity) {
  const { from, to } = getPropertyPriceRange(property)
  return to >= minimum && from <= maximum
}
