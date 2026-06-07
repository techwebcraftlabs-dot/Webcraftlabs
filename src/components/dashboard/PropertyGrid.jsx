function PropertyGrid() {

  const properties = [
    {
      image:
        'https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=1200&auto=format&fit=crop',
      title: 'Modern Luxury Villa',
      location: 'Tagaytay City',
      price: '$850,000'
    },

    {
      image:
        'https://images.unsplash.com/photo-1600607687644-c7171b42498f?q=80&w=1200&auto=format&fit=crop',
      title: 'Premium Glass House',
      location: 'Makati City',
      price: '$620,000'
    },

    {
      image:
        'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?q=80&w=1200&auto=format&fit=crop',
      title: 'Minimalist Residence',
      location: 'BGC Taguig',
      price: '$780,000'
    }
  ]

  return (
    <div className="mt-10">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">

        <div>

          <h2 className="text-3xl font-black text-[#3b281f]">
            Properties
          </h2>

          <p className="text-gray-500 mt-1">
            Newly added premium listings
          </p>

        </div>

        <button
          className="
            bg-[#3b281f]
            text-white
            px-6
            py-3
            rounded-2xl
          "
        >
          View All
        </button>

      </div>

      {/* GRID */}
      <div className="grid md:grid-cols-3 gap-7">

        {properties.map((property, index) => (

          <div
            key={index}
            className="
              bg-white
              rounded-[30px]
              overflow-hidden
              shadow-sm
              hover:-translate-y-2
              transition-all
              duration-300
            "
          >

            {/* IMAGE */}
            <img
              src={property.image}
              alt=""
              className="
                w-full
                h-[240px]
                object-cover
              "
            />

            {/* CONTENT */}
            <div className="p-6">

              <h3 className="text-2xl font-bold text-[#3b281f]">
                {property.title}
              </h3>

              <p className="text-gray-500 mt-2">
                {property.location}
              </p>

              <div className="mt-6 flex items-center justify-between">

                <h2 className="text-2xl font-black text-[#3b281f]">
                  {property.price}
                </h2>

                <button
                  className="
                    bg-[#c9a063]
                    px-5
                    py-2
                    rounded-xl
                    font-semibold
                  "
                >
                  View
                </button>

              </div>

            </div>

          </div>

        ))}

      </div>

    </div>
  )
}

export default PropertyGrid