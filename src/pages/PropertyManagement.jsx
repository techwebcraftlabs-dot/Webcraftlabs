import { useEffect, useState } from 'react'

import { propertyApi } from '../lib/api'
import { formatPropertyPrice } from '../lib/propertyPrice'
import { EmptyState, Pagination } from '../components/ui/DataStates'
import { useSavedFilters } from '../hooks/useSavedFilters'
import PremiumPageHeader from '../components/dashboard/PremiumPageHeader'
import { isNewListing } from '../lib/propertyListing'

const emptyForm = () => ({
  title: '', location: '', type: '', priceFrom: '', priceTo: '', beds: '',
  baths: '', parking: '', floorArea: '', status: 'New Listing',
})

function PropertyManagement() {
  const { filters, updateFilter, resetFilters } = useSavedFilters('property-management', { search: '', status: 'All', pageSize: 10 })
  const canManage = ['Administrator', 'EVP'].includes(localStorage.getItem('role'))
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [form, setForm] = useState(emptyForm)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [propertyImage, setPropertyImage] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [selectedProperty, setSelectedProperty] = useState(null)

  useEffect(() => {
    propertyApi.list().then(setProperties).catch((error) => alert(error.message)).finally(() => setLoading(false))
  }, [])

  const normalizedSearch = filters.search.trim().toLowerCase()
  const filteredProperties = properties.filter((property) =>
    (filters.status === 'All' || property.status === filters.status) &&
    (!normalizedSearch || [property.title, property.location, property.type, property.status].some((value) => String(value || '').toLowerCase().includes(normalizedSearch)))
  )
  const statuses = [...new Set(properties.map((property) => property.status).filter(Boolean))]
  const pageCount = Math.max(1, Math.ceil(filteredProperties.length / filters.pageSize))
  const safePage = Math.min(page, pageCount)
  const visibleProperties = filteredProperties.slice((safePage - 1) * filters.pageSize, safePage * filters.pageSize)

  const saveProperty = async () => {
    if (!propertyImage) {
      alert('Please upload a property image.')
      return
    }
    try {
      setSaving(true)
      const created = await propertyApi.create(form)
      await propertyApi.uploadImage(created.id, {
        mimeType: propertyImage.type,
        data: await fileToBase64(propertyImage),
      })
      setProperties((current) => [{ ...created, image: propertyApi.imageUrl(created.id) }, ...current])
      setForm(emptyForm())
      setPropertyImage(null)
      setImagePreview('')
      setShowForm(false)
    } catch (error) {
      alert(error.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mt-8 rounded-[30px] bg-white p-8 shadow-sm">
      <PremiumPageHeader eyebrow="Property Inventory" title="Properties Management" description={canManage ? 'Add and manage database property listings' : 'View saved property listings'} actions={canManage ? <button onClick={() => setShowForm((current) => !current)}>{showForm ? 'Cancel' : '+ Add Property'}</button> : null} />

      {canManage && showForm && (
        <div className="mt-8 rounded-2xl border border-[#e5ebf3] bg-[#f8fafc] p-6">
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {propertyFields.map(([name, label, type = 'text']) => (
              <label key={name} className={name === 'image' ? 'xl:col-span-2' : ''}>
                <span className="mb-2 block text-sm font-bold text-gray-600">{label}</span>
                <input type={type} min={type === 'number' ? '0' : undefined} step="1" value={form[name]} onChange={(event) => setForm((current) => ({ ...current, [name]: event.target.value }))} className="h-12 w-full rounded-xl border border-gray-300 bg-white px-4 outline-none focus:ring-2 focus:ring-[#2563eb]" />
              </label>
            ))}
          </div>
          <label className="mt-5 block">
            <span className="mb-2 block text-sm font-bold text-gray-600">Property Picture</span>
            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => handleImageChange(event, setPropertyImage, setImagePreview)} className="block w-full rounded-xl border border-gray-300 bg-white p-3 text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-[#2563eb] file:px-4 file:py-2 file:font-bold file:text-white" />
            <p className="mt-2 text-xs text-gray-500">JPG, PNG, or WebP. Maximum 2 MB.</p>
          </label>
          {imagePreview && <img src={imagePreview} alt="Property preview" className="mt-4 h-56 w-full max-w-xl rounded-2xl object-cover" />}
          <div className="mt-6 flex justify-end"><button disabled={saving} onClick={saveProperty} className="rounded-xl bg-[#0d1b4c] px-7 py-3 font-bold text-white disabled:opacity-60">{saving ? 'Saving...' : 'Save Property'}</button></div>
        </div>
      )}

      <div className="mt-8 grid gap-3 rounded-2xl border border-slate-100 p-5 sm:grid-cols-[1fr_auto_auto]">
        <input type="search" value={filters.search} onChange={(event) => { updateFilter('search', event.target.value); setPage(1) }} placeholder="Search property, location or type..." className="h-12 rounded-xl border border-slate-200 px-4 outline-none focus:border-blue-500" />
        <select value={filters.status} onChange={(event) => { updateFilter('status', event.target.value); setPage(1) }} className="h-12 rounded-xl border border-slate-200 bg-white px-4 font-semibold"><option value="All">All Status</option>{statuses.map((status) => <option key={status} value={status}>{status}</option>)}</select>
        {(filters.search || filters.status !== 'All') && <button onClick={() => { resetFilters(); setPage(1) }} className="h-12 rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-600">Clear</button>}
      </div>

      {loading ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }, (_, index) => <div key={index} className="h-72 animate-pulse rounded-2xl bg-slate-100" />)}</div>
      ) : filteredProperties.length === 0 ? (
        <EmptyState title={filters.search || filters.status !== 'All' ? 'No matching properties' : 'No saved properties yet'} description={filters.search || filters.status !== 'All' ? 'Try another keyword or clear the active filters.' : 'Add a property listing so agents can select and offer it to buyers.'} action={(filters.search || filters.status !== 'All') && <button onClick={resetFilters} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white">Clear filters</button>} />
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5">
          {visibleProperties.map((property) => (
            <article key={property.id} className="overflow-hidden rounded-2xl border border-[#e5ebf3]">
              <img src={property.image || propertyApi.imageUrl(property.id)} alt={property.title} className="h-36 w-full object-cover" />
              <div className="p-4">
                <div className="flex items-start justify-between gap-2"><div className="min-w-0"><p className="text-[10px] font-black uppercase tracking-wider text-[#2563eb]">{property.type}</p><h3 className="mt-1 truncate text-lg font-black">{property.title}</h3></div>{isNewListing(property) && <span className="shrink-0 rounded-full bg-blue-50 px-2 py-1 text-[10px] font-bold text-[#1d4ed8]">New Listing</span>}</div>
                <p className="mt-1 truncate text-sm text-gray-500">{property.location}</p>
                <div className="mt-3 grid grid-cols-4 gap-1 text-center text-[10px]"><PropertyDetail label="Beds" value={property.beds} /><PropertyDetail label="Baths" value={property.baths} /><PropertyDetail label="Parking" value={property.parking} /><PropertyDetail label="Area" value={property.floorArea || '-'} /></div>
                <div className="mt-4 flex items-center justify-between gap-2"><p className="truncate text-lg font-black">{formatPropertyPrice(property)}</p><button onClick={() => setSelectedProperty(property)} className="rounded-lg bg-[#2563eb] px-4 py-2 text-sm font-bold text-white">View</button></div>
              </div>
            </article>
          ))}
        </div>
      )}
      {!loading && <div className="mt-6 overflow-hidden rounded-2xl border border-slate-100"><Pagination page={safePage} pageSize={filters.pageSize} total={filteredProperties.length} onPageChange={setPage} onPageSizeChange={(size) => { updateFilter('pageSize', size); setPage(1) }} /></div>}
      {selectedProperty && <PropertyPreview property={selectedProperty} onClose={() => setSelectedProperty(null)} />}
    </div>
  )
}

