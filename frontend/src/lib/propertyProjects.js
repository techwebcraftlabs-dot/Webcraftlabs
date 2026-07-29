import { getPropertyPriceRange } from './propertyPrice'
import { isNewListing } from './propertyListing'

const normalize = (value) => String(value || '').trim().toLowerCase()

export function groupPropertiesByProject(properties = []) {
  const groups = new Map()

  properties.forEach((property) => {
    const projectName = property.project || property.title
    const key = `${normalize(property.developer)}::${normalize(projectName)}::${normalize(property.location)}`
    const current = groups.get(key)

    if (current) {
      current.variants.push(property)
      return
    }

    groups.set(key, {
      ...property,
      title: projectName,
      projectKey: key,
      variants: [property],
    })
  })

  return [...groups.values()].map((project) => {
    const ranges = project.variants.map(getPropertyPriceRange)
    const propertyTypes = [...new Set(
      project.variants.map((property) => property.type).filter(Boolean)
    )]

    return {
      ...project,
      priceFrom: Math.min(...ranges.map((range) => range.from)),
      priceTo: Math.max(...ranges.map((range) => range.to)),
      propertyTypes,
      isNewListing: project.variants.some((property) => isNewListing(property)),
    }
  })
}
