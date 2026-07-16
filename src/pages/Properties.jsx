import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  Bath,
  BedDouble,
  Building2,
  Car,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Ruler,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react'

const peso = '\u20b1'

const agents = [
  {
    id: 'sophia',
    name: 'Sophia Miller',
    role: 'Buyer Specialist',
    phone: '+63 917 204 8831',
    email: 'sophia@zonalrealty.com',
    area: 'Makati, BGC',
    specialties: ['Condo', 'Penthouse'],
    locations: ['Makati City', 'BGC', 'Pasig City'],
    image:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=600&auto=format&fit=crop',
    socials: {
      facebook: 'https://facebook.com',
      instagram: 'https://instagram.com',
      linkedin: 'https://linkedin.com',
    },
  },
  {
    id: 'michael',
    name: 'Michael Lee',
    role: 'Luxury Property Specialist',
    phone: '+63 918 447 1902',
    email: 'michael@zonalrealty.com',
    area: 'Tagaytay, Batangas',
    specialties: ['Villa', 'House'],
    locations: ['Tagaytay City', 'Batangas', 'Cavite'],
    image:
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=600&auto=format&fit=crop',
    socials: {
      facebook: 'https://facebook.com',
      instagram: 'https://instagram.com',
      linkedin: 'https://linkedin.com',
    },
  },
  {
    id: 'olivia',
    name: 'Olivia Cruz',
    role: 'Residential Consultant',
    phone: '+63 916 832 4410',
    email: 'olivia@zonalrealty.com',
    area: 'Rizal, Antipolo',
    specialties: ['Townhouse', 'House', 'Lot'],
    locations: ['Rizal', 'Antipolo', 'Laguna'],
    image:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=600&auto=format&fit=crop',
    socials: {
      facebook: 'https://facebook.com',
      instagram: 'https://instagram.com',
      linkedin: 'https://linkedin.com',
    },
  },
  {
    id: 'mark',
    name: 'Mark Santos',
    role: 'Investment Advisor',
    phone: '+63 919 561 7302',
    email: 'mark@zonalrealty.com',
    area: 'Nuvali, Alabang',
    specialties: ['House', 'Lot', 'Condo'],
    locations: ['Nuvali', 'Alabang', 'Laguna'],
    image:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop',
    socials: {
      facebook: 'https://facebook.com',
      instagram: 'https://instagram.com',
      linkedin: 'https://linkedin.com',
    },
  },
  {
    id: 'daniel',
    name: 'Daniel Reyes',
    role: 'Sales Director',
    phone: '+63 915 740 6621',
    email: 'daniel@zonalrealty.com',
    area: 'South Luzon',
    specialties: ['House', 'Villa', 'Townhouse'],
    locations: ['Cavite', 'Laguna', 'Alabang', 'Batangas'],
    image:
      'https://images.unsplash.com/photo-1504257432389-52343af06ae3?q=80&w=600&auto=format&fit=crop',
    socials: {
      facebook: 'https://facebook.com',
      instagram: 'https://instagram.com',
      linkedin: 'https://linkedin.com',
    },
  },
]

