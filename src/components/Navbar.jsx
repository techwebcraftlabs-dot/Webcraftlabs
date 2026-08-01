import { useState } from 'react'
import { ArrowUpRight, Menu, X } from 'lucide-react'

function Navbar({ onLoginClick }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const links = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About Us' },
    { id: 'developers', label: 'Developers' },
    { id: 'properties', label: 'Properties' },
    { id: 'contact', label: 'Contact' },
  ]

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    setIsMenuOpen(false)
  }

  return (
    <nav className="absolute inset-x-0 top-0 z-50 border-b border-black/10 bg-[#f7f4ee]/95 text-[#17191c] backdrop-blur-xl">
      <div className="mx-auto flex min-h-[78px] max-w-[1440px] items-center justify-between px-5 sm:px-7 lg:px-10 xl:px-14">
        <button type="button" onClick={() => scrollToSection('home')} className="inline-flex min-h-11 items-center text-left" aria-label="Go to homepage">
          <img src="/webcraft-logo-transparent.png" alt="Webcraft Labs" className="h-11 w-[190px] object-contain object-left brightness-0" />
        </button>

        <div className="hidden items-center gap-7 text-[11px] font-bold uppercase tracking-[0.12em] lg:flex xl:gap-10">
          {links.map((link, index) => <button key={link.id} onClick={() => scrollToSection(link.id)} className={`relative min-h-11 transition-colors hover:text-[#9a6c26] ${index === 0 ? 'after:absolute after:inset-x-0 after:bottom-1 after:h-px after:bg-[#9a6c26]' : ''}`}>{link.label}</button>)}
        </div>

        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setIsMenuOpen((open) => !open)} className="inline-flex h-11 w-11 items-center justify-center border border-black/15 lg:hidden" aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'} aria-expanded={isMenuOpen}>{isMenuOpen ? <X size={20} /> : <Menu size={20} />}</button>
          <button onClick={onLoginClick} className="group inline-flex min-h-11 items-center gap-3 bg-[#17191c] px-4 text-[11px] font-black uppercase tracking-[0.12em] text-white transition hover:bg-[#9a6c26] sm:px-6">
            <span className="hidden sm:inline">Client Portal</span><span className="sm:hidden">Login</span><ArrowUpRight size={16} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </button>
        </div>
      </div>

      {isMenuOpen && <div className="absolute inset-x-0 top-full border-t border-black/10 bg-[#f7f4ee] p-5 shadow-xl lg:hidden"><div className="grid gap-1">{links.map((link) => <button key={link.id} onClick={() => scrollToSection(link.id)} className="min-h-12 border-b border-black/10 px-2 text-left text-sm font-bold uppercase tracking-[0.1em]">{link.label}</button>)}</div></div>}
    </nav>
  )
}

export default Navbar
