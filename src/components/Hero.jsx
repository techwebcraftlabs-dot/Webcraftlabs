import { useMemo, useState } from 'react'
import {
  Bath,
  BedDouble,
  Car,
  CheckCircle,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Ruler,
  X,
} from 'lucide-react'

import SearchBox from './SearchBox'
import About3D from './About3D'

const peso = "\u20b1"

const availableAgents = [
  {
    id: 'sophia',
    name: 'Sophia Miller',
    role: 'Buyer Specialist',
    phone: '+63 917 204 8831',
    email: 'sophia@zonalrealty.com',
    area: 'Makati, BGC',
    response: 'Usually replies within 10 minutes',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1200&auto=format&fit=crop',
  },
  {
    id: 'michael',
    name: 'Michael Lee',
    role: 'Luxury Property Specialist',
    phone: '+63 918 447 1902',
    email: 'michael@zonalrealty.com',
    area: 'Tagaytay, Cavite',
    response: 'Available for site viewing today',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1200&auto=format&fit=crop',
  },
  {
    id: 'olivia',
    name: 'Olivia Cruz',
    role: 'Residential Consultant',
    phone: '+63 916 832 4410',
    email: 'olivia@zonalrealty.com',
    area: 'Rizal, Antipolo',
    response: 'Can send sample computation',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=1200&auto=format&fit=crop',
  },
  {
    id: 'mark',
    name: 'Mark Santos',
    role: 'Investment Advisor',
    phone: '+63 919 561 7302',
    email: 'mark@zonalrealty.com',
    area: 'Nuvali, South Luzon',
    response: 'Open for weekend tripping',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1200&auto=format&fit=crop',
  },
]

const propertyListings = [
  {
    title: 'Modern Villa',
    location: 'Tagaytay City',
    type: 'Villa',
    priceValue: 12.5,
    image: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?q=80&w=1200&auto=format&fit=crop',
    beds: 4,
    baths: 4,
    parking: 2,
    floorArea: '320 sqm',
    lotArea: '480 sqm',
    description: 'A private Tagaytay villa with open living spaces, cool-weather views, and room for family weekends or premium short-stay investment.',
    highlights: ['Panoramic ridge-facing windows', 'Open kitchen and dining layout', 'Ready for private viewing'],
    agentIds: ['michael', 'olivia'],
  },
  {
    title: 'Luxury Condominium',
    location: 'Makati City',
    type: 'Condo',
    priceValue: 8.9,
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1200&auto=format&fit=crop',
    beds: 2,
    baths: 2,
    parking: 1,
    floorArea: '88 sqm',
    lotArea: 'High-rise',
    description: 'A polished Makati residence close to business districts, dining, and daily essentials for buyers who want convenience first.',
    highlights: ['Concierge-ready tower', 'Near offices and lifestyle malls', 'Ideal for rental income'],
    agentIds: ['sophia', 'mark'],
  },
  {
    title: 'Executive House',
    location: 'Cavite',
    type: 'House',
    priceValue: 6.8,
    image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?q=80&w=1200&auto=format&fit=crop',
    beds: 3,
    baths: 3,
    parking: 2,
    floorArea: '210 sqm',
    lotArea: '300 sqm',
    description: 'A practical executive home with flexible spaces for growing families and easy access to southern growth corridors.',
    highlights: ['Quiet village setting', 'Expandable service area', 'Good starter family home'],
    agentIds: ['michael', 'mark'],
  },
  {
    title: 'Premium Townhouse',
    location: 'Rizal',
    type: 'Townhouse',
    priceValue: 5.4,
    image: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?q=80&w=1200&auto=format&fit=crop',
    beds: 3,
    baths: 2,
    parking: 1,
    floorArea: '165 sqm',
    lotArea: '120 sqm',
    description: 'A low-maintenance townhouse for buyers who want a city-adjacent home with a calmer residential environment.',
    highlights: ['Move-in friendly layout', 'Near schools and retail', 'Efficient monthly carrying cost'],
    agentIds: ['olivia', 'sophia'],
  },
  {
    title: 'Skyline Residence',
    location: 'BGC',
    type: 'Condo',
    priceValue: 14.2,
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1200',
    beds: 3,
    baths: 3,
    parking: 2,
    floorArea: '145 sqm',
    lotArea: 'High-rise',
    description: 'A bright BGC residence built for walkable city living, with generous windows and quick access to premium offices.',
    highlights: ['Prime business district address', 'Great resale profile', 'Flexible turnover options'],
    agentIds: ['sophia', 'mark'],
  },
  {
    title: 'Grand Estate',
    location: 'Nuvali',
    type: 'House',
    priceValue: 18.7,
    image: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=1200',
    beds: 5,
    baths: 5,
    parking: 3,
    floorArea: '420 sqm',
    lotArea: '650 sqm',
    description: 'A larger estate-style property for buyers who want open outdoor space, privacy, and a long-term family base.',
    highlights: ['Large garden frontage', 'Premium village location', 'Best for end-use buyers'],
    agentIds: ['mark', 'michael'],
  },
  {
    title: 'Luxury Penthouse',
    location: 'Makati',
    type: 'Penthouse',
    priceValue: 22.5,
    image: 'https://images.unsplash.com/photo-1494526585095-c41746248156?q=80&w=1200',
    beds: 4,
    baths: 4,
    parking: 3,
    floorArea: '260 sqm',
    lotArea: 'Top floor',
    description: 'A premium penthouse with generous entertaining areas for buyers looking for a high-end Makati address.',
    highlights: ['Private lift lobby feel', 'Large entertainment space', 'Excellent city views'],
    agentIds: ['sophia', 'michael'],
  },
  {
    title: 'Family Residence',
    location: 'Antipolo',
    type: 'House',
    priceValue: 7.2,
    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=1200',
    beds: 4,
    baths: 3,
    parking: 2,
    floorArea: '240 sqm',
    lotArea: '360 sqm',
    description: 'A comfortable Antipolo family home with outdoor breathing room and a relaxed neighborhood feel.',
    highlights: ['Pool-ready outdoor area', 'Family-friendly village', 'Good value per square meter'],
    agentIds: ['olivia', 'mark'],
  },
]

