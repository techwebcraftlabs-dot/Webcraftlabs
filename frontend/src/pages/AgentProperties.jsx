import { useEffect, useState } from 'react'

import { propertyApi, propertyAssignmentApi } from '../lib/api'
import { formatPropertyPrice } from '../lib/propertyPrice'
import { EmptyState, Pagination } from '../components/ui/DataStates'
import { useSavedFilters } from '../hooks/useSavedFilters'
import PremiumPageHeader from '../components/dashboard/PremiumPageHeader'

function AgentProperties() {
  const { filters, updateFilter, resetFilters } = useSavedFilters('agent-properties', { search: '', status: 'All', pageSize: 10 })
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [savingId, setSavingId] = useState('')

  useEffect(() => {
    Promise.all([propertyApi.list(), propertyAssignmentApi.listMine()])
      .then(([listings, ids]) => { setProperties(listings); setSelectedIds(new Set(ids.map(String))) })
      .catch((error) => alert(error.message))
      .finally(() => setLoading(false))
  }, [])

  const normalizedSearch = filters.search.trim().toLowerCase()
  const filteredProperties = properties.filter((property) =>
    (filters.status === 'All' || property.status === filters.status) &&
    (!normalizedSearch || [property.title, property.location, property.type].some((value) => String(value || '').toLowerCase().includes(normalizedSearch)))
  )
  const statuses = [...new Set(properties.map((property) => property.status).filter(Boolean))]
  const pageCount = Math.max(1, Math.ceil(filteredProperties.length / filters.pageSize))
  const safePage = Math.min(page, pageCount)
  const visibleProperties = filteredProperties.slice((safePage - 1) * filters.pageSize, safePage * filters.pageSize)

  const toggleProperty = async (propertyId) => {
    const id = String(propertyId)
    const selected = selectedIds.has(id)
    try {
      setSavingId(id)
      if (selected) await propertyAssignmentApi.remove(id)
      else await propertyAssignmentApi.select(id)
      setSelectedIds((current) => {
        const next = new Set(current)
        if (selected) next.delete(id); else next.add(id)
        return next
      })
    } catch (error) { alert(error.message) } finally { setSavingId('') }
  }

  return (
    <div className="mt-8 rounded-[30px] bg-white p-8 shadow-sm">
      <PremiumPageHeader eyebrow="My Inventory" title="Properties to Sell" description="Select properties you want to sell. Buyers can contact you from the property inquiry." />
      <div className="mt-6 grid gap-3 rounded-2xl border border-slate-100 p-5 sm:grid-cols-[1fr_auto_auto]"><input type="search" value={filters.search} onChange={(event) => { updateFilter('search', event.target.value); setPage(1) }} placeholder="Search property, location or type..." className="h-12 rounded-xl border border-slate-200 px-4" /><select value={filters.status} onChange={(event) => { updateFilter('status', event.target.value); setPage(1) }} className="h-12 rounded-xl border border-slate-200 bg-white px-4 font-semibold"><option value="All">All Status</option>{statuses.map((status) => <option key={status}>{status}</option>)}</select>{(filters.search || filters.status !== 'All') && <button onClick={() => { resetFilters(); setPage(1) }} className="h-12 rounded-xl border border-slate-200 px-4 text-sm font-bold">Clear</button>}</div>
      {loading ? <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }, (_, index) => <div key={index} className="h-72 animate-pulse rounded-2xl bg-slate-100" />)}</div> : filteredProperties.length === 0 ? <EmptyState title={filters.search || filters.status !== 'All' ? 'No matching properties' : 'No property listings available yet'} description={filters.search || filters.status !== 'All' ? 'Try another keyword or clear the filters.' : 'Available property listings will appear here once added by management.'} /> : (
        <div className="mt-8 grid grid-cols-[repeat(auto-fit,minmax(230px,280px))] gap-5">
          {visibleProperties.map((property) => {
            const selected = selectedIds.has(String(property.id))
            return (
              <article key={property.id} className={`overflow-hidden rounded-2xl border bg-white ${selected ? 'border-[#2563eb] ring-2 ring-blue-100' : 'border-[#e5ebf3]'}`}>
                <img src={property.image || propertyApi.imageUrl(property.id)} alt={property.title} className="h-36 w-full object-cover" />
                <div className="p-4"><p className="text-[10px] font-black uppercase text-[#2563eb]">{property.type}</p><h3 className="mt-1 truncate text-lg font-black">{property.title}</h3><p className="mt-1 truncate text-sm text-gray-500">{property.location}</p><p className="mt-3 text-lg font-black">{formatPropertyPrice(property)}</p><button disabled={savingId === String(property.id)} onClick={() => toggleProperty(property.id)} className={`mt-4 w-full rounded-xl px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60 ${selected ? 'bg-rose-600' : 'bg-[#2563eb]'}`}>{savingId === String(property.id) ? 'Saving...' : selected ? 'Remove Selection' : 'Sell This Property'}</button></div>
              </article>
            )
          })}
        </div>
      )}
      {!loading && <div className="mt-6 overflow-hidden rounded-2xl border border-slate-100"><Pagination page={safePage} pageSize={filters.pageSize} total={filteredProperties.length} onPageChange={setPage} onPageSizeChange={(size) => { updateFilter('pageSize', size); setPage(1) }} /></div>}
    </div>
  )
}

export default AgentProperties
