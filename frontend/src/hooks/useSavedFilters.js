import { useEffect, useState } from 'react'

export function useSavedFilters(key, defaults) {
  const [filters, setFilters] = useState(() => {
    try { return { ...defaults, ...JSON.parse(localStorage.getItem(`zonal:filters:${key}`)) } }
    catch { return defaults }
  })
  useEffect(() => { localStorage.setItem(`zonal:filters:${key}`, JSON.stringify(filters)) }, [filters, key])
  const updateFilter = (name, value) => setFilters((current) => ({ ...current, [name]: value }))
  const resetFilters = () => setFilters(defaults)
  return { filters, updateFilter, resetFilters }
}
