import { useNavigate } from 'react-router-dom'

function Navbar() {

  const navigate = useNavigate()

  const scrollToSection = (id) => {
    const section = document.getElementById(id)

    if (section) {
      section.scrollIntoView({
        behavior: 'smooth'
      })
    }
  }

  return (
    <nav className="absolute top-0 left-0 w-full z-50">

      <div className="max-w-7xl mx-auto px-6 md:px-12 py-8 flex items-center justify-between">

        {/* LOGO */}
        <h1
          onClick={() => scrollToSection('home')}
          className="
            text-3xl
            font-black
            text-white
            tracking-wider
            cursor-pointer
          "
        >
          ZONAL REALTY
        </h1>

        {/* MENU */}
        <div className="hidden md:flex items-center gap-10 text-white font-medium">

          <button
            onClick={() => scrollToSection('home')}
            className="hover:text-[#d6a77a] transition-all duration-300"
          >
            Home
          </button>

          <button
            onClick={() => scrollToSection('about')}
            className="hover:text-[#d6a77a] transition-all duration-300"
          >
            About Us
          </button>

          <button
            onClick={() => scrollToSection('developers')}
            className="hover:text-[#d6a77a] transition-all duration-300"
          >
            Developers
          </button>

          <button
            onClick={() => scrollToSection('contact')}
            className="hover:text-[#d6a77a] transition-all duration-300"
          >
            Contact Us
          </button>

        </div>

        {/* LOGIN BUTTON */}
        <button
          onClick={() => navigate('/login')}
          className="
            bg-[#c9a063]
            text-black
            px-6
            py-3
            rounded-xl
            font-semibold
            hover:scale-105
            hover:bg-[#d8ae6f]
            transition-all
            duration-300
            shadow-xl
          "
        >
          Login
        </button>

      </div>

    </nav>
  )
}

export default Navbar