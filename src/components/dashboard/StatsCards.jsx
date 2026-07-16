import {
  Users,
  Building2,
  Home,
  ClipboardCheck
} from 'lucide-react'
import { useEffect, useState } from 'react'

import { dashboardApi } from '../../lib/api'

function StatsCards() {
  const [dashboardStats, setDashboardStats] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    dashboardApi.stats()
      .then((stats) => {
        if (!cancelled) setDashboardStats(stats)
      })
      .catch((requestError) => {
        if (!cancelled) setError(requestError.message)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const formatCount = (value) =>
    dashboardStats ? Number(value || 0).toLocaleString() : '—'

  const stats = [
    {
      title: 'Total Agents',
      value: formatCount(dashboardStats?.totalAgents),
      note: dashboardStats
        ? `${formatCount(dashboardStats.activeAgents)} active agents`
        : 'Loading database count…',
      icon: <Users size={24} />,
      color: 'bg-[#eef4ff] text-[#2563eb]'
    },
    {
      title: 'Total Developers',
      value: formatCount(dashboardStats?.totalDevelopers),
      note: dashboardStats
        ? `${formatCount(dashboardStats.activeProjects)} active projects`
        : 'Loading database count…',
      icon: <Building2 size={24} />,
      color: 'bg-[#fff6e6] text-[#b87922]'
    },
    {
      title: 'Total Properties',
      value: formatCount(dashboardStats?.totalProperties),
      note: 'Projects in the directory',
      icon: <Home size={24} />,
      color: 'bg-[#eefdf5] text-[#059669]'
    },
    {
      title: 'For Approval',
      value: formatCount(dashboardStats?.forApproval),
      note: 'Pending agent approval',
      icon: <ClipboardCheck size={24} />,
      color: 'bg-[#fff1f2] text-[#e11d48]'
    }
  ]

  return (

    <div>
      {error && (
        <p className="mt-7 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Hindi ma-load ang dashboard counts: {error}
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mt-7">

      {stats.map((item, index) => (

        <div
          key={index}
          className="
            bg-white
            rounded-2xl
            p-6
            shadow-[0_14px_35px_rgba(15,23,42,0.05)]
            border
            border-[#e7ecf3]
            hover:border-[#d7dee9]
            hover:shadow-[0_18px_45px_rgba(15,23,42,0.08)]
            transition-all
            duration-300
          "
        >

          <div className="flex items-center justify-between">

            <div>

              <p className="text-[#64748b] text-sm font-medium">
                {item.title}
              </p>

              <h2 className="text-4xl font-black text-[#172033] mt-3 tracking-tight">
                {item.value}
              </h2>

              <p className="mt-3 text-xs font-semibold text-[#7b8797]">
                {item.note}
              </p>

            </div>

            <div
              className={`
                w-14
                h-14
                rounded-2xl
                flex
                items-center
                justify-center
                ${item.color}
              `}
            >
              {item.icon}
            </div>

          </div>

        </div>

      ))}

      </div>
    </div>

  )
}

export default StatsCards
