import {
  LayoutDashboard,
  Users,
  ClipboardList,
  WalletCards,
  BarChart3,
  Home,
  UserRound,
  LogOut,
  HandCoins,
  Settings,
} from 'lucide-react'
import { useEffect, useState } from 'react'

import { useNavigate } from 'react-router-dom'
import { authApi } from '../../lib/api'

function Sidebar({
  activePage,
  setActivePage,
}) {

  const navigate = useNavigate()

  const role =
    localStorage.getItem('role') ||
    'Agent'
  const [mustChangePassword, setMustChangePassword] = useState(
    () => localStorage.getItem('mustChangePassword') === 'true'
  )

  useEffect(() => {
    const syncPasswordRequirement = (event) => {
      setMustChangePassword(
        event.detail?.mustChangePassword ??
        localStorage.getItem('mustChangePassword') === 'true'
      )
    }
    window.addEventListener('zonal:password-requirement-changed', syncPasswordRequirement)
    window.addEventListener('storage', syncPasswordRequirement)
    return () => {
      window.removeEventListener('zonal:password-requirement-changed', syncPasswordRequirement)
      window.removeEventListener('storage', syncPasswordRequirement)
    }
  }, [])

  const handleLogout = async () => {
    try {
      await authApi.logout()
    } catch (error) {
      console.error(error)
    }

    localStorage.clear()
    sessionStorage.clear()

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'auto',
    })

    navigate('/', {
      replace: true,
    })

    window.requestAnimationFrame(() => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'auto',
      })
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
        key: 'properties',
        label: 'Add Property',
        icon: Home,
      },
      {
        key: 'agents',
        label: 'Agents',
        icon: UserRound,
      },
      {
        key: 'settings',
        label: 'Settings',
        icon: Settings,
      },
    ],

    Agent: [
      {
        key: 'dashboard',
        label: 'Dashboard',
        icon: LayoutDashboard,
      },
      {
        key: 'agent-properties',
        label: 'Properties',
        icon: Home,
      },
      {
        key: 'profile',
        label: 'My Profile',
        icon: UserRound,
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
    ],

    HLC: [
      {
        key: 'dashboard',
        label: 'Dashboard',
        icon: LayoutDashboard,
      },
      {
        key: 'profile',
        label: 'My Profile',
        icon: UserRound,
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
    ],

    'Sales Director': [
      {
        key: 'profile',
        label: 'My Profile',
        icon: UserRound,
      },
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
    ],

    EVP: [
      {
        key: 'profile',
        label: 'My Profile',
        icon: UserRound,
      },
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
        key: 'agents',
        label: 'Add Agent',
        icon: UserRound,
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
        key: 'properties',
        label: 'Add Property',
        icon: Home,
      },
    ],

  }

  const roleMenus = role === 'Administrator' ? (menus[role] || menus.Agent) : [...(menus[role] || menus.Agent), { key: 'my-ayuda', label: 'My Ayuda', icon: HandCoins }]
  const currentMenus =
    [...(mustChangePassword
      ? roleMenus.filter((item) => item.key === 'profile')
      : roleMenus.filter((item) => role === 'Administrator' || item.key !== 'reports'))].sort((first, second) => {
      if (first.key === 'dashboard') return -1
      if (second.key === 'dashboard') return 1
      return first.label.localeCompare(second.label)
    })

  return (
    <aside
      className="dashboard-sidebar
        w-[248px]
        h-full
        bg-[#fffefd]
        border-r
        border-[#e5ebf3]
        px-4
        py-6
        flex
        flex-col
        justify-between
      "
    >

      <div>

        <div className="mb-7 flex h-14 items-center justify-center">
          <img
            src="/zonal-realty-logo.png"
            alt="Zonal Realty"
            className="h-12 w-auto max-w-[170px] object-contain object-center"
          />
        </div>

        <div className="space-y-2">

          {currentMenus.map((item) => {

            const Icon = item.icon

            return (

              <button
                key={item.key}
                onClick={() => item.path ? navigate(item.path) : setActivePage(item.key)}
                className={`dashboard-nav-item
                  w-full
                  flex
                  items-center
                  gap-3
                  px-4
                  py-3
                  rounded-xl
                  transition-all
                  font-semibold

                  ${
                    activePage === item.key
                      ? `
                        bg-[#071a3d]
                        text-white
                        shadow-[0_10px_24px_rgba(7,26,61,0.18)]
                        ring-1 ring-[#c9a96e]/40
                      `
                      : `
                        text-[#526071]
                        hover:bg-white
                        hover:text-[#111827]
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
            className="dashboard-logout
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
