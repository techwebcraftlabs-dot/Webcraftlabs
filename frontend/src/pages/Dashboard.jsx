import { useEffect, useState } from 'react'
import { Menu, Moon, Sun, X } from 'lucide-react'

import Sidebar from '../components/dashboard/Sidebar'
import Topbar from '../components/dashboard/Topbar'

import StatsCards from '../components/dashboard/StatsCards'
import CumulativeSales from '../components/dashboard/CumulativeSales'

import BRS from './BRS'
import BRSDetails from './BRSDetails'
import Commission from './Commission'
import Calculation from './Calculation'
import Agents from './Agents'
import DeveloperVoucher from './DeveloperVoucher'
import Developers from './Developers'
import Reports from './Reports'
import MyProfile from './MyProfile'
import PropertyManagement from './PropertyManagement'
import AgentProperties from './AgentProperties'
import Teams from './Teams'
import MyAyuda from './MyAyuda'
import AdminSettings from './AdminSettings'
function Dashboard() {
  const [theme, setTheme] = useState(() => localStorage.getItem('dashboardTheme') || 'light')
  const role = localStorage.getItem('role') || 'Agent'
  const now = new Date()
  const savedMonth = localStorage.getItem('dashboardCommissionMonth') || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const savedWeek = localStorage.getItem('dashboardSalesWeek') || getIsoWeek(now)
  const [dashboardFilters, setDashboardFilters] = useState(() => ({
    period: ['week', 'month'].includes(localStorage.getItem('dashboardCommissionPeriod')) ? localStorage.getItem('dashboardCommissionPeriod') : 'month',
    year: localStorage.getItem('dashboardCommissionYear') || savedMonth.split('-')[0],
    month: savedMonth.split('-')[1],
    week: savedWeek,
  }))

  const [activePage, setActivePage] =
    useState(() => {
      const storedPage = localStorage.getItem('activeDashboardPage')
      localStorage.removeItem('activeDashboardPage')
      if (localStorage.getItem('mustChangePassword') === 'true') return 'profile'
      return storedPage || 'dashboard'
    })

  const [selectedBRSId, setSelectedBRSId] =
    useState('')

  const [mobileMenu, setMobileMenu] =
    useState(false)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem('dashboardTheme', theme)
  }, [theme])

  const renderPage = () => {

  switch (activePage) {
    case 'settings':
      if (role !== 'Administrator') {
        return <><Topbar /><StatsCards filters={dashboardFilters} onFiltersChange={setDashboardFilters} /></>
      }
      return <div className="mt-8"><AdminSettings /></div>

    case 'profile':
      return (
        <div className="mt-8">
          <MyProfile />
        </div>
      )

    case 'dashboard':
      return (
        <>
          <Topbar />

          <div>
            <StatsCards filters={dashboardFilters} onFiltersChange={setDashboardFilters} />
          </div>

          <CumulativeSales filters={dashboardFilters} />

        </>
      )

    case 'agents':
      if (!['Administrator', 'EVP'].includes(role)) {
        return (
          <>
            <Topbar />
            <StatsCards filters={dashboardFilters} onFiltersChange={setDashboardFilters} />
            <CumulativeSales filters={dashboardFilters} />
          </>
        )
      }
      return (
        <>

          <div className="mt-8">
            <Agents />
          </div>
        </>
      )

    case 'brs':
      return (
        <>

          <div className="mt-8">
            <BRS
              setActivePage={setActivePage}
              setSelectedBRSId={setSelectedBRSId}
            />
          </div>
        </>
      )

    case 'brs-details':
      return (
        <>

          <div className="mt-8">
            <BRSDetails
              selectedBRSId={selectedBRSId}
              setActivePage={setActivePage}
            />
          </div>
        </>
      )

    // LIST OF VOUCHERS
    case 'commission':
  return (
    <DeveloperVoucher
      setActivePage={setActivePage}
    />
  )

    // CREATE VOUCHER
    case 'create-voucher':
      return (
        <>

          <div className="mt-8">
            <Commission
              setActivePage={setActivePage}
            />
          </div>
        </>
      )

    case 'calculation':
      return (
        <>

          <div className="mt-8">
            <Calculation
              setActivePage={setActivePage}
            />
          </div>
        </>
      )

    case 'teams':
      return (
        <div className="mt-8"><Teams /></div>
      )

    case 'my-ayuda':
      if (role === 'Administrator') return <div className="mt-8"><Teams /></div>
      return <div className="mt-8"><MyAyuda /></div>

    case 'reports':
      if (role !== 'Administrator') {
        return (
          <>
            <Topbar />
            <StatsCards filters={dashboardFilters} onFiltersChange={setDashboardFilters} />
            <CumulativeSales filters={dashboardFilters} />
          </>
        )
      }
  return (
    <div className="mt-8">
      <Reports />
    </div>
  )

    case 'directory':
  return (
    <div className="mt-8">
      <Developers />
    </div>
  )

    case 'properties':
  return (
    <PropertyManagement />
  )

    case 'agent-properties':
  return (
    <AgentProperties />
  )

    default:
      return (
        <>

          <div className="mt-8">
            <StatsCards filters={dashboardFilters} onFiltersChange={setDashboardFilters} />
          </div>

        </>
      )

  }

}

  return (
    <section
      className="dashboard-theme
        flex
        min-h-screen
      "
    >

      {/* DESKTOP SIDEBAR */}
      <div className="hidden lg:block">

        <Sidebar
          activePage={activePage}
          setActivePage={setActivePage}
        />

      </div>

      {/* MOBILE DRAWER */}
      {
        mobileMenu && (
          <div className="fixed inset-0 z-50 lg:hidden">

            <div
              className="
                absolute
                inset-0
                bg-black/50
              "
              onClick={() =>
                setMobileMenu(false)
              }
            />

            <div
              className="
                absolute
                left-0
                top-0
                h-full
                w-[280px]
                bg-white
                shadow-2xl
              "
            >

              <div className="flex justify-end p-4">

                <button
                  onClick={() =>
                    setMobileMenu(false)
                  }
                >
                  <X size={24} />
                </button>

              </div>

              <Sidebar
                activePage={activePage}
                setActivePage={(page) => {

                  setActivePage(page)

                  setMobileMenu(false)

                }}
              />

            </div>

          </div>
        )
      }

      {/* CONTENT */}
      <div
        className="
          flex-1
          p-3
          sm:p-4
          md:p-5
          lg:p-6
          xl:p-7
          overflow-auto
        "
      >

        {/* MOBILE MENU BUTTON */}
        <div className="lg:hidden mb-4">

          <button
            onClick={() =>
              setMobileMenu(true)
            }
            className="
              bg-white
              p-3
              rounded-xl
              shadow
            "
          >
            <Menu size={24} />
          </button>

        </div>

        {renderPage()}

      </div>

      <button
        type="button"
        aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        onClick={() => setTheme((current) => current === 'dark' ? 'light' : 'dark')}
        className="theme-toggle fixed bottom-5 right-5 z-40 flex h-12 w-12 items-center justify-center rounded-2xl border shadow-lg"
      >
        {theme === 'dark' ? <Sun size={21} /> : <Moon size={21} />}
      </button>

    </section>
  )
}

export default Dashboard

function getIsoWeek(value) {
  const date = new Date(Date.UTC(value.getFullYear(), value.getMonth(), value.getDate()))
  const day = date.getUTCDay() || 7
  date.setUTCDate(date.getUTCDate() + 4 - day)
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1))
  const week = Math.ceil((((date - yearStart) / 86400000) + 1) / 7)
  return `${date.getUTCFullYear()}-W${String(week).padStart(2, '0')}`
}
