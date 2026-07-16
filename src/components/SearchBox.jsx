import { Building2, ChevronDown, MapPin, Search, Tag } from 'lucide-react'

const fields = [
  {
    name: 'location',
    label: 'Location',
    placeholder: 'Choose Location',
    icon: MapPin,
    options: ['Makati', 'BGC', 'Cavite', 'Tagaytay', 'Rizal', 'Nuvali', 'Antipolo'],
  },
  {
    name: 'type',
    label: 'Property Type',
    placeholder: 'Choose Type',
    icon: Building2,
    options: ['Villa', 'Condo', 'House', 'Townhouse', 'Penthouse'],
  },
  {
    name: 'budget',
    label: 'Price Range',
    placeholder: 'Select Budget',
    icon: Tag,
    options: ['Under 7M', '7M - 15M', '15M+'],
  },
]

function SearchBox({ filters, onFilterChange, onSearch }) {
  const updateFilter = (field, value) => {
    onFilterChange?.({
      ...filters,
      [field]: value,
    })
  }

  return (
    <div className="rounded-[18px] bg-white p-3 shadow-[0_22px_55px_rgba(0,0,0,0.20)] sm:p-4">
      <div className="grid grid-cols-1 items-stretch gap-2 md:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_200px] xl:grid-cols-[1fr_1fr_1fr_220px]">
        {fields.map((field) => (
          <FilterSelect
            key={field.name}
            field={field}
            value={filters?.[field.name] || ''}
            onChange={(value) => updateFilter(field.name, value)}
          />
        ))}

        <button
          type="button"
          onClick={onSearch}
          className="
            inline-flex
            min-h-[56px]
            items-center
            justify-center
            gap-3
            rounded-lg
            bg-[#030b22]
            px-5
            text-sm
            font-black
            text-white
            transition-all
            duration-300
            shadow-xl
            hover:-translate-y-0.5
            hover:bg-[#091840]
            lg:min-h-[60px]
            xl:px-8
          "
        >
          <Search className="h-5 w-5" />
          Search Property
        </button>
      </div>
    </div>
  )
}

function FilterSelect({ field, value, onChange }) {
  const Icon = field.icon

  return (
    <label className="flex min-h-[62px] items-center gap-3 rounded-xl border border-[#e6e1dc] px-3 py-3 lg:min-h-[66px] lg:rounded-none lg:border-0 lg:border-r lg:pl-4 lg:pr-5">
      <Icon className="h-6 w-6 shrink-0 text-[#5f6067]" />

      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-[#34343a]">
          {field.label}
        </span>

        <span className="relative mt-1 block">
          <select
            value={value}
            onChange={(event) => onChange(event.target.value)}
            className="
              w-full
              cursor-pointer
              appearance-none
              bg-transparent
              pr-7
              text-base
              text-[#8a8c94]
              outline-none
            "
          >
            <option value="">{field.placeholder}</option>
            {field.options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>

          <ChevronDown className="pointer-events-none absolute right-0 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8a8c94]" />
        </span>
      </span>
    </label>
  )
}

export default SearchBox
