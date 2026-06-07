import SearchBox from './SearchBox'
import About3D from './About3D'

function Hero() {
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
            <SearchBox />
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

      {[
  {
    title: 'Modern Villa',
    location: 'Tagaytay City',
    price: '₱12.5M',
    image: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?q=80&w=1200&auto=format&fit=crop',
  },
  {
    title: 'Luxury Condominium',
    location: 'Makati City',
    price: '₱8.9M',
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1200&auto=format&fit=crop',
  },
  {
    title: 'Executive House',
    location: 'Cavite',
    price: '₱6.8M',
    image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?q=80&w=1200&auto=format&fit=crop',
  },
  {
    title: 'Premium Townhouse',
    location: 'Rizal',
    price: '₱5.4M',
    image: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?q=80&w=1200&auto=format&fit=crop',
  },
  {
    title: 'Skyline Residence',
    location: 'BGC',
    price: '₱14.2M',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1200',
  },
  {
    title: 'Grand Estate',
    location: 'Nuvali',
    price: '₱18.7M',
    image: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=1200',
  },
  {
    title: 'Luxury Penthouse',
    location: 'Makati',
    price: '₱22.5M',
    image: 'https://images.unsplash.com/photo-1494526585095-c41746248156?q=80&w=1200',
  },
  {
    title: 'Family Residence',
    location: 'Antipolo',
    price: '₱7.2M',
    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=1200',
  },

].map((property, index) => (

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
      {property.price}
    </span>

    <button
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

    </div>

  </div>

</section>
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

export default Hero