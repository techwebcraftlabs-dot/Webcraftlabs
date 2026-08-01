import { ArrowRight, ChevronDown, Search } from 'lucide-react'

const fields = [
  { name: 'type', label: 'Property type', options: ['Villa', 'Condo', 'House', 'Townhouse', 'Penthouse'] },
  { name: 'location', label: 'Preferred location', options: ['Makati', 'BGC', 'Cavite', 'Tagaytay', 'Rizal', 'Nuvali', 'Antipolo'] },
  { name: 'budget', label: 'Price range', options: ['Under 7M', '7M - 15M', '15M+'] },
]

function SearchBox({ filters, onFilterChange, onSearch }) {
  const updateFilter = (name, value) => onFilterChange?.({ ...filters, [name]: value })

  return <aside className="overflow-hidden rounded-[4px] border border-black/10 bg-white shadow-[0_28px_80px_rgba(24,22,18,0.22)]">
    <div className="bg-[#1c1f21] px-6 py-5 text-white"><p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#d4a64d]">Property Finder</p><h2 className="mt-2 text-lg font-semibold">Find your ideal address</h2></div>
    <div className="space-y-3 p-5 sm:p-6">
      {fields.map((field) => <label key={field.name} className="relative block"><span className="sr-only">{field.label}</span><select value={filters?.[field.name] || ''} onChange={(event) => updateFilter(field.name, event.target.value)} className="min-h-12 w-full appearance-none rounded-sm border border-[#d8d5ce] bg-white px-4 pr-10 text-sm text-[#52555a] outline-none transition focus:border-[#a8782f] focus:ring-2 focus:ring-[#a8782f]/15"><option value="">{field.label}</option>{field.options.map((option) => <option key={option}>{option}</option>)}</select><ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#74777b]" /></label>)}
      <button type="button" onClick={onSearch} className="group inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-sm bg-[linear-gradient(100deg,#9a6c26,#c99a45)] px-5 text-xs font-black uppercase tracking-[0.1em] text-white transition hover:brightness-95 focus:outline-none focus:ring-4 focus:ring-[#b48132]/25"><Search size={17} />Search properties</button>
      <button type="button" onClick={onSearch} className="inline-flex min-h-11 items-center gap-2 text-xs font-bold text-[#55585b] transition hover:text-[#9a6c26]">View all available properties <ArrowRight size={14} /></button>
    </div>
  </aside>
}

export default SearchBox
