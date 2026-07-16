import {
  LayoutDashboard,
  Users,
  ClipboardList,
  WalletCards,
  BarChart3,
  Home,
  UserRound,
  LogOut,
} from 'lucide-react'

import { useNavigate } from 'react-router-dom'

function Sidebar({
  activePage,
  setActivePage,
}) {

  const navigate = useNavigate()

  const role =
    localStorage.getItem('role') ||
    'Agent'

  const handleLogout = () => {
    localStorage.clear()
    sessionStorage.clear()

    navigate('/', {
      replace: true,
    })
  }

  const menus = {

    Administrator: [
      {
        key: 'dashboard',
        label: 'Dashboard',
        icon: LayoutDashboard,
      },
      {
        key: 'teams',
        label: 'Teams',
        icon: Users,
      },
      {
        key: 'brs',
        label: 'BRS',
        icon: ClipboardList,
      },
      {
        key: 'commission',
        label: 'Commission',
        icon: WalletCards,
      },
      {
        key: 'reports',
        label: 'Reports',
        icon: BarChart3,
      },
      {
        key: 'directory',
        label: 'Directory',
        icon: Home,
      },
      {
        key: 'agents',
        label: 'Agents',
        icon: UserRound,
      },
    ],

    Agent: [
      {
        key: 'brs',
        label: 'BRS',
        icon: ClipboardList,
      },
      {
        key: 'reports',
        label: 'Reports',
        icon: BarChart3,
      },
    ],

    HLC: [
      {
        key: 'brs',
        label: 'BRS',
        icon: ClipboardList,
      },
      {
        key: 'commission',
        label: 'Commission',
        icon: WalletCards,
      },
      {
        key: 'reports',
        label: 'Reports',
        icon: BarChart3,
      },
    ],

    'Sales Director': [
      {
        key: 'dashboard',
        label: 'Dashboard',
        icon: LayoutDashboard,
      },
      {
        key: 'teams',
        label: 'Teams',
        icon: Users,
      },
      {
        key: 'brs',
        label: 'BRS',
        icon: ClipboardList,
      },
      {
        key: 'reports',
        label: 'Reports',
        icon: BarChart3,
      },
      {
        key: 'agents',
        label: 'Agents',
        icon: UserRound,
      },
    ],

    EVP: [
      {
        key: 'dashboard',
        label: 'Dashboard',
        icon: LayoutDashboard,
      },
      {
        key: 'commission',
        label: 'Commission',
        icon: WalletCards,
      },
      {
        key: 'reports',
        label: 'Reports',
        icon: BarChart3,
      },
    ],

  }

  const currentMenus =
    menus[role] || menus.Agent

  return (
    <aside
      className="
        w-[280px]
        h-full
        bg-[#fbfcfe]
        border-r
        border-[#e5ebf3]
        px-6
        py-8
        flex
        flex-col
        justify-between
      "
    >

      <div>

        <div className="mb-10">

          <h1 className="text-3xl font-black tracking-tight text-[#172033] mt-4">
            ZONAL
          </h1>

          <p className="text-[#7b8797] text-sm">
            Realty Management
          </p>

          <div
            className="
              mt-4
              inline-flex
              items-center
              px-3
              py-1
              rounded-full
              bg-[#f3eadc]
              text-[#8a5d20]
              text-xs
              font-semibold
            "
          >
            {role}
          </div>

        </div>

        <div className="space-y-2">

          {currentMenus.map((item) => {

            const Icon = item.icon

            return (

              <button
                key={item.key}
                onClick={() =>
                  setActivePage(item.key)
                }
                className={`
                  w-full
                  flex
                  items-center
                  gap-4
                  px-4
                  py-4
                  rounded-xl
                  transition-all
                  font-semibold

                  ${
                    activePage === item.key
                      ? `
                        bg-white
                        text-[#172033]
                        shadow-[0_10px_25px_rgba(15,23,42,0.07)]
                        ring-1
                        ring-[#e7ecf3]
                      `
                      : `
                        text-[#526071]
                        hover:bg-white
                        hover:text-[#172033]
                      `
                  }
                `}
              >

                <Icon size={20} />

                <span>
                  {item.label}
                </span>

              </button>

            )

          })}

        </div>

      </div>

      <div>

        <button
          onClick={handleLogout}
          className="
            w-full
            flex
            items-center
            justify-center
            gap-3
            border
            border-[#f1c7c7]
            bg-[#fff5f5]
            hover:bg-[#fee2e2]
            text-[#b42318]
            py-4
            rounded-xl
            transition-all
            font-semibold
          "
        >

          <LogOut size={20} />

          Logout

        </button>

      </div>

    </aside>
  )
}

export default Sidebar
