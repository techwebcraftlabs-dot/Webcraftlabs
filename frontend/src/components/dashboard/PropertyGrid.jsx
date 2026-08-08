import { useEffect, useState } from 'react'

import { propertyApi } from '../../lib/api'
import { formatPropertyPrice } from '../../lib/propertyPrice'

function PropertyGrid({ setActivePage }) {
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const role = localStorage.getItem('role')
  const openInternalProperties = () => {
    setActivePage(role === 'Agent' ? 'agent-properties' : 'properties')
  }

  useEffect(() => {
    propertyApi.list()
      .then((records) => setProperties(records.slice(0, 3)))
      .catch((error) => console.error('Unable to load dashboard properties.', error))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="mt-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-[#111827]">Properties</h2>
          <p className="mt-1 text-[#64748b]">Newly added database listings</p>
        </div>
        <button onClick={openInternalProperties} className="rounded-xl bg-[#0d1b4c] px-6 py-3 font-semibold text-white shadow-lg">
          View All
        </button>
      </div>

      {!loading && properties.length === 0 && (
        <div className="rounded-3xl border border-dashed border-[#dbe3ee] bg-white p-10 text-center text-[#64748b]">
          No saved property listings yet.
        </div>
      )}

      <div className="grid grid-cols-[repeat(auto-fit,minmax(230px,280px))] justify-start gap-5">
        {properties.map((property) => (
          <div key={property.id} className="overflow-hidden rounded-2xl border border-[#e7ecf3] bg-white shadow-[0_12px_28px_rgba(15,23,42,0.05)]">
            <img src={property.image || propertyApi.imageUrl(property.id)} alt={property.title} className="h-36 w-full object-cover" />
            <div className="p-4">
              <h3 className="truncate text-lg font-black text-[#111827]">{property.title}</h3>
              <p className="mt-1 truncate text-sm text-[#64748b]">{property.location}</p>
              <div className="mt-4 flex items-center justify-between gap-3">
                <h2 className="truncate text-lg font-black text-[#111827]">{formatPropertyPrice(property)}</h2>
                <button onClick={openInternalProperties} className="shrink-0 rounded-lg bg-[#60a5fa] px-4 py-2 text-sm font-semibold text-[#111827]">View</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default PropertyGrid
