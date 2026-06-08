import { useEffect, useState } from 'react'

function Topbar() {

  const [fullName, setFullName] =
    useState('User')

  const [role, setRole] =
    useState('Agent')

  useEffect(() => {

    const storedName =
      localStorage.getItem(
        'fullName'
      )

    const storedRole =
      localStorage.getItem(
        'role'
      )

    if (storedName) {
      setFullName(storedName)
    }

    if (storedRole) {
      setRole(storedRole)
    }

  }, [])

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
      <div className="flex items-center gap-3">

        <div className="text-right">

          <h3
            className="
              font-bold
              text-[#3b281f]
            "
          >
            {fullName}
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
            w-14
            h-14
            rounded-full
            bg-gradient-to-br
            from-[#4f5dff]
            to-[#6673ff]
            flex
            items-center
            justify-center
            text-white
            font-bold
            text-lg
            shadow-lg
          "
        >
          {fullName.charAt(0)}
        </div>

      </div>

    </div>
  )
}

export default Topbar