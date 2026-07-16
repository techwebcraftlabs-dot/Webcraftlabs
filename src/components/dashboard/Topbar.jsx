import { CalendarDays } from 'lucide-react'

function getStoredValue(key, fallback) {
  return localStorage.getItem(key) || fallback
}

function Topbar() {
  const fullName = getStoredValue('fullName', 'User')
  const role = getStoredValue('role', 'Agent')

  return (
    <div
      className="
        bg-white
        rounded-3xl
        px-5
        lg:px-8
        py-5
        lg:py-6
        flex
        flex-col
        gap-5
        sm:flex-row
        items-center
        justify-between
        border
        border-[#e7ecf3]
        shadow-[0_18px_45px_rgba(15,23,42,0.06)]
        mb-6
      "
    >

      {/* LEFT */}
      <div className="w-full sm:w-auto">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#f5f7fb] px-3 py-1 text-xs font-bold text-[#526071]">
          <CalendarDays className="h-4 w-4 text-[#c9a063]" />
          Business Overview
        </div>

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
          Monitor sales activity, approvals, and property performance.
        </p>

      </div>

      {/* RIGHT */}
      <div className="flex w-full items-center justify-between gap-4 rounded-2xl border border-[#eef1f5] bg-[#fbfcfe] p-3 sm:w-auto sm:justify-start sm:bg-transparent sm:p-0 sm:border-0">

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
            bg-[#3b281f]
            flex
            items-center
            justify-center
            text-white
            font-bold
            text-lg
            shadow-[0_12px_24px_rgba(59,40,31,0.22)]
          "
        >
          {fullName.charAt(0)}
        </div>

      </div>

    </div>
  )
}

export default Topbar
