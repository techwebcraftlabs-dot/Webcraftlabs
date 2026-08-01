import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Bath,
  ArrowRight,
  Award,
  BedDouble,
  Building2,
  Car,
  CheckCircle,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Ruler,
  ShieldCheck,
  UsersRound,
  X,
} from 'lucide-react'

import SearchBox from './SearchBox'
import AgentSocialLinks, { FacebookIcon } from './AgentSocialLinks'
import { propertyApi } from '../lib/api'
import { formatPropertyPrice, propertyPriceIntersects } from '../lib/propertyPrice'
import { groupPropertiesByProject } from '../lib/propertyProjects'

const propertyListings = []

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

      {/* CORPORATE HERO */}
      <div className="relative overflow-hidden bg-[#f5f1e9] pt-[78px]">
        <div className="absolute right-0 top-[78px] hidden h-[640px] w-[68%] lg:block">
          <img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=88&w=2200&auto=format&fit=crop" alt="Contemporary luxury residence at dusk" className="h-full w-full object-cover object-center" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#f5f1e9] via-[#f5f1e9]/20 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/10" />
        </div>

        <div className="relative mx-auto grid min-h-[640px] max-w-[1440px] items-center gap-9 px-5 py-12 sm:px-7 lg:grid-cols-[minmax(0,1fr)_360px] lg:px-10 lg:py-16 xl:px-14">
          <div className="relative z-10 max-w-[650px]">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#9a6c26]">Built around better possibilities</p>
            <h1 className="mt-5 text-[clamp(3.25rem,7vw,6.4rem)] font-semibold leading-[0.88] tracking-[-0.055em] text-[#191b1e]">Building better<br />communities<span className="text-[#b88936]">.</span></h1>
            <p className="mt-7 max-w-[520px] text-base leading-7 text-[#55575b] sm:text-lg sm:leading-8">Webcraft Labs brings properties, developers, and clients together through thoughtful real estate experiences built on trust, clarity, and lasting value.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button type="button" onClick={handleSearchProperties} className="group inline-flex min-h-13 items-center justify-center gap-4 bg-[#1b1d1f] px-7 text-xs font-black uppercase tracking-[0.12em] text-white transition hover:bg-[#9a6c26]">Explore properties <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" /></button>
              <button type="button" onClick={() => document.getElementById('developers')?.scrollIntoView({ behavior: 'smooth' })} className="inline-flex min-h-13 items-center justify-center border border-[#292b2e] bg-white/55 px-7 text-xs font-black uppercase tracking-[0.12em] text-[#202225] transition hover:bg-white">Our developers</button>
            </div>
          </div>

          <div className="relative z-20 self-center lg:translate-y-4"><SearchBox filters={filters} onFilterChange={setFilters} onSearch={handleSearchProperties} /></div>
        </div>

        <div className="relative z-20 mx-auto max-w-[1300px] bg-[#1b1d1f] text-white shadow-[0_24px_70px_rgba(17,18,19,0.2)]">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Building2, title: 'Integrated', text: 'Property operations' },
              { icon: ShieldCheck, title: 'Secure', text: 'Protected workflows' },
              { icon: UsersRound, title: 'Connected', text: 'Developer partnerships' },
              { icon: Award, title: 'Dedicated', text: 'Client-first service' },
            ].map(({ icon: Icon, title, text }) => <div key={title} className="flex min-h-[112px] items-center gap-4 border-b border-white/10 px-6 last:border-b-0 sm:border-r lg:border-b-0"><Icon className="h-8 w-8 shrink-0 text-[#c99740]" strokeWidth={1.4} /><div><p className="text-xl font-semibold">{title}</p><p className="mt-1 text-xs text-white/55">{text}</p></div></div>)}
          </div>
        </div>

        <div className="mx-auto grid max-w-[1300px] gap-px border-x border-b border-[#ddd7cc] bg-[#ddd7cc] sm:grid-cols-2 lg:grid-cols-4">
          {[
            ['Quality', 'Thoughtful execution at every stage.'],
            ['Integrity', 'Transparent, principled partnerships.'],
            ['Commitment', 'Consistent support from start to finish.'],
            ['Excellence', 'Standards designed to create lasting value.'],
          ].map(([title, text], index) => <div key={title} className="flex min-h-[128px] gap-4 bg-[#faf8f3] p-6"><span className="text-sm font-semibold text-[#ae7c2d]">0{index + 1}</span><div><h2 className="font-semibold text-[#202225]">{title}</h2><p className="mt-2 text-sm leading-6 text-[#686a6d]">{text}</p></div></div>)}
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
          About Webcraft Labs
        </p>

        <h2 className="text-[clamp(2.4rem,6vw,3.8rem)] font-semibold leading-[0.96] tracking-[-0.04em] text-[#202225]">
          Better places.
          <br />
          Better partnerships.
        </h2>

        <p className="mt-5 max-w-xl text-base leading-7 text-slate-600 lg:text-lg">
          We connect real estate vision with disciplined execution—giving
          developers, professionals, and clients a clearer path from inquiry to ownership.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">

          <div className="rounded-2xl border border-[#e7dfcf] bg-white p-4 shadow-[0_10px_28px_rgba(7,26,61,0.05)]">
            <h3 className="text-lg font-semibold text-[#202225]">Strategy</h3>

            <p className="text-gray-500">
              Clear direction for every development opportunity.
            </p>
          </div>

          <div className="rounded-2xl border border-[#e7dfcf] bg-white p-4 shadow-[0_10px_28px_rgba(7,26,61,0.05)]">
            <h3 className="text-lg font-semibold text-[#202225]">Experience</h3>

            <p className="text-gray-500">
              Thoughtful journeys for clients and partners.
            </p>
          </div>

          <div className="rounded-2xl border border-[#e7dfcf] bg-white p-4 shadow-[0_10px_28px_rgba(7,26,61,0.05)]">
            <h3 className="text-lg font-semibold text-[#202225]">Growth</h3>

            <p className="text-gray-500">
              Systems designed to scale with the business.
            </p>
          </div>

        </div>

      </div>

      <div className="relative min-h-[420px] overflow-hidden bg-[#1b1d1f]">
        <img src="https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?q=85&w=1400&auto=format&fit=crop" alt="Refined contemporary residential interior" loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-90" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
        <div className="absolute bottom-0 left-0 max-w-sm border-t border-r border-white/20 bg-[#1b1d1f]/90 p-6 text-white backdrop-blur"><p className="text-xs font-black uppercase tracking-[0.18em] text-[#d1a14d]">Our perspective</p><p className="mt-3 text-lg leading-7">Real estate performs best when design, service, and technology move as one.</p></div>
      </div>

    </div>

  </div>

      </section>

      {/* DEVELOPERS */}
      <section id="developers" className="bg-[#f7f4ee] py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-[1300px] px-5 sm:px-7 lg:px-10">
          <div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr] lg:items-end">
            <div><p className="text-xs font-black uppercase tracking-[0.2em] text-[#9a6c26]">Development expertise</p><h2 className="mt-4 text-[clamp(2.6rem,5vw,4.5rem)] font-semibold leading-[0.94] tracking-[-0.045em] text-[#202225]">Spaces designed<br />for life<span className="text-[#b88936]">.</span></h2></div>
            <p className="max-w-2xl text-base leading-7 text-[#64666a] lg:justify-self-end">From private residences to connected communities, our approach combines market insight, strong partnerships, and a commitment to enduring quality.</p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              { title: 'Residential', text: 'Thoughtful homes shaped around how people live today.', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=85&w=1200&auto=format&fit=crop' },
              { title: 'Vertical Living', text: 'Well-connected spaces with convenience at their core.', image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=85&w=1200&auto=format&fit=crop' },
              { title: 'Communities', text: 'Places designed for belonging, access, and long-term value.', image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=85&w=1200&auto=format&fit=crop' },
            ].map((item, index) => <article key={item.title} className="group overflow-hidden border border-[#ded8cd] bg-white">
              <div className="relative h-72 overflow-hidden"><img src={item.image} alt={`${item.title} architecture`} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.035]" /><span className="absolute left-5 top-5 bg-[#1b1d1f] px-3 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-white">0{index + 1}</span></div>
              <div className="p-6"><h3 className="text-2xl font-semibold tracking-[-0.02em] text-[#202225]">{item.title}</h3><p className="mt-3 min-h-12 text-sm leading-6 text-[#686a6d]">{item.text}</p><button type="button" onClick={handleSearchProperties} className="mt-5 inline-flex min-h-11 items-center gap-3 text-xs font-black uppercase tracking-[0.1em] text-[#8d6221]">Explore portfolio <ArrowRight size={15} /></button></div>
            </article>)}
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
            src="/webcraft-logo-transparent.png"
            alt="Webcraft Labs"
            className="h-20 w-[260px] max-w-full object-contain object-left"
          />
        </h2>

        <div className="mt-4 h-px w-12 bg-[#d6b56d]" />
        <p className="mt-4 text-sm leading-6 text-white/60">
          A complete business ecosystem designed
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
            123 Innovation Avenue, Makati City, Philippines, 1200
          </li>

          <li className="flex items-center gap-3 text-white/60">
            <Mail className="h-4 w-4 shrink-0 text-[#e1bd70]" />
            <a
              href="mailto:tech.webcraftlabs@gmail.com"
              className="transition hover:text-white"
            >
              tech.webcraftlabs@gmail.com
            </a>
          </li>

          <li className="flex items-center gap-3 text-white/60">
            <Phone className="h-4 w-4 shrink-0 text-[#e1bd70]" />
            <a
              href="tel:+639175550142"
              className="transition hover:text-white"
            >
              0917 555 0142
            </a>
          </li>

        </ul>

      </div>

    </div>

    {/* BOTTOM */}
    <div className="flex flex-col items-center justify-between gap-5 pt-6 sm:flex-row">

      <p className="text-center text-xs text-white/40 sm:text-left">
       Developed by Webcraft Labs
      </p>

      <div className="flex gap-4">

        <a
          href="https://www.facebook.com/"
          target="_blank"
          rel="noreferrer noopener"
          aria-label="Visit Webcraft Labs on Facebook"
          title="Webcraft Labs on Facebook"
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

function PropertyDetailsModal({ property, onClose }) {
  const [selectedVariant, setSelectedVariant] = useState(property.variants?.[0] || property)
  const [agents, setAgents] = useState([])
  const [loadingAgents, setLoadingAgents] = useState(true)

  useEffect(() => {
    let active = true

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
                      onClick={() => {
                        setLoadingAgents(true)
                        setSelectedVariant(variant)
                      }}
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

