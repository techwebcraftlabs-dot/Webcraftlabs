import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Bath,
  BedDouble,
  Building2,
  Car,
  CheckCircle,
  House,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Ruler,
  TrendingUp,
  UsersRound,
  X,
} from 'lucide-react'

import SearchBox from './SearchBox'
import About3D from './About3D'
import AgentSocialLinks, { FacebookIcon } from './AgentSocialLinks'
import { propertyApi, publicStatsApi } from '../lib/api'
import { formatPropertyPrice, propertyPriceIntersects } from '../lib/propertyPrice'
import { groupPropertiesByProject } from '../lib/propertyProjects'

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
  'Under 7M': (property) => propertyPriceIntersects(property, 0, 6_999_999),
  '7M - 15M': (property) => propertyPriceIntersects(property, 7_000_000, 15_000_000),
  '15M+': (property) => propertyPriceIntersects(property, 15_000_001),
}

function Hero() {
  const [savedProperties, setSavedProperties] = useState(
    () => propertyListings.slice(0, 0)
  )
  const [selectedProperty, setSelectedProperty] = useState(null)
  const [filters, setFilters] = useState({
    location: '',
    type: '',
    budget: '',
  })

  useEffect(() => {
    propertyApi.list()
      .then((records) => setSavedProperties(records.map((property) => ({
        ...property,
        image: property.image || propertyApi.imageUrl(property.id),
        highlights: property.highlights || [],
        agentIds: property.agentIds || [],
        description: property.description || '',
        lotArea: property.lotArea || '',
      }))))
      .catch((error) => {
        console.error('Unable to load homepage properties.', error)
        setSavedProperties([])
      })
  }, [])

  const filteredProperties = useMemo(() => {
    const matchingVariants = savedProperties.filter((property) => {
      const matchesLocation =
        !filters.location ||
        property.location.toLowerCase().includes(filters.location.toLowerCase())
      const matchesType = !filters.type || property.type === filters.type
      const matchesBudget =
        !filters.budget || budgetRanges[filters.budget]?.(property)

      return matchesLocation && matchesType && matchesBudget
    })

    return groupPropertiesByProject(matchingVariants)
  }, [filters, savedProperties])

  const handleSearchProperties = () => {
    document.getElementById('properties')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }

  return (
    <section id="home">

      {/* HERO */}
      <div className="relative bg-white pt-[66px]">
        <div className="relative overflow-hidden pb-8 md:min-h-[680px] md:pb-0 lg:min-h-[calc(100svh-66px)]">
          <img
            src="/homepage-neighborhood.png"
            alt="Residential subdivision"
            className="absolute inset-0 h-full w-full object-cover"
          />

          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/52 to-black/5" />
          <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/65 to-transparent" />

          <div className="relative z-20 mx-auto max-w-[1180px] px-5 pb-0 pt-9 sm:px-6 md:px-10 md:pt-12 xl:px-0">
            <div className="max-w-[660px]">
              <div className="mb-5 inline-flex max-w-full items-center gap-3 rounded-full border border-white/15 bg-black/45 px-4 py-2.5 text-xs font-semibold text-white shadow-2xl backdrop-blur-md sm:px-5 sm:py-3 sm:text-sm">
                <span className="h-3 w-3 rounded-full bg-emerald-400 shadow-[0_0_0_6px_rgba(52,211,153,0.12)]" />
                Trusted by 100+ Real Estate Developers
              </div>

              <h1 className="leading-none">
                <img
                  src="/zonal-realty-logo.png"
                  alt="Zonal Realty"
                  className="h-24 w-auto max-w-full object-contain object-left brightness-0 invert sm:h-28 lg:h-32"
                />
              </h1>

              <p className="mt-5 max-w-[650px] text-base font-medium leading-7 text-white lg:text-lg lg:leading-8">
                Find the right home, investment property, or project launch
                through a curated marketplace backed by trusted developers and
                licensed real estate professionals.
              </p>

              <div className="mt-6 grid max-w-[680px] gap-3 text-sm font-semibold text-white sm:grid-cols-3">
                {[
                  'Verified property listings',
                  'Projects from trusted developers',
                  'Agent-assisted buying',
                ].map((item) => (
                  <div
                    key={item}
                    className="flex min-h-[54px] items-center gap-2 rounded-xl border border-[#d6b56d]/30 bg-black/35 px-3 py-3 backdrop-blur-md lg:px-4"
                  >
                    <CheckCircle className="h-4 w-4 shrink-0 text-[#d4af37]" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="relative z-40 mt-8 px-5 md:px-8 xl:px-12">
            <div className="mx-auto max-w-[1000px]">
              <SearchBox
                filters={filters}
                onFilterChange={setFilters}
                onSearch={handleSearchProperties}
              />
            </div>
          </div>

          <div className="relative z-30 mt-8">
            <HomeStatsStrip />
          </div>
        </div>
      </div>

      {/* ABOUT */}
      <section
  id="about"
  className="relative overflow-hidden bg-[#faf9f6] py-14 sm:py-16 lg:py-20"
>
  {/* GLOW EFFECTS */}
  <div className="absolute top-20 left-10 w-72 h-72 bg-[#bfdbfe]/20 rounded-full blur-[120px]"></div>

  <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-200/30 rounded-full blur-[140px]"></div>

  <div className="max-w-7xl mx-auto px-5 sm:px-6 md:px-8 xl:px-12">

    <div className="grid gap-10 items-center lg:grid-cols-2 lg:gap-14 xl:gap-20">

      {/* LEFT */}
      <div>

        <p className="mb-4 text-xs font-black uppercase tracking-[0.22em] text-[#9b762f]">
          About Zonal Realty
        </p>

        <h2 className="text-[clamp(2.4rem,6vw,3.8rem)] font-black leading-[0.96] tracking-tight text-[#071a3d]">
          Next Generation
          <br />
          Real Estate
        </h2>

        <p className="mt-5 max-w-xl text-base leading-7 text-slate-600 lg:text-lg">
          Zonal Realty empowers developers,
          brokers and agents through a modern
          real estate ecosystem built for speed,
          transparency and growth.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">

          <div className="rounded-2xl border border-[#e7dfcf] bg-white p-4 shadow-[0_10px_28px_rgba(7,26,61,0.05)]">
            <h3 className="text-2xl font-black text-[#071a3d] lg:text-3xl">
              2K+
            </h3>

            <p className="text-gray-500">
              Agents
            </p>
          </div>

          <div className="rounded-2xl border border-[#e7dfcf] bg-white p-4 shadow-[0_10px_28px_rgba(7,26,61,0.05)]">
            <h3 className="text-2xl font-black text-[#071a3d] lg:text-3xl">
              300+
            </h3>

            <p className="text-gray-500">
              Developers
            </p>
          </div>

          <div className="rounded-2xl border border-[#e7dfcf] bg-white p-4 shadow-[0_10px_28px_rgba(7,26,61,0.05)]">
            <h3 className="text-2xl font-black text-[#071a3d] lg:text-3xl">
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
  className="relative overflow-hidden border-y border-[#e8e3da] bg-white py-14 sm:py-16 lg:py-20"
>

  {/* Background Glow */}
  <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#bfdbfe]/10 rounded-full blur-[150px]" />
  <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#60a5fa]/10 rounded-full blur-[150px]" />

  <div className="max-w-7xl mx-auto px-5 sm:px-6 md:px-8 xl:px-12 relative z-10">

    {/* Heading */}
    <div className="text-center mb-10 sm:mb-12 lg:mb-14">

      <span
        className="
          inline-block
          px-5
          py-2
          rounded-full
          border border-[#d6b56d]/30
          bg-[#faf7ef]
          text-[#9b762f]
          uppercase
          tracking-[0.24em]
          text-xs
          font-bold
          mb-6
        "
      >
        Our Professionals
      </span>

      <h2 className="text-[clamp(2.3rem,6vw,3.65rem)] font-black leading-tight tracking-tight text-[#071a3d]">
        Meet The Experts
      </h2>

      <p className="mt-6 text-gray-500 max-w-2xl mx-auto text-lg">
        Our experienced property consultants and real estate
        professionals are committed to helping clients find
        the perfect investment and dream home.
      </p>

    </div>

    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 xl:gap-6">

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
      h-[320px]
      rounded-[22px]
      overflow-hidden
      border border-[#d6b56d]/20
      shadow-[0_16px_38px_rgba(7,26,61,0.12)]
      hover:-translate-y-2
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

      <div className="absolute inset-4 border border-white/20 rounded-[20px]" />

      <div className="absolute bottom-6 left-6 right-6">

        <span
          className="
          inline-block
          px-3 py-1
          rounded-full
          bg-[#d6b56d]
          text-[#071a3d]
          text-xs
          font-bold
          "
        >
          TEAM MEMBER
        </span>

        <h3 className="mt-3 text-xl font-black text-white">
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
<section className="relative overflow-hidden bg-[#faf9f6] py-14 sm:py-16 lg:py-20">

  <div className="w-full px-5 sm:px-6 md:px-8 xl:px-12">

    <div className="text-center mb-10 sm:mb-12">

      <span className="
        px-5 py-2
        rounded-full
        border border-[#d6b56d]/30
        bg-white
        text-[#9b762f]
        uppercase
        tracking-[0.24em]
        text-xs
        font-bold
      ">
        Trusted Developers
      </span>

      <h2 className="mt-6 text-[clamp(2.25rem,6vw,3.5rem)] font-black leading-tight tracking-tight text-[#071a3d]">
        Partner Developers
      </h2>

      <p className="mt-4 text-gray-500">
        Connected with the country's leading real estate brands.
      </p>

    </div>

    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 lg:gap-4">

      {[
        {
          name: 'Ayala Land',
          mark: 'AL',
        },
        {
          name: 'Megaworld',
          mark: 'MW',
        },
        {
          name: 'SMDC',
          mark: 'SM',
        },
        {
          name: 'DMCI Homes',
          mark: 'DM',
        },
        {
          name: 'Vista Land',
          mark: 'VL',
        },
        {
          name: 'Filinvest',
          mark: 'FI',
        },
        {
          name: 'Federal Land',
          mark: 'FL',
        },
        {
          name: 'Robinsons Land',
          mark: 'RL',
        },
        {
          name: 'Shang Properties',
          mark: 'SP',
        },
        {
          name: 'Century Properties',
          mark: 'CP',
        },
      ].map((dev, index) => (

        <div
          key={index}
          className="
          bg-white
          rounded-2xl
          border border-[#e7dfcf]
          p-4
          min-h-[112px]
          flex
          flex-col
          items-center
          justify-center
          shadow-[0_10px_26px_rgba(7,26,61,0.06)]
          hover:-translate-y-1
          hover:border-[#d6b56d]
          hover:shadow-[0_16px_34px_rgba(7,26,61,0.10)]
          transition-all
          duration-300
          "
        >

          <div
            className="
              flex
              h-14
              w-14
              items-center
              justify-center
              rounded-2xl
              border border-[#d6b56d]/50
              bg-[#071a3d]
              text-xl
              font-black
              text-white
              shadow-inner
            "
            aria-hidden="true"
          >
            {dev.mark}
          </div>

          <p className="mt-4 font-semibold text-[#111827] text-center">
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
  className="border-t border-[#e8e3da] bg-[#f5f7fa] py-14 sm:py-16 lg:py-20"
>

  <div className="max-w-7xl mx-auto px-5 sm:px-6 md:px-8 xl:px-12">

    {/* HEADING */}
    <div className="text-center mb-10 sm:mb-12">

      <span
        className="
          inline-block
          px-5
          py-2
          rounded-full
          border border-[#d6b56d]/30
          bg-white
          text-[#9b762f]
          uppercase
          tracking-[0.24em]
          text-xs
          font-bold
          mb-6
        "
      >
        Featured Properties
      </span>

      <h2 className="text-[clamp(2.3rem,6vw,3.65rem)] font-black leading-tight tracking-tight text-[#071a3d]">
        Popular Listings
      </h2>

      <p className="mt-6 text-gray-500 max-w-2xl mx-auto text-lg">
        Discover premium residential and investment
        properties from trusted developers across
        the Philippines.
      </p>

    </div>

    {/* PROPERTY GRID */}
    <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,280px))] justify-center gap-6 xl:gap-8">

      {filteredProperties.map((property) => (

        <div
          key={property.projectKey}
          className="
            bg-white
            rounded-[22px]
            border border-[#e7dfcf]
            overflow-hidden
            shadow-[0_14px_34px_rgba(7,26,61,0.08)]
            hover:border-[#d6b56d]
            hover:shadow-[0_20px_44px_rgba(7,26,61,0.12)]
            hover:-translate-y-2
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
                bg-[#bfdbfe]
                text-black
                text-xs
                font-bold
              "
            >
              Featured
            </span>

          </div>

          <div className="p-5 sm:p-6 flex flex-col min-h-[230px]">

  <p className="text-[#111827] text-sm font-medium uppercase tracking-wide">
    {property.location}
  </p>

  <h3
    className="
      mt-2
      text-2xl
      leading-tight
      font-serif
      font-semibold
      text-[#111827]
    "
  >
    {property.title}
  </h3>

  <p className="mt-3 text-xs font-bold uppercase tracking-[0.14em] text-[#9b762f]">
    {property.propertyTypes.length} {property.propertyTypes.length === 1 ? 'Property Type' : 'Property Types'} Available
  </p>

  {/* Spacer */}
  <div className="flex-1"></div>

  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 pt-6">

    <span
      className="
        min-w-0
        truncate
        text-xl
        sm:text-2xl
        font-black
        text-[#111827]
      "
    >
      {formatPrice(property)}
    </span>

    <button
      type="button"
      onClick={() => setSelectedProperty(property)}
      className="
        bg-[#0d1b4c]
        text-white
        shrink-0
        px-4
        py-2.5
        rounded-xl
        font-medium
        hover:bg-[#09122f]
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
          <h3 className="text-2xl font-black text-[#111827]">
            No property listings yet
          </h3>

          <p className="mt-3 text-gray-500">
            Properties added by an Administrator or EVP will appear here.
          </p>
        </div>
      )}

    </div>

    <div className="mt-14 flex justify-center">
      <Link
        to="/properties"
        className="
          inline-flex
          items-center
          justify-center
          rounded-2xl
          bg-[#0d1b4c]
          px-8
          py-4
          text-base
          font-bold
          text-white
          shadow-xl
          transition
          duration-300
          hover:-translate-y-1
          hover:bg-[#09122f]
        "
      >
        Explore More Properties
      </Link>
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
<footer id="contact" className="relative overflow-hidden border-t border-[#d6b56d]/50 bg-[linear-gradient(135deg,#020817_0%,#07152f_52%,#081c3c_100%)]">

  {/* Glow */}
  <div className="absolute -left-40 -top-56 h-[480px] w-[480px] rounded-full bg-blue-600/10 blur-[140px]" />
  <div className="absolute -bottom-64 -right-36 h-[500px] w-[500px] rounded-full bg-[#c9a96e]/10 blur-[150px]" />
  <div aria-hidden="true" className="absolute right-[8%] top-10 hidden h-48 w-80 rotate-[-12deg] border border-[#d6b56d]/10 lg:block" />

  <div className="relative z-10 mx-auto max-w-7xl px-5 py-12 sm:px-6 md:px-8 lg:py-14 xl:px-12">

    {/* TOP */}
    <div className="grid gap-10 border-b border-white/10 pb-10 sm:grid-cols-2 lg:grid-cols-[1.35fr_.8fr_.9fr_1.25fr] lg:gap-12 lg:pb-12">

      {/* BRAND */}
      <div>

        <h2>
          <img
            src="/zonal-realty-logo.png"
            alt="Zonal Realty"
            className="h-16 w-auto max-w-full object-contain object-left brightness-0 invert"
          />
        </h2>

        <div className="mt-4 h-px w-12 bg-[#d6b56d]" />
        <p className="mt-4 text-sm leading-6 text-white/60">
          A complete real estate ecosystem designed
          for developers, brokers, agents and
          property buyers across the Philippines.
        </p>

      </div>

      {/* QUICK LINKS */}
      <div>

        <h3 className="mb-5 text-xs font-black uppercase tracking-[0.16em] text-[#e1bd70]">
          Quick Links
        </h3>

        <ul className="space-y-3 text-sm">

          <li>
            <a href="#home" className="group inline-flex items-center gap-2 text-white/60 transition hover:text-white"><span className="h-1 w-1 rounded-full bg-[#d6b56d] transition-all group-hover:w-3" />
              Home
            </a>
          </li>

          <li>
            <a href="#about" className="group inline-flex items-center gap-2 text-white/60 transition hover:text-white"><span className="h-1 w-1 rounded-full bg-[#d6b56d] transition-all group-hover:w-3" />
              About
            </a>
          </li>

          <li>
            <a href="#developers" className="group inline-flex items-center gap-2 text-white/60 transition hover:text-white"><span className="h-1 w-1 rounded-full bg-[#d6b56d] transition-all group-hover:w-3" />
              Developers
            </a>
          </li>

          <li>
            <a href="#properties" className="group inline-flex items-center gap-2 text-white/60 transition hover:text-white"><span className="h-1 w-1 rounded-full bg-[#d6b56d] transition-all group-hover:w-3" />
              Properties
            </a>
          </li>

        </ul>

      </div>

      {/* SERVICES */}
      <div>

        <h3 className="mb-5 text-xs font-black uppercase tracking-[0.16em] text-[#e1bd70]">
          Services
        </h3>

        <ul className="space-y-3 text-sm">

          <li className="border-l border-white/10 pl-3 text-white/60">
            Property Listings
          </li>

          <li className="border-l border-white/10 pl-3 text-white/60">
            Broker Management
          </li>

          <li className="border-l border-white/10 pl-3 text-white/60">
            Commission Tracking
          </li>

          <li className="border-l border-white/10 pl-3 text-white/60">
            Developer Portal
          </li>

        </ul>

      </div>

      {/* CONTACT */}
      <div>

        <h3 className="mb-5 text-xs font-black uppercase tracking-[0.16em] text-[#e1bd70]">
          Contact
        </h3>

        <ul className="space-y-3 text-sm">

          <li className="flex max-w-xs items-start gap-3 rounded-xl border border-white/10 bg-white/[0.035] p-3 text-white/60">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#e1bd70]" />
            Block 2 Lot 26 Westwood Highlands, Langkaan 1, Dasmariñas, Philippines, 4114
          </li>

          <li className="flex items-center gap-3 text-white/60">
            <Mail className="h-4 w-4 shrink-0 text-[#e1bd70]" />
            <a
              href="mailto:zonalrealtystaff2019@gmail.com"
              className="transition hover:text-white"
            >
              zonalrealtystaff2019@gmail.com
            </a>
          </li>

          <li className="flex items-center gap-3 text-white/60">
            <Phone className="h-4 w-4 shrink-0 text-[#e1bd70]" />
            <a
              href="tel:+639399163098"
              className="transition hover:text-white"
            >
              0939 916 3098
            </a>
          </li>

        </ul>

      </div>

    </div>

    {/* BOTTOM */}
    <div className="flex flex-col items-center justify-between gap-5 pt-6 sm:flex-row">

      <p className="text-center text-xs text-white/40 sm:text-left">
       © {new Date().getFullYear()} Zonal Realty. All Rights Reserved.
      </p>

      <div className="flex gap-4">

        <a
          href="https://www.facebook.com/ZonalRealty"
          target="_blank"
          rel="noreferrer noopener"
          aria-label="Visit Zonal Realty on Facebook"
          title="Zonal Realty on Facebook"
          className="
          w-10 h-10
          rounded-full
          border border-[#d6b56d]/30
          flex items-center justify-center
          text-white/60
          hover:bg-[#d6b56d]
          hover:text-[#071a3d]
          transition
          "
        >
          <FacebookIcon className="h-5 w-5" />
        </a>

      </div>

    </div>

  </div>

</footer>
    </section>
  )
}

function HomeStatsStrip() {
  const [databaseStats, setDatabaseStats] = useState({
    activeAgents: 0,
    developers: 0,
    properties: 0,
    customerSatisfaction: 98,
  })

  useEffect(() => {
    let active = true

    publicStatsApi.get()
      .then((stats) => {
        if (active) setDatabaseStats(stats)
      })
      .catch((error) => console.error('Unable to load public homepage stats.', error))

    return () => { active = false }
  }, [])

  const stats = [
    {
      value: Number(databaseStats.activeAgents || 0).toLocaleString('en-PH'),
      label: 'Active Agents',
      icon: UsersRound,
    },
    {
      value: Number(databaseStats.developers || 0).toLocaleString('en-PH'),
      label: 'Developers',
      icon: Building2,
    },
    {
      value: Number(databaseStats.properties || 0).toLocaleString('en-PH'),
      label: 'Properties',
      icon: House,
    },
    {
      value: `${databaseStats.customerSatisfaction || 98}%`,
      label: 'Customer Satisfaction',
      icon: TrendingUp,
    },
  ]

  return (
    <div className="relative z-10 border-t border-[#d6b56d]/20 bg-black/65 py-6 backdrop-blur-md md:py-7">
      <div className="mx-auto grid max-w-[1060px] grid-cols-1 gap-3 px-5 sm:grid-cols-2 md:grid-cols-4 md:px-8 lg:px-0">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.label}
              className={`flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-3 ${
                index < stats.length - 1 ? 'md:border-r-[#d6b56d]/20' : ''
              }`}
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#d6b56d]/40 bg-[#071a3d] shadow-lg">
                <Icon className="h-5 w-5 text-[#e1bd70]" strokeWidth={2.2} />
              </div>

              <div>
                <p className="text-2xl font-black leading-none text-white">
                  {stat.value}
                </p>

                <p className="mt-1 text-xs leading-tight text-white/65">
                  {stat.label}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function PropertyDetailsModal({ property, onClose }) {
  const [selectedVariant, setSelectedVariant] = useState(property.variants?.[0] || property)
  const [agents, setAgents] = useState([])
  const [loadingAgents, setLoadingAgents] = useState(true)

  useEffect(() => {
    let active = true
    setLoadingAgents(true)

    propertyApi.assignedAgents(selectedVariant.id)
      .then((records) => {
        if (active) setAgents(records)
      })
      .catch((error) => {
        console.error(error)
        if (active) setAgents([])
      })
      .finally(() => {
        if (active) setLoadingAgents(false)
      })

    return () => { active = false }
  }, [selectedVariant.id])

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 px-4 py-6 backdrop-blur-sm">
      <div className="mx-auto w-full max-w-5xl overflow-hidden rounded-[22px] bg-[#f8fafc] shadow-2xl md:rounded-[26px]">
        <div className="relative h-[230px] overflow-hidden md:h-[330px]">
          <img
            src={selectedVariant.image}
            alt={selectedVariant.title}
            className="h-full w-full object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

          <button
            type="button"
            onClick={onClose}
            className="absolute right-5 top-5 rounded-full bg-white/95 p-3 text-[#111827] shadow-lg transition hover:bg-white"
            aria-label="Close property details"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="absolute bottom-6 left-6 right-6 text-white md:bottom-8 md:left-8">
            <p className="inline-flex items-center gap-2 rounded-full bg-[#bfdbfe] px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-black">
              Featured Listing
            </p>

            <h2 className="mt-4 text-[clamp(1.8rem,7vw,3rem)] font-black leading-tight">
              {selectedVariant.title}
            </h2>

            <p className="mt-3 flex items-center gap-2 text-base text-white/80 md:text-lg">
              <MapPin className="h-5 w-5" />
              {selectedVariant.location}
            </p>
          </div>
        </div>

        <div className="grid gap-6 p-5 md:p-6 lg:grid-cols-[1.2fr_0.8fr] lg:p-8">
          <div>
            {property.variants?.length > 0 && (
              <div className="mb-6 rounded-[20px] border border-[#e7dfcf] bg-white p-4">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-[#9b762f]">
                  Choose Property Type
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {property.variants.map((variant) => (
                    <button
                      key={variant.id}
                      type="button"
                      onClick={() => setSelectedVariant(variant)}
                      className={`rounded-xl border px-4 py-2.5 text-sm font-bold transition ${
                        selectedVariant.id === variant.id
                          ? 'border-[#0d1b4c] bg-[#0d1b4c] text-white'
                          : 'border-[#dbe4f0] bg-[#f8fafc] text-[#111827] hover:border-[#d6b56d]'
                      }`}
                    >
                      {variant.type || 'Property Type'}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col gap-4 border-b border-[#dbe4f0] pb-8 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.25em] text-[#111827]">
                  Property Details
                </p>

                <h3 className="mt-2 text-3xl font-black text-[#111827]">
                  {formatPrice(selectedVariant)}
                </h3>
              </div>

              <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-4 md:w-auto">
                <Spec icon={BedDouble} label="Beds" value={selectedVariant.beds} />
                <Spec icon={Bath} label="Baths" value={selectedVariant.baths} />
                <Spec icon={Car} label="Parking" value={selectedVariant.parking} />
                <Spec icon={Ruler} label="Area" value={selectedVariant.floorArea} />
              </div>
            </div>

            <p className="mt-8 text-lg leading-relaxed text-gray-600">
              {selectedVariant.description}
            </p>

            <div className="mt-8 grid gap-3 md:grid-cols-3">
              {(selectedVariant.highlights || []).map((highlight) => (
                <div
                  key={highlight}
                  className="flex items-start gap-3 rounded-2xl bg-white p-4 shadow-sm"
                >
                  <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                  <p className="text-sm font-semibold text-[#111827]">
                    {highlight}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-[22px] bg-[#0d1b4c] p-5 text-white">
              <p className="text-sm font-bold uppercase tracking-[0.25em] text-white">
                Buyer Inquiry Process
              </p>

              <div className="mt-5 grid gap-4 md:grid-cols-3">
                {[
                  'Choose an available agent for this property.',
                  'Ask for sample computation, availability, and viewing schedule.',
                  'Agent coordinates the site viewing or next buying step.',
                ].map((step, index) => (
                  <div key={step} className="rounded-2xl bg-white/10 p-4">
                    <p className="text-2xl font-black text-white">
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

          <aside className="rounded-[22px] bg-white p-5 shadow-lg">
            <div className="mb-5">
              <p className="text-sm font-bold uppercase tracking-[0.25em] text-[#111827]">
                Available Agents
              </p>
              <h3 className="mt-2 text-2xl font-black text-[#111827]">
                Contact for this property
              </h3>
            </div>

            <div className="space-y-4">
              {loadingAgents && (
                <div className="rounded-2xl border border-dashed border-[#dbe4f0] p-6 text-center text-sm text-gray-500">
                  Loading available agents...
                </div>
              )}

              {!loadingAgents && agents.length === 0 && (
                <div className="rounded-2xl border border-dashed border-[#dbe4f0] p-6 text-center text-sm text-gray-500">
                  Wala pang agent na pumili ng property na ito.
                </div>
              )}

              {agents.map((agent) => (
                <div
                  key={agent.id}
                  className="rounded-2xl border border-[#dbe4f0] p-4"
                >
                  <div className="flex gap-4">
                    <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#0d1b4c] text-xl font-black text-white">
                      <span>{String(agent.name || 'A').charAt(0).toUpperCase()}</span>
                    </div>

                    <div>
                      <h4 className="font-black text-[#111827]">
                        {agent.name}
                      </h4>
                      <p className="text-sm text-gray-500">{agent.role}</p>
                      <p className="mt-1 text-xs font-semibold text-[#111827]">
                        {agent.area}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2 rounded-xl bg-[#eef4ff] px-4 py-3 text-sm font-semibold text-[#111827]">
                    <p className="flex items-center gap-2"><Phone className="h-4 w-4" />{agent.phone || 'No mobile number'}</p>
                    <p className="flex items-center gap-2 break-all"><Mail className="h-4 w-4" />{agent.email || 'No email'}</p>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2">
                    <a
                      href={agent.phone ? `tel:${agent.phone.replaceAll(' ', '')}` : undefined}
                      className="inline-flex items-center justify-center rounded-xl bg-[#0d1b4c] px-3 py-3 text-white transition hover:bg-[#09122f]"
                      aria-label={`Call ${agent.name}`}
                    >
                      <Phone className="h-4 w-4" />
                    </a>

                    <a
                      href={agent.email ? `mailto:${agent.email}?subject=Inquiry for ${selectedVariant.title} - ${selectedVariant.type}` : undefined}
                      className="inline-flex items-center justify-center rounded-xl bg-[#bfdbfe] px-3 py-3 text-black transition hover:bg-[#1d4ed8]"
                      aria-label={`Email ${agent.name}`}
                    >
                      <Mail className="h-4 w-4" />
                    </a>

                    <a
                      href={agent.phone ? `sms:${agent.phone.replaceAll(' ', '')}?body=Hi ${agent.name}, I am interested in ${selectedVariant.title} - ${selectedVariant.type} in ${selectedVariant.location}.` : undefined}
                      className="inline-flex items-center justify-center rounded-xl border border-[#bfdbfe] px-3 py-3 text-[#111827] transition hover:bg-[#eef4ff]"
                      aria-label={`Message ${agent.name}`}
                    >
                      <MessageCircle className="h-4 w-4" />
                    </a>
                  </div>

                  <AgentSocialLinks socials={agent.socials} compact />
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
      <Icon className="mx-auto h-5 w-5 text-[#111827]" />
      <p className="mt-1 text-lg font-black text-[#111827]">{value}</p>
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
        {label}
      </p>
    </div>
  )
}

function formatPrice(property) {
  return formatPropertyPrice(property)
}

export default Hero