const properties = [
  {
    title: 'Modern Villa',
    location: 'Tagaytay City',
    type: 'Villa',
    priceValue: 12.5,
    image:
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?q=80&w=1200&auto=format&fit=crop',
    beds: 4,
    baths: 4,
    parking: 2,
    floorArea: '320 sqm',
    status: 'Ready for Viewing',
  },
  {
    title: 'Luxury Condominium',
    location: 'Makati City',
    type: 'Condo',
    priceValue: 8.9,
    image:
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1200&auto=format&fit=crop',
    beds: 2,
    baths: 2,
    parking: 1,
    floorArea: '88 sqm',
    status: 'Pre-selling',
  },
  {
    title: 'Executive House',
    location: 'Cavite',
    type: 'House',
    priceValue: 6.8,
    image:
      'https://images.unsplash.com/photo-1568605114967-8130f3a36994?q=80&w=1200&auto=format&fit=crop',
    beds: 3,
    baths: 3,
    parking: 2,
    floorArea: '210 sqm',
    status: 'New Listing',
  },
  {
    title: 'Premium Townhouse',
    location: 'Rizal',
    type: 'Townhouse',
    priceValue: 5.4,
    image:
      'https://images.unsplash.com/photo-1570129477492-45c003edd2be?q=80&w=1200&auto=format&fit=crop',
    beds: 3,
    baths: 2,
    parking: 1,
    floorArea: '165 sqm',
    status: 'Flexible Terms',
  },
  {
    title: 'Skyline Residence',
    location: 'BGC',
    type: 'Condo',
    priceValue: 14.2,
    image:
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1200&auto=format&fit=crop',
    beds: 3,
    baths: 3,
    parking: 2,
    floorArea: '145 sqm',
    status: 'Investment Pick',
  },
  {
    title: 'Grand Estate',
    location: 'Nuvali',
    type: 'House',
    priceValue: 18.7,
    image:
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=1200&auto=format&fit=crop',
    beds: 5,
    baths: 5,
    parking: 3,
    floorArea: '420 sqm',
    status: 'Premium Lot',
  },
  {
    title: 'Luxury Penthouse',
    location: 'Makati City',
    type: 'Penthouse',
    priceValue: 22.5,
    image:
      'https://images.unsplash.com/photo-1494526585095-c41746248156?q=80&w=1200&auto=format&fit=crop',
    beds: 4,
    baths: 4,
    parking: 3,
    floorArea: '260 sqm',
    status: 'Private Showing',
  },
  {
    title: 'Family Residence',
    location: 'Antipolo',
    type: 'House',
    priceValue: 7.2,
    image:
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=1200&auto=format&fit=crop',
    beds: 4,
    baths: 3,
    parking: 2,
    floorArea: '240 sqm',
    status: 'Best Value',
  },
  {
    title: 'Garden Courtyard Home',
    location: 'Alabang',
    type: 'House',
    priceValue: 16.4,
    image:
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=1200&auto=format&fit=crop',
    beds: 4,
    baths: 4,
    parking: 3,
    floorArea: '360 sqm',
    status: 'Corner Lot',
  },
  {
    title: 'Urban Studio Suite',
    location: 'Pasig City',
    type: 'Condo',
    priceValue: 4.8,
    image:
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1200&auto=format&fit=crop',
    beds: 1,
    baths: 1,
    parking: 0,
    floorArea: '42 sqm',
    status: 'Rental Ready',
  },
  {
    title: 'Lakeview Subdivision Lot',
    location: 'Laguna',
    type: 'Lot',
    priceValue: 3.6,
    image:
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1200&auto=format&fit=crop',
    beds: 0,
    baths: 0,
    parking: 0,
    floorArea: '420 sqm',
    status: 'Open Lot',
  },
  {
    title: 'Resort-Inspired Villa',
    location: 'Batangas',
    type: 'Villa',
    priceValue: 19.8,
    image:
      'https://images.unsplash.com/photo-1613977257363-707ba9348227?q=80&w=1200&auto=format&fit=crop',
    beds: 5,
    baths: 5,
    parking: 3,
    floorArea: '390 sqm',
    status: 'Vacation Home',
  },
]

const typeOptions = ['All', 'Condo', 'House', 'Villa', 'Townhouse', 'Penthouse', 'Lot']
const budgetOptions = ['Any Budget', 'Under 7M', '7M - 15M', '15M+']

const budgetFilters = {
  'Under 7M': (price) => price < 7,
  '7M - 15M': (price) => price >= 7 && price <= 15,
  '15M+': (price) => price > 15,
}

