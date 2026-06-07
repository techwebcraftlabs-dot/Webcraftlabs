function SearchBox() {
  return (
    <div className="bg-white rounded-[30px] shadow-2xl p-5 md:p-6">

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-5 items-center">

        {/* LOCATION */}
        <div className="bg-[#f8f8f8] rounded-2xl px-5 py-4">

          <p className="text-sm text-gray-500 mb-2">
            Location
          </p>

          <select
            className="
              w-full
              bg-transparent
              outline-none
              font-semibold
              text-[#3b281f]
              cursor-pointer
            "
          >
            <option>Choose Location</option>
            <option>Manila</option>
            <option>Cavite</option>
            <option>Tagaytay</option>
          </select>

        </div>

        {/* PROPERTY TYPE */}
        <div className="bg-[#f8f8f8] rounded-2xl px-5 py-4">

          <p className="text-sm text-gray-500 mb-2">
            Property Type
          </p>

          <select
            className="
              w-full
              bg-transparent
              outline-none
              font-semibold
              text-[#3b281f]
              cursor-pointer
            "
          >
            <option>Choose Type</option>
            <option>Villa</option>
            <option>Condo</option>
            <option>Apartment</option>
          </select>

        </div>

        {/* PRICE RANGE */}
        <div className="bg-[#f8f8f8] rounded-2xl px-5 py-4">

          <p className="text-sm text-gray-500 mb-2">
            Price Range
          </p>

          <select
            className="
              w-full
              bg-transparent
              outline-none
              font-semibold
              text-[#3b281f]
              cursor-pointer
            "
          >
            <option>Select Budget</option>
            <option>$100k - $300k</option>
            <option>$300k - $700k</option>
            <option>$1M+</option>
          </select>

        </div>

        {/* SEARCH BUTTON */}
        <button
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