const propertyFields = [
  ['title', 'Property Title'], ['location', 'Location'], ['type', 'Property Type'],
  ['priceFrom', 'Price From (PHP)', 'number'], ['priceTo', 'Price To (PHP)', 'number'],
  ['beds', 'Bedrooms', 'number'], ['baths', 'Bathrooms', 'number'],
  ['parking', 'Parking', 'number'], ['floorArea', 'Floor Area'], ['status', 'Status'],
]

function handleImageChange(event, setFile, setPreview) {
  const file = event.target.files?.[0]
  if (!file) return
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    alert('Use a JPG, PNG, or WebP property image.')
    event.target.value = ''
    return
  }
  if (file.size > 2 * 1024 * 1024) {
    alert('Property image must be 2 MB or smaller.')
    event.target.value = ''
    return
  }
  setFile(file)
  const reader = new FileReader()
  reader.onload = () => setPreview(String(reader.result || ''))
  reader.readAsDataURL(file)
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result).split(',')[1] || '')
    reader.onerror = () => reject(new Error('Could not read the property image.'))
    reader.readAsDataURL(file)
  })
}

export default PropertyManagement

function PropertyDetail({ label, value }) {
  return <div className="rounded-lg bg-gray-50 px-2 py-2"><p className="font-black text-[#111827]">{value || 0}</p><p className="mt-1 text-[10px] uppercase text-gray-400">{label}</p></div>
}

function PropertyPreview({ property, onClose }) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 p-5 backdrop-blur-sm">
      <div className="mx-auto max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl">
        <img src={property.image || propertyApi.imageUrl(property.id)} alt={property.title} className="h-80 w-full object-cover" />
        <div className="p-7">
          <div className="flex items-start justify-between gap-4"><div><p className="text-sm font-black uppercase text-[#2563eb]">{property.type}</p><h2 className="mt-1 text-3xl font-black">{property.title}</h2><p className="mt-2 text-gray-500">{property.location}</p></div><button onClick={onClose} className="rounded-xl bg-gray-100 px-4 py-2 font-bold">Close</button></div>
          <p className="mt-6 text-3xl font-black">{formatPropertyPrice(property)}</p>
          <div className="mt-6 grid grid-cols-4 gap-3 text-center"><PropertyDetail label="Beds" value={property.beds} /><PropertyDetail label="Baths" value={property.baths} /><PropertyDetail label="Parking" value={property.parking} /><PropertyDetail label="Floor Area" value={property.floorArea || '-'} /></div>
        </div>
      </div>
    </div>
  )
}