const budgetRanges = {
  'Under 7M': (price) => price < 7,
  '7M - 15M': (price) => price >= 7 && price <= 15,
  '15M+': (price) => price > 15,
}

function Hero() {
  const [selectedProperty, setSelectedProperty] = useState(null)
  const [filters, setFilters] = useState({
    location: '',
    type: '',
    budget: '',
  })

  const filteredProperties = useMemo(() => {
    return propertyListings.filter((property) => {
      const matchesLocation =
        !filters.location ||
        property.location.toLowerCase().includes(filters.location.toLowerCase())
      const matchesType = !filters.type || property.type === filters.type
      const matchesBudget =
        !filters.budget || budgetRanges[filters.budget]?.(property.priceValue)

      return matchesLocation && matchesType && matchesBudget
    })
  }, [filters])

  const handleSearchProperties = () => {
    document.getElementById('properties')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }

  return (
    <section id="home">

      {/* HERO */}
      <div className="relative min-h-screen overflow-hidden pb-40">

        {/* BACKGROUND */}
        <img
          src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?q=80&w=1800&auto=format&fit=crop"
          alt="Luxury Home"
          className="absolute inset-0 w-full h-full object-cover scale-110"
        />

        {/* OVERLAY */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40"></div>

        {/* CONTENT */}
        <div className="relative z-20 max-w-7xl mx-auto px-6 md:px-12 pt-40">

          <div className="max-w-3xl">

            <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-xl border border-white/20 px-5 py-3 rounded-full mb-8">
              <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></div>

              <span className="text-white text-sm">
                Trusted by 100+ Real Estate Developers
              </span>
            </div>

            <h1 className="text-6xl md:text-[100px] leading-[0.9] font-black text-white">
              Modern
              <br />
              <span className="text-[#d6a77a]">
                Realty Platform
              </span>
            </h1>

            <p className="mt-8 text-xl text-white/80 leading-relaxed max-w-2xl">
              A complete real estate ecosystem designed for
              brokers, developers, agents, and property buyers.
              Manage listings, commissions, teams, and property
              transactions all in one platform.
            </p>

            <div className="flex flex-wrap gap-5 mt-10">

              <button className="bg-[#c9a063] text-black px-8 py-4 rounded-2xl font-bold shadow-2xl hover:scale-105 transition-all duration-300">
                Get Started
              </button>

              <button className="border border-white text-white px-8 py-4 rounded-2xl hover:bg-white hover:text-black transition-all duration-300">
                Watch Demo
              </button>

            </div>

            <div className="grid grid-cols-3 gap-4 md:gap-10 mt-16">

              <div>
                <h2 className="text-3xl md:text-5xl font-black text-white">
                  2K+
                </h2>

                <p className="text-white/70 mt-2 text-sm md:text-base">
                  Active Agents
                </p>
              </div>

              <div>
                <h2 className="text-3xl md:text-5xl font-black text-white">
                  300+
                </h2>

                <p className="text-white/70 mt-2 text-sm md:text-base">
                  Developers
                </p>
              </div>

              <div>
                <h2 className="text-3xl md:text-5xl font-black text-white">
                  1,200+
                </h2>

                <p className="text-white/70 mt-2 text-sm md:text-base">
                  Properties
                </p>
              </div>

            </div>

          </div>

          <div className="relative z-30 mt-16 translate-y-8">
            <SearchBox
              filters={filters}
              onFilterChange={setFilters}
              onSearch={handleSearchProperties}
            />
          </div>

        </div>

      </div>

      {/* ABOUT */}
      <section
  id="about"
  className="relative bg-[#faf8f5] py-36 overflow-hidden"
>
  {/* GLOW EFFECTS */}
  <div className="absolute top-20 left-10 w-72 h-72 bg-[#d6a77a]/20 rounded-full blur-[120px]"></div>

  <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-200/30 rounded-full blur-[140px]"></div>

  <div className="max-w-7xl mx-auto px-6 md:px-12">

    <div className="grid lg:grid-cols-2 gap-24 items-center">

      {/* LEFT */}
      <div>

        <p className="uppercase tracking-[6px] text-[#8b5e3c] font-bold mb-5">
          About Zonal Realty
        </p>

        <h2 className="text-5xl md:text-7xl font-black text-[#2d1f18] leading-[0.95]">
          Next Generation
          <br />
          Real Estate
        </h2>

        <p className="mt-8 text-lg text-gray-600 leading-relaxed max-w-xl">
          Zonal Realty empowers developers,
          brokers and agents through a modern
          real estate ecosystem built for speed,
          transparency and growth.
        </p>

        <div className="grid grid-cols-3 gap-8 mt-12">

          <div>
            <h3 className="text-4xl font-black text-[#2d1f18]">
              2K+
            </h3>

            <p className="text-gray-500">
              Agents
            </p>
          </div>

          <div>
            <h3 className="text-4xl font-black text-[#2d1f18]">
              300+
            </h3>

            <p className="text-gray-500">
              Developers
            </p>
          </div>

          <div>
            <h3 className="text-4xl font-black text-[#2d1f18]">
              1.2K+
            </h3>

            <p className="text-gray-500">
              Properties
            </p>
          </div>

        </div>

      </div>

      <div>
  <About3D />
</div>

    </div>

  </div>

      </section>

      {/* DEVELOPERS */}
<section
  id="developers"
  className="relative bg-[#f8f5f0] py-36 overflow-hidden"
>

  {/* Background Glow */}
  <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#d6a77a]/10 rounded-full blur-[150px]" />
  <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#c9a063]/10 rounded-full blur-[150px]" />

  <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">

    {/* Heading */}
    <div className="text-center mb-24">

      <span
        className="
          inline-block
          px-5
          py-2
          rounded-full
          bg-[#d6a77a]/10
          text-[#8b5e3c]
          uppercase
          tracking-[4px]
          text-xs
          font-bold
          mb-6
        "
      >
        Our Professionals
      </span>

      <h2 className="text-6xl md:text-7xl font-black text-[#2d1f18]">
        Meet The Experts
      </h2>

      <p className="mt-6 text-gray-500 max-w-2xl mx-auto text-lg">
        Our experienced property consultants and real estate
        professionals are committed to helping clients find
        the perfect investment and dream home.
      </p>

    </div>

    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">

  {[
    {
      name: 'James Carter',
      role: 'Senior Property Developer',
      image:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1200&auto=format&fit=crop',
    },
    {
      name: 'Sophia Miller',
      role: 'Real Estate Consultant',
      image:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1200&auto=format&fit=crop',
    },
    {
      name: 'Michael Lee',
      role: 'Luxury Property Specialist',
      image:
        'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1200&auto=format&fit=crop',
    },
    {
      name: 'Daniel Reyes',
      role: 'Sales Director',
      image:
        'https://images.unsplash.com/photo-1504257432389-52343af06ae3?q=80&w=1200&auto=format&fit=crop',
    },
    {
      name: 'Olivia Cruz',
      role: 'Property Consultant',
      image:
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=1200&auto=format&fit=crop',
    },
    {
      name: 'Mark Santos',
      role: 'Broker Manager',
      image:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1200&auto=format&fit=crop',
    },
    {
      name: 'Emma Walker',
      role: 'Investment Advisor',
      image:
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1200&auto=format&fit=crop',
    },
    {
      name: 'Nathan Cole',
      role: 'Property Analyst',
      image:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1200&auto=format&fit=crop',
    },
  ].map((dev, index) => (
    <div
      key={index}
      className="
      group
      relative
      h-[450px]
      rounded-[35px]
      overflow-hidden
      shadow-[0_20px_50px_rgba(0,0,0,0.15)]
      hover:-translate-y-3
      transition-all
      duration-500
      "
    >

      <img
        src={dev.image}
        alt={dev.name}
        className="
        w-full
        h-full
        object-cover
        group-hover:scale-110
        transition-all
        duration-700
        "
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

      <div className="absolute inset-4 border border-white/20 rounded-[28px]" />

      <div className="absolute bottom-6 left-6 right-6">

        <span
          className="
          inline-block
          px-3 py-1
          rounded-full
          bg-[#d6a77a]
          text-black
          text-xs
          font-bold
          "
        >
          TEAM MEMBER
        </span>

        <h3 className="text-white text-2xl font-black mt-4">
          {dev.name}
        </h3>

        <p className="text-white/70 mt-2">
          {dev.role}
        </p>

      </div>

    </div>
  ))}

    </div>
  </div>

</section>
{/* TRUSTED DEVELOPERS */}
<section className="relative py-40 bg-[#faf8f5] overflow-hidden">

  <div className="w-full px-6 md:px-12">

    <div className="text-center mb-20">

      <span className="
        px-5 py-2
        rounded-full
        bg-[#d6a77a]/10
        text-[#8b5e3c]
        uppercase
        tracking-[4px]
        text-xs
        font-bold
      ">
        Trusted Developers
      </span>

      <h2 className="mt-6 text-5xl md:text-6xl font-black text-[#2d1f18]">
        Partner Developers
      </h2>

      <p className="mt-4 text-gray-500">
        Connected with the country's leading real estate brands.
      </p>

    </div>

    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">

      {[
        {
          name: 'Ayala Land',
          logo: 'https://upload.wikimedia.org/wikipedia/en/7/7f/Ayala_Land_logo.svg',
        },
        {
          name: 'Megaworld',
          logo: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Megaworld_Corporation_logo.svg',
        },
        {
          name: 'SMDC',
          logo: 'https://www.smdc.com/content/dam/smdc/logo/smdc-logo.svg',
        },
        {
          name: 'DMCI Homes',
          logo: 'https://www.dmcihomes.com/themes/dmci/images/logo.svg',
        },
        {
          name: 'Vista Land',
          logo: 'https://www.vistaland.com.ph/wp-content/uploads/2022/03/logo.png',
        },
        {
          name: 'Filinvest',
          logo: 'https://www.filinvestland.com/wp-content/themes/filinvest/assets/images/logo.svg',
        },
        {
          name: 'Federal Land',
          logo: 'https://federallandph.com/wp-content/uploads/2021/08/logo.png',
        },
        {
          name: 'Robinsons Land',
          logo: 'https://www.robinsonsland.com/sites/default/files/rli-logo.png',
        },
        {
          name: 'Shang Properties',
          logo: 'https://www.shangproperties.com/wp-content/themes/shang/images/logo.png',
        },
        {
          name: 'Century Properties',
          logo: 'https://century-properties.com/wp-content/uploads/2022/06/logo.png',
        },
      ].map((dev, index) => (

        <div
          key={index}
          className="
          bg-white
          rounded-[30px]
          p-8
          h-[180px]
          flex
          flex-col
          items-center
          justify-center
          shadow-lg
          hover:-translate-y-2
          hover:shadow-2xl
          transition-all
          duration-300
          "
        >

          <img
            src={dev.logo}
            alt={dev.name}
            className="h-12 object-contain"
          />

          <p className="mt-5 font-semibold text-[#2d1f18] text-center">
            {dev.name}
          </p>

        </div>

      ))}

    </div>
  </div>
</section>

{/* FEATURED PROPERTIES */}
<section
  id="properties"
  className="py-40 bg-[#f6f1eb]"
>

  <div className="max-w-7xl mx-auto px-6 md:px-12">

    {/* HEADING */}
    <div className="text-center mb-20">

      <span
        className="
          inline-block
          px-5
          py-2
          rounded-full
          bg-[#d6a77a]/10
          text-[#8b5e3c]
          uppercase
          tracking-[4px]
          text-xs
          font-bold
          mb-6
        "
      >
        Featured Properties
      </span>

      <h2 className="text-6xl md:text-7xl font-black text-[#2d1f18]">
        Popular Listings
      </h2>

      <p className="mt-6 text-gray-500 max-w-2xl mx-auto text-lg">
        Discover premium residential and investment
        properties from trusted developers across
        the Philippines.
      </p>

    </div>

    {/* PROPERTY GRID */}
    <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-8">

      {filteredProperties.map((property, index) => (

        <div
          key={index}
          className="
            bg-white
            rounded-[32px]
            overflow-hidden
            shadow-lg
            hover:shadow-2xl
            hover:-translate-y-3
            transition-all
            duration-500
          "
        >

          <div className="relative">

            <img
              src={property.image}
              alt=""
              className="
                w-full
                h-[150px]
                object-cover
              "
            />

            <span
              className="
                absolute
                top-4
                left-4
                px-4
                py-2
                rounded-full
                bg-[#d6a77a]
                text-black
                text-xs
                font-bold
              "
            >
              Featured
            </span>

          </div>

          <div className="p-6 flex flex-col min-h-[230px]">

  <p className="text-[#a56b3f] text-sm font-medium uppercase tracking-wide">
    {property.location}
  </p>

  <h3
    className="
      mt-2
      text-[26px]
      leading-tight
      font-serif
      font-semibold
      text-[#2d1f18]
    "
  >
    {property.title}
  </h3>

  {/* Spacer */}
  <div className="flex-1"></div>

  <div className="flex items-center justify-between pt-6">

    <span
      className="
        text-[34px]
        font-black
        text-[#d2a06b]
      "
    >
      {formatPrice(property)}
    </span>

    <button
      type="button"
      onClick={() => setSelectedProperty(property)}
      className="
        bg-[#2d1f18]
        text-white
        px-6
        py-3
        rounded-xl
        font-medium
        hover:bg-[#3f2c22]
        transition
      "
    >
      View
    </button>

  </div>

</div>

        </div>

      ))}

      {filteredProperties.length === 0 && (
        <div className="md:col-span-2 xl:col-span-4 rounded-[28px] bg-white p-10 text-center shadow-lg">
          <h3 className="text-2xl font-black text-[#2d1f18]">
            No matching properties found
          </h3>

          <p className="mt-3 text-gray-500">
            Try another location, property type, or budget range.
          </p>
        </div>
      )}

    </div>

  </div>

</section>

{selectedProperty && (
  <PropertyDetailsModal
    property={selectedProperty}
    onClose={() => setSelectedProperty(null)}
  />
)}

{/* FOOTER */}
<footer className="relative bg-[#111111] overflow-hidden">

  {/* Glow */}
  <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#d6a77a]/10 rounded-full blur-[150px]" />
  <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#d6a77a]/10 rounded-full blur-[150px]" />

  <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-24">

    {/* TOP */}
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-16 pb-16 border-b border-white/10">

      {/* BRAND */}
      <div>

        <h2 className="text-4xl font-black text-white">
          Zonal
          <span className="text-[#d6a77a]">
            Realty
          </span>
        </h2>

        <p className="mt-6 text-white/60 leading-relaxed">
          A complete real estate ecosystem designed
          for developers, brokers, agents and
          property buyers across the Philippines.
        </p>

      </div>

      {/* QUICK LINKS */}
      <div>

        <h3 className="text-white font-bold text-lg mb-6">
          Quick Links
        </h3>

        <ul className="space-y-4">

          <li>
            <a href="#home" className="text-white/60 hover:text-[#d6a77a] transition">
              Home
            </a>
          </li>

          <li>
            <a href="#about" className="text-white/60 hover:text-[#d6a77a] transition">
              About
            </a>
          </li>

          <li>
            <a href="#developers" className="text-white/60 hover:text-[#d6a77a] transition">
              Developers
            </a>
          </li>

          <li>
            <a href="#properties" className="text-white/60 hover:text-[#d6a77a] transition">
              Properties
            </a>
          </li>

        </ul>

      </div>

      {/* SERVICES */}
      <div>

        <h3 className="text-white font-bold text-lg mb-6">
          Services
        </h3>

        <ul className="space-y-4">

          <li className="text-white/60">
            Property Listings
          </li>

          <li className="text-white/60">
            Broker Management
          </li>

          <li className="text-white/60">
            Commission Tracking
          </li>

          <li className="text-white/60">
            Developer Portal
          </li>

        </ul>

      </div>

      {/* CONTACT */}
      <div>

        <h3 className="text-white font-bold text-lg mb-6">
          Contact
        </h3>

        <ul className="space-y-4">

          <li className="text-white/60">
            Manila, Philippines
          </li>

          <li className="text-white/60">
            contact@zonalrealty.com
          </li>

          <li className="text-white/60">
            +63 912 345 6789
          </li>

        </ul>

      </div>

    </div>

    {/* BOTTOM */}
    <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-8">

      <p className="text-white/40 text-sm">
       © {new Date().getFullYear()} Zonal Realty. All Rights Reserved.
      </p>

      <div className="flex gap-4">

        <a
          href="#"
          className="
          w-12 h-12
          rounded-full
          border border-white/10
          flex items-center justify-center
          text-white/60
          hover:bg-[#d6a77a]
          hover:text-black
          transition
          "
        >
          FB
        </a>

        <a
          href="#"
          className="
          w-12 h-12
          rounded-full
          border border-white/10
          flex items-center justify-center
          text-white/60
          hover:bg-[#d6a77a]
          hover:text-black
          transition
          "
        >
          IG
        </a>

        <a
          href="#"
          className="
          w-12 h-12
          rounded-full
          border border-white/10
          flex items-center justify-center
          text-white/60
          hover:bg-[#d6a77a]
          hover:text-black
          transition
          "
        >
          IN
        </a>

      </div>

    </div>

  </div>

</footer>
    </section>
  )
}

function PropertyDetailsModal({ property, onClose }) {
  const agents = availableAgents.filter((agent) =>
    property.agentIds.includes(agent.id)
  )

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 px-4 py-6 backdrop-blur-sm">
      <div className="mx-auto w-full max-w-6xl overflow-hidden rounded-[28px] bg-[#fbf8f3] shadow-2xl">
        <div className="relative h-[280px] overflow-hidden md:h-[420px]">
          <img
            src={property.image}
            alt={property.title}
            className="h-full w-full object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

          <button
            type="button"
            onClick={onClose}
            className="absolute right-5 top-5 rounded-full bg-white/95 p-3 text-[#2d1f18] shadow-lg transition hover:bg-white"
            aria-label="Close property details"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="absolute bottom-6 left-6 right-6 text-white md:bottom-10 md:left-10">
            <p className="inline-flex items-center gap-2 rounded-full bg-[#d6a77a] px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-black">
              Featured Listing
            </p>

            <h2 className="mt-4 text-4xl font-black leading-tight md:text-6xl">
              {property.title}
            </h2>

            <p className="mt-3 flex items-center gap-2 text-lg text-white/80">
              <MapPin className="h-5 w-5" />
              {property.location}
            </p>
          </div>
        </div>

        <div className="grid gap-8 p-6 lg:grid-cols-[1.25fr_0.75fr] lg:p-10">
          <div>
            <div className="flex flex-col gap-4 border-b border-[#e5d8c8] pb-8 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.25em] text-[#a56b3f]">
                  Property Details
                </p>

                <h3 className="mt-2 text-4xl font-black text-[#2d1f18]">
                  {formatPrice(property)}
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Spec icon={BedDouble} label="Beds" value={property.beds} />
                <Spec icon={Bath} label="Baths" value={property.baths} />
                <Spec icon={Car} label="Parking" value={property.parking} />
                <Spec icon={Ruler} label="Area" value={property.floorArea} />
              </div>
            </div>

            <p className="mt-8 text-lg leading-relaxed text-gray-600">
              {property.description}
            </p>

            <div className="mt-8 grid gap-3 md:grid-cols-3">
              {property.highlights.map((highlight) => (
                <div
                  key={highlight}
                  className="flex items-start gap-3 rounded-2xl bg-white p-4 shadow-sm"
                >
                  <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                  <p className="text-sm font-semibold text-[#2d1f18]">
                    {highlight}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-[24px] bg-[#2d1f18] p-6 text-white">
              <p className="text-sm font-bold uppercase tracking-[0.25em] text-[#d6a77a]">
                Buyer Inquiry Process
              </p>

              <div className="mt-5 grid gap-4 md:grid-cols-3">
                {[
                  'Choose an available agent for this property.',
                  'Ask for sample computation, availability, and viewing schedule.',
                  'Agent coordinates the site viewing or next buying step.',
                ].map((step, index) => (
                  <div key={step} className="rounded-2xl bg-white/10 p-4">
                    <p className="text-2xl font-black text-[#d6a77a]">
                      0{index + 1}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-white/80">
                      {step}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside className="rounded-[24px] bg-white p-5 shadow-lg">
            <div className="mb-5">
              <p className="text-sm font-bold uppercase tracking-[0.25em] text-[#a56b3f]">
                Available Agents
              </p>
              <h3 className="mt-2 text-2xl font-black text-[#2d1f18]">
                Contact for this property
              </h3>
            </div>

            <div className="space-y-4">
              {agents.map((agent) => (
                <div
                  key={agent.id}
                  className="rounded-2xl border border-[#eadccd] p-4"
                >
                  <div className="flex gap-4">
                    <img
                      src={agent.image}
                      alt={agent.name}
                      className="h-16 w-16 rounded-2xl object-cover"
                    />

                    <div>
                      <h4 className="font-black text-[#2d1f18]">
                        {agent.name}
                      </h4>
                      <p className="text-sm text-gray-500">{agent.role}</p>
                      <p className="mt-1 text-xs font-semibold text-[#a56b3f]">
                        {agent.area}
                      </p>
                    </div>
                  </div>

                  <p className="mt-4 rounded-xl bg-[#f8f3ed] px-4 py-3 text-sm font-semibold text-[#2d1f18]">
                    {agent.response}
                  </p>

                  <div className="mt-4 grid grid-cols-3 gap-2">
                    <a
                      href={`tel:${agent.phone.replaceAll(' ', '')}`}
                      className="inline-flex items-center justify-center rounded-xl bg-[#2d1f18] px-3 py-3 text-white transition hover:bg-[#3f2c22]"
                      aria-label={`Call ${agent.name}`}
                    >
                      <Phone className="h-4 w-4" />
                    </a>

                    <a
                      href={`mailto:${agent.email}?subject=Inquiry for ${property.title}`}
                      className="inline-flex items-center justify-center rounded-xl bg-[#d6a77a] px-3 py-3 text-black transition hover:bg-[#c7955f]"
                      aria-label={`Email ${agent.name}`}
                    >
                      <Mail className="h-4 w-4" />
                    </a>

                    <a
                      href={`sms:${agent.phone.replaceAll(' ', '')}?body=Hi ${agent.name}, I am interested in ${property.title} in ${property.location}.`}
                      className="inline-flex items-center justify-center rounded-xl border border-[#d6a77a] px-3 py-3 text-[#2d1f18] transition hover:bg-[#f8f3ed]"
                      aria-label={`Message ${agent.name}`}
                    >
                      <MessageCircle className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

function Spec({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl bg-white px-4 py-3 text-center shadow-sm">
      <Icon className="mx-auto h-5 w-5 text-[#a56b3f]" />
      <p className="mt-1 text-lg font-black text-[#2d1f18]">{value}</p>
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
        {label}
      </p>
    </div>
  )
}

function formatPrice(property) {
  return `${peso}${property.priceValue.toFixed(1)}M`
}

export default Hero
