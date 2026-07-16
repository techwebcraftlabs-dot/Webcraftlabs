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
    <div className="mt-8">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">

        <div>

          <h2 className="text-2xl font-black tracking-tight text-[#2f211b]">
            Properties
          </h2>

          <p className="text-[#64748b] mt-1">
            Newly added premium listings
          </p>

        </div>

        <button
          className="
            bg-[#3b281f]
            text-white
            px-6
            py-3
            rounded-xl
            font-semibold
            shadow-[0_12px_24px_rgba(59,40,31,0.18)]
            transition
            hover:bg-[#4a3328]
          "
        >
          View All
        </button>

      </div>

      {/* GRID */}
      <div className="grid md:grid-cols-3 gap-6">

        {properties.map((property, index) => (

          <div
            key={index}
            className="
              bg-white
              rounded-3xl
              overflow-hidden
              border
              border-[#e7ecf3]
              shadow-[0_14px_35px_rgba(15,23,42,0.05)]
              hover:-translate-y-1
              hover:shadow-[0_18px_45px_rgba(15,23,42,0.08)]
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
                h-[220px]
                object-cover
              "
            />

            {/* CONTENT */}
            <div className="p-6">

              <h3 className="text-xl font-black text-[#2f211b]">
                {property.title}
              </h3>

              <p className="text-[#64748b] mt-2">
                {property.location}
              </p>

              <div className="mt-6 flex items-center justify-between">

                <h2 className="text-2xl font-black text-[#2f211b]">
                  {property.price}
                </h2>

                <button
                  className="
                    bg-[#c9a063]
                    text-[#2f211b]
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
