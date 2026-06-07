import { useState } from 'react'
import {
  ChevronDown,
  ShieldCheck,
} from 'lucide-react'

function Topbar() {

  const [role, setRole] = useState(
    localStorage.getItem('role') || 'Administrator'
  )

  const [open, setOpen] = useState(false)

  const handleRoleChange = (newRole) => {

    setRole(newRole)

    localStorage.setItem(
      'role',
      newRole
    )

    setOpen(false)

    window.location.reload()
  }

  return (
    <div
      className="
        bg-white
        rounded-[24px]
        lg:rounded-[30px]
        px-5
        lg:px-8
        py-5
        lg:py-6
        flex
        items-center
        justify-between
        shadow-sm
        mb-6
      "
    >

      {/* LEFT */}
      <div>

        <h1
          className="
            text-2xl
            lg:text-4xl
            font-black
            text-[#3b281f]
          "
        >
          Dashboard
        </h1>

        <p
          className="
            text-sm
            lg:text-base
            text-gray-500
            mt-1
            lg:mt-2
          "
        >
          Welcome back to Zonal Realty
        </p>

      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-3 lg:gap-5">

        {/* ROLE SWITCHER */}
        <div className="relative">

          <button
            onClick={() => setOpen(!open)}
            className="
              flex
              items-center
              gap-2
              px-3
              lg:px-4
              py-2
              lg:py-3
              rounded-2xl
              bg-[#f5f5f5]
              hover:bg-[#ececec]
              transition-all
            "
          >

            <ShieldCheck
              size={18}
              className="text-[#4f5dff]"
            />

            <span
              className="
                font-semibold
                text-xs
                lg:text-sm
                hidden
                sm:block
              "
            >
              {role}
            </span>

            <ChevronDown size={16} />

          </button>

          {open && (

            <div
              className="
                absolute
                right-0
                top-full
                mt-2
                w-52
                bg-white
                rounded-2xl
                shadow-2xl
                border
                border-gray-100
                overflow-hidden
                z-50
              "
            >

              {[
                'Administrator',
                'Agent',
                'Sales Director',
                'EVP',
              ].map((item) => (

                <button
                  key={item}
                  onClick={() =>
                    handleRoleChange(item)
                  }
                  className="
                    w-full
                    text-left
                    px-5
                    py-3
                    hover:bg-[#f8f8f8]
                    transition-all
                  "
                >
                  {item}
                </button>

              ))}

            </div>

          )}

        </div>

        {/* PROFILE */}
        <div className="flex items-center gap-3">

          <div className="hidden md:block text-right">

            <h3
              className="
                font-bold
                text-[#3b281f]
              "
            >
              Zonal Admin
            </h3>

            <p
              className="
                text-sm
                text-gray-500
              "
            >
              {role}
            </p>

          </div>

          <div
            className="
              w-11
              h-11
              lg:w-14
              lg:h-14
              rounded-full
              bg-gradient-to-br
              from-[#4f5dff]
              to-[#6673ff]
              flex
              items-center
              justify-center
              text-white
              font-bold
              text-sm
              lg:text-lg
              shadow-lg
            "
          >
            {role.charAt(0)}
          </div>

        </div>

      </div>

    </div>
  )
}

export default Topbar