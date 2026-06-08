import { useState } from 'react'
import { Menu, X } from 'lucide-react'

import Sidebar from '../components/dashboard/Sidebar'
import Topbar from '../components/dashboard/Topbar'

import StatsCards from '../components/dashboard/StatsCards'
import PropertyGrid from '../components/dashboard/PropertyGrid'

import BRS from './BRS'
import BRSDetails from './BRSDetails'
import Commission from './Commission'
import Calculation from './Calculation'
import Agents from './Agents'
import DeveloperVoucher from './DeveloperVoucher'
function Dashboard() {

  const [activePage, setActivePage] =
    useState(() => {
      const storedPage = localStorage.getItem('activeDashboardPage')
      localStorage.removeItem('activeDashboardPage')
      return storedPage || 'dashboard'
    })

  const [selectedBRSId, setSelectedBRSId] =
    useState('')

  const [mobileMenu, setMobileMenu] =
    useState(false)

  const renderPage = () => {

  switch (activePage) {

    case 'dashboard':
      return (
        <>
          <Topbar />

          <div className="mt-8">
            <StatsCards />
          </div>

          <div className="mt-8">
            <PropertyGrid />
          </div>
        </>
      )

    case 'agents':
      return (
        <>
          <Topbar />

          <div className="mt-8">
            <Agents />
          </div>
        </>
      )

    case 'brs':
      return (
        <>
          <Topbar />

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
          <Topbar />

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
          <Topbar />

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
          <Topbar />

          <div className="mt-8">
            <Calculation
              setActivePage={setActivePage}
            />
          </div>
        </>
      )

    case 'teams':
      return (
        <>
          <Topbar />

          <div className="mt-8 bg-white rounded-[30px] p-10">
            Teams Page
          </div>
        </>
      )

    case 'reports':
      return (
        <>
          <Topbar />

          <div className="mt-8 bg-white rounded-[30px] p-10">
            Reports Page
          </div>
        </>
      )

    case 'directory':
      return (
        <>
          <Topbar />

          <div className="mt-8 bg-white rounded-[30px] p-10">
            Directory Page
          </div>
        </>
      )

    default:
      return (
        <>
          <Topbar />

          <div className="mt-8">
            <StatsCards />
          </div>

          <div className="mt-8">
            <PropertyGrid />
          </div>
        </>
      )

  }

}

  return (
    <section
      className="
        flex
        bg-[#f5f7fb]
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
          p-4
          md:p-6
          lg:p-8
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

    </section>
  )
}

export default Dashboard