function Properties() {
  const [query, setQuery] = useState('')
  const [type, setType] = useState('All')
  const [budget, setBudget] = useState('Any Budget')
  const [inquiry, setInquiry] = useState(null)

  const filteredProperties = useMemo(() => {
    return properties.filter((property) => {
      const searchText = `${property.title} ${property.location} ${property.type}`.toLowerCase()
      const matchesQuery = !query || searchText.includes(query.toLowerCase())
      const matchesType = type === 'All' || property.type === type
      const matchesBudget =
        budget === 'Any Budget' || budgetFilters[budget]?.(property.priceValue)

      return matchesQuery && matchesType && matchesBudget
    })
  }, [budget, query, type])

  const openInquiry = (property) => {
    const matchingAgents = agents.filter((agent) => {
      return (
        agent.specialties.includes(property.type) ||
        agent.locations.includes(property.location)
      )
    })
    const pool = matchingAgents.length > 0 ? matchingAgents : agents
    const shuffledAgents = shuffleItems(pool).slice(0, Math.min(3, pool.length))

    setInquiry({
      property,
      agents: shuffledAgents,
    })
  }

  return (
    <main className="min-h-screen bg-[#f7f2eb] text-[#2d1f18]">
      <header className="relative min-h-[440px] overflow-hidden bg-[#17120f] md:min-h-[500px]">
        <img
          src="https://images.unsplash.com/photo-1600607688969-a5bfcd646154?q=80&w=1800&auto=format&fit=crop"
          alt="Premium residential property"
          className="absolute inset-0 h-full w-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/35" />

        <div className="relative mx-auto flex min-h-[440px] max-w-7xl flex-col px-6 py-8 md:min-h-[500px] md:px-12">
          <nav className="flex items-center justify-between gap-4">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:border-[#d6a77a] hover:text-[#d6a77a]"
            >
              <ArrowLeft className="h-4 w-4" />
              Back Home
            </Link>

            <p className="text-lg font-black tracking-wider text-white">
              ZONAL REALTY
            </p>
          </nav>

          <section className="flex flex-1 flex-col justify-center pb-20 pt-14 md:pb-28">
            <p className="inline-flex w-fit items-center gap-2 rounded-full bg-[#d6a77a] px-4 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-black md:text-xs md:tracking-[0.25em]">
              <Building2 className="h-4 w-4" />
              Property Directory Demo
            </p>

            <h1 className="mt-7 max-w-4xl text-5xl font-black leading-[0.95] text-white md:text-7xl">
              Explore more properties
            </h1>

          
          </section>
        </div>
      </header>

      <section className="mx-auto max-w-[1500px] px-6 pb-16 md:px-10">
        <div className="relative z-10 -mt-14 grid gap-3 rounded-[24px] bg-white p-4 shadow-2xl md:grid-cols-2 lg:grid-cols-[1fr_190px_190px_130px]">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#a56b3f]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by location, name, or type"
              className="h-[52px] w-full rounded-2xl border border-[#eadccd] bg-[#fbf8f3] pl-12 pr-4 text-sm font-semibold text-[#2d1f18] outline-none transition placeholder:text-[#8d7b6c] focus:border-[#d6a77a] md:text-base"
            />
          </label>

          <select
            value={type}
            onChange={(event) => setType(event.target.value)}
            className="h-[52px] rounded-2xl border border-[#eadccd] bg-[#fbf8f3] px-4 text-sm font-semibold text-[#2d1f18] outline-none transition focus:border-[#d6a77a] md:text-base"
          >
            {typeOptions.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>

          <select
            value={budget}
            onChange={(event) => setBudget(event.target.value)}
            className="h-[52px] rounded-2xl border border-[#eadccd] bg-[#fbf8f3] px-4 text-sm font-semibold text-[#2d1f18] outline-none transition focus:border-[#d6a77a] md:text-base"
          >
            {budgetOptions.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>

          <div className="flex h-[52px] items-center justify-center gap-2 rounded-2xl bg-[#2d1f18] px-5 text-sm font-bold text-white md:col-span-2 lg:col-span-1">
            <SlidersHorizontal className="h-4 w-4" />
            {filteredProperties.length} Found
          </div>
        </div>

        <div className="mt-10 grid items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {filteredProperties.map((property) => (
            <article
              key={`${property.title}-${property.location}`}
              className="flex h-full flex-col overflow-hidden rounded-[20px] bg-white shadow-lg transition duration-300 hover:-translate-y-2 hover:shadow-2xl"
            >
              <div className="relative h-44">
                <img
                  src={property.image}
                  alt={property.title}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <span className="absolute left-4 top-4 max-w-[calc(100%-2rem)] rounded-full bg-[#d6a77a] px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.12em] text-black">
                  {property.status}
                </span>
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="flex items-center gap-1.5 text-xs font-semibold text-white/85">
                    <MapPin className="h-3.5 w-3.5" />
                    {property.location}
                  </p>
                  <h2 className="mt-2 min-h-[48px] text-xl font-black leading-tight text-white">
                    {property.title}
                  </h2>
                </div>
              </div>

              <div className="flex flex-1 flex-col p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#a56b3f]">
                      {property.type}
                    </p>
                    <p className="mt-1 text-2xl font-black text-[#d2a06b]">
                      {formatPrice(property)}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => openInquiry(property)}
                    className="shrink-0 rounded-xl bg-[#2d1f18] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#3f2c22]"
                  >
                    Inquire
                  </button>
                </div>

                <div className="mt-5 grid grid-cols-4 gap-2">
                  <PropertyStat icon={BedDouble} label="Beds" value={property.beds} />
                  <PropertyStat icon={Bath} label="Baths" value={property.baths} />
                  <PropertyStat icon={Car} label="Parking" value={property.parking} />
                  <PropertyStat icon={Ruler} label="Area" value={property.floorArea} />
                </div>
              </div>
            </article>
          ))}
        </div>

        {filteredProperties.length === 0 && (
          <div className="mt-12 rounded-[28px] bg-white p-10 text-center shadow-lg">
            <h2 className="text-3xl font-black">No properties found</h2>
            <p className="mt-3 text-gray-500">
              Try a different keyword, property type, or budget range.
            </p>
          </div>
        )}
      </section>

      {inquiry && (
        <InquiryModal
          inquiry={inquiry}
          onClose={() => setInquiry(null)}
        />
      )}
    </main>
  )
}

