import {
  Building2,
  CalendarRange,
  ClipboardCheck,
  FileCheck2,
  Home,
  PhilippinePeso,
  ReceiptText,
  Users,
} from 'lucide-react'
import { useEffect, useState } from 'react'

import { dashboardApi } from '../../lib/api'

function StatsCards({ filters, onFiltersChange }) {
  const role = localStorage.getItem('role') || 'Agent'
  const now = new Date()
  const period = filters?.period || 'month'
  const selectedMonth = `${filters?.year || now.getFullYear()}-${String(filters?.month || now.getMonth() + 1).padStart(2, '0')}`
  const selectedWeek = filters?.week || ''
  const [dashboardStats, setDashboardStats] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    dashboardApi.stats(role === 'Administrator' ? {} : filters)
      .then((stats) => { if (!cancelled) setDashboardStats(stats) })
      .catch((requestError) => { if (!cancelled) setError(requestError.message) })
    return () => { cancelled = true }
  }, [filters, role])


  const updatePeriod = (value) => {
    onFiltersChange((current) => ({ ...current, period: value }))
    localStorage.setItem('dashboardCommissionPeriod', value)
  }

  const count = (value) => dashboardStats ? Number(value || 0).toLocaleString() : '—'
  const money = (value) => dashboardStats
    ? `₱${Number(value || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`
    : '—'

  const adminStats = [
    { title: 'Total Agents', value: count(dashboardStats?.totalAgents), note: `${count(dashboardStats?.activeAgents)} active agents`, icon: Users },
    { title: 'Total Developers', value: count(dashboardStats?.totalDevelopers), note: `${count(dashboardStats?.activeProjects)} active projects`, icon: Building2 },
    { title: 'Total Properties', value: count(dashboardStats?.totalProperties), note: 'Saved property listings', icon: Home },
    { title: 'For Approval', value: count(dashboardStats?.forApproval), note: 'Pending agent approval', icon: ClipboardCheck },
  ]
  const personalStats = [
    { title: 'Personal Sales', value: money(dashboardStats?.personalSales), note: `${count(dashboardStats?.personalSalesUnits)} ${Number(dashboardStats?.personalSalesUnits) === 1 ? 'sale' : 'sales'} where you are the HLC`, icon: PhilippinePeso },
    { title: 'Team Sales', value: money(dashboardStats?.teamSales), note: `${count(dashboardStats?.teamSalesUnits)} ${Number(dashboardStats?.teamSalesUnits) === 1 ? 'sale' : 'sales'}, including personal HLC sales`, icon: Users },
    { title: 'My Commission Vouchers', value: count(dashboardStats?.totalVouchers), note: `${count(dashboardStats?.releasedVouchers)} released`, icon: ReceiptText },
    { title: 'Net Commission', value: money(dashboardStats?.periodNetCommission), note: `Final net amount for ${dashboardStats?.commissionPeriodLabel || 'selected period'}`, icon: FileCheck2 },
  ]
  const stats = role === 'Administrator' ? adminStats : personalStats

  return (
    <div>
      {error && <p className="mt-7 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">Hindi ma-load ang dashboard counts: {error}</p>}
      {role !== 'Administrator' && (
        <div className="mt-2 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="py-1">
            <div className="flex items-center gap-2 text-sm font-black text-slate-800"><CalendarRange size={18} className="text-blue-600" /> Dashboard Period</div>
            <p className="mt-1 text-xs text-slate-500">Filter personal sales, team sales, and commission by week or month.</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <label><span className="mb-1 block text-xs font-bold text-slate-500">View By</span><select value={period} onChange={(event) => updatePeriod(event.target.value)} className="h-11 min-w-32 rounded-xl border border-slate-200 bg-white px-3 font-semibold"><option value="week">Weekly</option><option value="month">Monthly</option></select></label>
            {period === 'month' ? (
              <label><span className="mb-1 block text-xs font-bold text-slate-500">Month</span><input type="month" value={selectedMonth} onChange={(event) => { const [year, month] = event.target.value.split('-'); onFiltersChange((current) => ({ ...current, year, month })); localStorage.setItem('dashboardCommissionMonth', event.target.value); localStorage.setItem('dashboardCommissionYear', year) }} className="h-11 rounded-xl border border-slate-200 px-3 font-semibold" /></label>
            ) : (
              <label><span className="mb-1 block text-xs font-bold text-slate-500">Week</span><input type="week" value={selectedWeek} onChange={(event) => { onFiltersChange((current) => ({ ...current, week: event.target.value })); localStorage.setItem('dashboardSalesWeek', event.target.value) }} className="h-11 rounded-xl border border-slate-200 px-3 font-semibold" /></label>
            )}
          </div>
        </div>
      )}
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => {
          const Icon = item.icon
          return (
            <div key={item.title} className="dashboard-stat-card group relative overflow-hidden rounded-2xl border border-[#ded8cd] bg-[#fffdf9] p-4 shadow-[0_10px_28px_rgba(27,29,31,0.05)] transition duration-300 before:absolute before:inset-x-0 before:top-0 before:h-[2px] before:bg-gradient-to-r before:from-[#8b6226] before:via-[#d1a14d] before:to-transparent hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(27,29,31,0.09)] sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="stat-label text-xs font-semibold text-[#6b6a66]">{item.title}</p>
                  <h2 className="stat-value mt-2 break-words text-2xl font-black tracking-tight text-[#202225] sm:text-[28px]">{item.value}</h2>
                  <p className="stat-note mt-2 truncate text-[11px] font-medium text-[#8a8882]">{item.note}</p>
                </div>
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#d1a14d] bg-[#1b1d1f] text-[#e0b45f] shadow-[0_8px_18px_rgba(27,29,31,0.14)] transition group-hover:scale-105"><Icon size={20} /></div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}


export default StatsCards
