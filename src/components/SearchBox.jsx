function SearchBox({ filters, onFilterChange, onSearch }) {
  const updateFilter = (field, value) => {
    onFilterChange?.({
      ...filters,
      [field]: value,
    })
  }

  return (
    <div className="bg-white rounded-[30px] shadow-2xl p-5 md:p-6">

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-5 items-center">

        {/* LOCATION */}
        <div className="bg-[#f8f8f8] rounded-2xl px-5 py-4">

          <p className="text-sm text-gray-500 mb-2">
            Location
          </p>

          <select
            value={filters?.location || ""}
            onChange={(event) => updateFilter("location", event.target.value)}
            className="
              w-full
              bg-transparent
              outline-none
              font-semibold
              text-[#3b281f]
              cursor-pointer
            "
          >
            <option value="">Choose Location</option>
            <option value="Makati">Makati</option>
            <option value="BGC">BGC</option>
            <option>Cavite</option>
            <option>Tagaytay</option>
            <option>Rizal</option>
            <option>Nuvali</option>
            <option>Antipolo</option>
          </select>

        </div>

        {/* PROPERTY TYPE */}
        <div className="bg-[#f8f8f8] rounded-2xl px-5 py-4">

          <p className="text-sm text-gray-500 mb-2">
            Property Type
          </p>

          <select
            value={filters?.type || ""}
            onChange={(event) => updateFilter("type", event.target.value)}
            className="
              w-full
              bg-transparent
              outline-none
              font-semibold
              text-[#3b281f]
              cursor-pointer
            "
          >
            <option value="">Choose Type</option>
            <option>Villa</option>
            <option>Condo</option>
            <option>House</option>
            <option>Townhouse</option>
            <option>Penthouse</option>
          </select>

        </div>

        {/* PRICE RANGE */}
        <div className="bg-[#f8f8f8] rounded-2xl px-5 py-4">

          <p className="text-sm text-gray-500 mb-2">
            Price Range
          </p>

          <select
            value={filters?.budget || ""}
            onChange={(event) => updateFilter("budget", event.target.value)}
            className="
              w-full
              bg-transparent
              outline-none
              font-semibold
              text-[#3b281f]
              cursor-pointer
            "
          >
            <option value="">Select Budget</option>
            <option>Under 7M</option>
            <option>7M - 15M</option>
            <option>15M+</option>
          </select>

        </div>

        {/* SEARCH BUTTON */}
        <button
          type="button"
          onClick={onSearch}
          className="
            h-full
            min-h-[78px]
            bg-[#3b281f]
            hover:bg-[#2a1d17]
            text-white
            rounded-2xl
            font-semibold
            text-base
            transition-all
            duration-300
            hover:scale-[1.02]
            shadow-xl
          "
        >
          Search Property
        </button>

      </div>

    </div>
  )
}

export default SearchBox
