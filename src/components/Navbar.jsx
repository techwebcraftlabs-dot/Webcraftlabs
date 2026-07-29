import { useState } from 'react'
import { Menu, User, X } from 'lucide-react'

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
    <nav className="absolute left-0 top-0 z-50 w-full border-b border-[#d6b56d]/20 bg-[#111722]/95 text-white shadow-[0_8px_30px_rgba(2,8,23,0.22)] backdrop-blur-xl">

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
            bg-[#1a202b]
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
            lg:min-w-[270px]
            md:px-7
            md:pr-14
          "
          style={{
            clipPath: 'polygon(0 0, 88% 0, 100% 100%, 0% 100%)',
          }}
        >
          <img
            src="/zonal-realty-logo.png"
            alt="Zonal Realty"
            className="h-9 w-[125px] object-contain object-left brightness-0 invert sm:h-11 sm:w-[170px] lg:h-12 lg:w-[195px]"
          />
        </button>

        {/* MENU */}
        <div className="hidden flex-1 items-center justify-center gap-5 px-3 text-xs font-bold text-white/75 lg:flex xl:gap-10 xl:text-sm">

          {links.map((link) => (
            <button
              key={link.id}
              onClick={() => scrollToSection(link.id)}
              className="relative pb-1 transition-colors duration-300 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:origin-center after:scale-x-0 after:bg-[#d6b56d] after:transition-transform after:duration-300 hover:text-white hover:after:scale-x-100"
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
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 text-white min-[360px]:h-10 min-[360px]:w-10 lg:hidden"
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
              border border-[#d6b56d]/70
              bg-[#1a202b]
              px-2.5
              py-2.5
              text-sm
              font-bold
              text-white
              shadow-lg
              transition-all
              duration-300
              hover:-translate-y-0.5
              hover:border-[#e5c77f]
              hover:bg-[#d6b56d]
              hover:text-[#171b24]
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
        <div className="absolute left-0 right-0 top-full border-t border-[#d6b56d]/20 bg-[#171d28] px-5 py-4 shadow-xl lg:hidden">
          <div className="grid gap-2">
            {links.map((link) => (
              <button
                key={link.id}
                type="button"
                onClick={() => scrollToSection(link.id)}
                className="rounded-xl px-4 py-3 text-left text-sm font-black text-white/80 transition hover:bg-white/10 hover:text-white"
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