function PropertyStat({ icon: Icon, label, value }) {
  return (
    <div className="flex min-h-[70px] flex-col items-center justify-center rounded-xl bg-[#fbf8f3] px-1 py-2 text-center">
      <Icon className="mx-auto h-3.5 w-3.5 text-[#a56b3f]" />
      <p className="mt-1.5 whitespace-nowrap text-[11px] font-black leading-tight text-[#2d1f18]">
        {value}
      </p>
      <p className="mt-1 text-[8px] font-bold uppercase leading-tight tracking-wide text-gray-400">
        {label}
      </p>
    </div>
  )
}

function InquiryModal({ inquiry, onClose }) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 px-4 py-6 backdrop-blur-sm">
      <div className="mx-auto w-full max-w-5xl overflow-hidden rounded-[24px] bg-[#fbf8f3] shadow-2xl">
        <div className="relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 z-10 rounded-full bg-white p-3 text-[#2d1f18] shadow-lg transition hover:bg-[#f4eadf]"
            aria-label="Close inquiry"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="grid gap-0 lg:grid-cols-[0.85fr_1.15fr]">
            <div className="relative min-h-[320px] overflow-hidden bg-[#2d1f18]">
              <img
                src={inquiry.property.image}
                alt={inquiry.property.title}
                className="absolute inset-0 h-full w-full object-cover opacity-55"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/55 to-black/20" />
              <div className="relative flex min-h-[320px] flex-col justify-end p-6 text-white md:p-8">
                <p className="w-fit rounded-full bg-[#d6a77a] px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-black">
                  {inquiry.property.type}
                </p>
                <h2 className="mt-5 text-4xl font-black leading-tight">
                  {inquiry.property.title}
                </h2>
                <p className="mt-3 flex items-center gap-2 text-white/80">
                  <MapPin className="h-4 w-4" />
                  {inquiry.property.location}
                </p>
                <p className="mt-4 text-4xl font-black text-[#d6a77a]">
                  {formatPrice(inquiry.property)}
                </p>
              </div>
            </div>

            <div className="p-6 md:p-8">
              <div className="border-b border-[#e7d8c6] pb-5">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-[#a56b3f]">
                    Available Agents
                  </p>
                  <h3 className="mt-2 text-3xl font-black text-[#2d1f18]">
                    Contact seller for this property
                  </h3>
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {inquiry.agents.map((agent) => (
                  <article
                    key={agent.id}
                    className="rounded-[20px] border border-[#eadccd] bg-white p-4 shadow-sm"
                  >
                    <div className="flex gap-4">
                      <img
                        src={agent.image}
                        alt={agent.name}
                        className="h-16 w-16 rounded-2xl object-cover"
                      />

                      <div className="min-w-0">
                        <h4 className="text-lg font-black text-[#2d1f18]">
                          {agent.name}
                        </h4>
                        <p className="text-sm font-semibold text-gray-500">
                          {agent.role}
                        </p>
                        <p className="mt-1 text-xs font-bold text-[#a56b3f]">
                          {agent.area}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 space-y-2 rounded-2xl bg-[#fbf8f3] p-3 text-sm font-semibold text-[#2d1f18]">
                      <p className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-[#a56b3f]" />
                        {agent.phone}
                      </p>
                      <p className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-[#a56b3f]" />
                        {agent.email}
                      </p>
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-2">
                      <a
                        href={`tel:${agent.phone.replaceAll(' ', '')}`}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2d1f18] px-3 py-3 text-xs font-bold text-white transition hover:bg-[#3f2c22]"
                      >
                        <Phone className="h-4 w-4" />
                        Call
                      </a>
                      <a
                        href={`sms:${agent.phone.replaceAll(' ', '')}?body=Hi ${agent.name}, I am interested in ${inquiry.property.title}.`}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#d6a77a] px-3 py-3 text-xs font-bold text-black transition hover:bg-[#c7955f]"
                      >
                        <MessageCircle className="h-4 w-4" />
                        SMS
                      </a>
                      <a
                        href={`mailto:${agent.email}?subject=Inquiry for ${inquiry.property.title}`}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#d6a77a] px-3 py-3 text-xs font-bold text-[#2d1f18] transition hover:bg-[#f8f3ed]"
                      >
                        <Mail className="h-4 w-4" />
                        Email
                      </a>
                    </div>

                    <div className="mt-3 flex gap-2">
                      <SocialLink href={agent.socials.facebook}>FB</SocialLink>
                      <SocialLink href={agent.socials.instagram}>IG</SocialLink>
                      <SocialLink href={agent.socials.linkedin}>IN</SocialLink>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function SocialLink({ href, children }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="flex h-10 flex-1 items-center justify-center rounded-xl bg-[#f4eadf] text-xs font-black text-[#2d1f18] transition hover:bg-[#d6a77a]"
    >
      {children}
    </a>
  )
}

function shuffleItems(items) {
  return [...items].sort(() => Math.random() - 0.5)
}

function formatPrice(property) {
  return `${peso}${property.priceValue.toFixed(1)}M`
}

export default Properties
