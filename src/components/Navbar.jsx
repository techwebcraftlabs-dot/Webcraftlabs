import { useState } from 'react'
import { House, Menu, User, X } from 'lucide-react'

function Navbar({ onLoginClick }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const links = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About Us' },
    { id: 'developers', label: 'Developers' },
    { id: 'properties', label: 'Properties' },
    { id: 'contact', label: 'Contact Us' },
  ]

  const scrollToSection = (id) => {
    const section = document.getElementById(id)

    if (section) {
      section.scrollIntoView({
        behavior: 'smooth'
      })
    }

    setIsMenuOpen(false)
  }

  return (
    <nav className="absolute top-0 left-0 w-full z-50 bg-white shadow-sm">

      <div className="flex min-h-[66px] items-stretch justify-between">

        {/* LOGO */}
        <button
          type="button"
          onClick={() => scrollToSection('home')}
          className="
            relative
            flex
            min-w-[145px]
            items-center
            gap-2
            bg-black
            px-3
            pr-6
            text-left
            text-white
            min-[360px]:min-w-[170px]
            min-[360px]:px-4
            min-[360px]:pr-8
            sm:min-w-[220px]
            sm:px-5
            sm:pr-10
            md:gap-3
            lg:min-w-[270px]
            md:px-7
            md:pr-14
          "
          style={{
            clipPath: 'polygon(0 0, 88% 0, 100% 100%, 0% 100%)',
          }}
        >
          <House className="h-7 w-7 text-[#d6a77a] md:h-8 md:w-8" strokeWidth={2.4} />
          <span>
            <span className="block text-xs font-black leading-none tracking-[0.1em] min-[360px]:text-sm min-[360px]:tracking-[0.12em] sm:text-base sm:tracking-[0.16em] lg:text-xl lg:tracking-[0.18em]">
              ZONAL REALTY
            </span>
            <span className="mt-1 hidden text-[9px] font-bold uppercase tracking-[0.2em] text-[#d6a77a] sm:block md:text-[10px]">
              Real Estate Platform
            </span>
          </span>
        </button>

        {/* MENU */}
        <div className="hidden flex-1 items-center justify-center gap-5 px-3 text-xs font-black text-black lg:flex xl:gap-10 xl:text-sm">

          {links.map((link, index) => (
            <button
              key={link.id}
              onClick={() => scrollToSection(link.id)}
              className={`pb-1 transition-all duration-300 hover:text-[#c99543] ${
                index === 0 ? 'border-b-2 border-[#d6a77a]' : ''
              }`}
            >
              {link.label}
            </button>
          ))}

        </div>

        {/* LOGIN BUTTON */}
        <div className="flex items-center gap-1.5 px-2 min-[360px]:gap-2 min-[360px]:px-3 sm:px-5 md:px-8">
          <button
            type="button"
            onClick={() => setIsMenuOpen((open) => !open)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-black/10 text-black min-[360px]:h-10 min-[360px]:w-10 lg:hidden"
            aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>

          <button
            onClick={onLoginClick}
            className="
              inline-flex
              items-center
              gap-1.5
              rounded-lg
              bg-[#c99543]
              px-2.5
              py-2.5
              text-sm
              font-bold
              text-white
              shadow-lg
              transition-all
              duration-300
              hover:-translate-y-0.5
              hover:bg-[#b98532]
              sm:gap-2
              sm:px-5
              sm:py-3
              sm:text-base
            "
          >
            Login
            <User className="h-4 w-4" />
          </button>
        </div>

      </div>

      {isMenuOpen && (
        <div className="absolute left-0 right-0 top-full border-t border-black/10 bg-white px-5 py-4 shadow-xl lg:hidden">
          <div className="grid gap-2">
            {links.map((link) => (
              <button
                key={link.id}
                type="button"
                onClick={() => scrollToSection(link.id)}
                className="rounded-xl px-4 py-3 text-left text-sm font-black text-black transition hover:bg-[#f8f3ed] hover:text-[#c99543]"
              >
                {link.label}
              </button>
            ))}
          </div>
        </div>
      )}

    </nav>
  )
}

export default Navbar
