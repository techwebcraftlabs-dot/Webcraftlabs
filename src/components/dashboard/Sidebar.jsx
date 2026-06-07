import {
  LayoutDashboard,
  Users,
  ClipboardList,
  WalletCards,
  Building2,
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
    'Administrator'

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
        key: 'reports',
        label: 'Reports',
        icon: BarChart3,
      },
      {
        key: 'commission',
        label: 'Commission for Release',
        icon: WalletCards,
      },
    ],
  }

  return (
    <aside
      className="
        w-[280px]
        h-full
        bg-white
        border-r
        border-gray-200
        px-6
        py-8
        flex
        flex-col
        justify-between
      "
    >

      {/* TOP */}
      <div>

        {/* LOGO */}
        <div className="mb-10">


          <h1 className="text-3xl font-black text-[#1f2937] mt-4">
            ZONAL 
          </h1>

          <p className="text-gray-400 text-sm">
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
              bg-[#eef2ff]
              text-[#4f5dff]
              text-xs
              font-semibold
            "
          >
            {role}
          </div>

        </div>

        {/* MENUS */}
        <div className="space-y-2">

          {menus[role]?.map((item) => {

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
                  rounded-2xl
                  transition-all
                  font-medium

                  ${
                    activePage === item.key
                      ? `
                        bg-[#eef2ff]
                        text-[#4f5dff]
                        shadow-sm
                      `
                      : `
                        text-gray-600
                        hover:bg-gray-100
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

      {/* BOTTOM */}
      <div>

        <button
          onClick={handleLogout}
          className="
            w-full
            flex
            items-center
            justify-center
            gap-3
            bg-red-500
            hover:bg-red-600
            text-white
            py-4
            rounded-2xl
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