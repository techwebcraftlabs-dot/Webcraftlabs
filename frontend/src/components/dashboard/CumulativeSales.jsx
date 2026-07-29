import { useEffect, useMemo, useState } from 'react'
import { Building2, Medal, TrendingUp, Users } from 'lucide-react'

import { dashboardApi } from '../../lib/api'

function CumulativeSales({ filters }) {
  const role = localStorage.getItem('role') || 'Agent'
  const isAdministrator = role === 'Administrator'
  const [records, setRecords] = useState([])
  const [personalRecords, setPersonalRecords] = useState([])
  const [teamRecords, setTeamRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    dashboardApi.stats(isAdministrator ? {} : filters)
      .then((data) => {
        if (!cancelled) {
          setRecords(Array.isArray(data.salesRecords) ? data.salesRecords : [])
          setPersonalRecords(Array.isArray(data.personalSalesRecords) ? data.personalSalesRecords : [])
          setTeamRecords(Array.isArray(data.teamSalesRecords) ? data.teamSalesRecords : [])
        }
      })
      .catch((requestError) => {
        if (!cancelled) setError(requestError.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [filters, isAdministrator])

  const bookedRecords = useMemo(
    () => records.filter((record) => normalize(record.status) !== 'rejected'),
    [records]
  )
  const agentSales = useMemo(
    () => aggregateSales(bookedRecords, getAgentKey, (record) => ({
      name: getHlcName(record),
      team: record.teamName || 'No team',
    })).slice(0, 10),
    [bookedRecords]
  )
  const developerSales = useMemo(
    () => aggregateSales(bookedRecords, (record) => record.developer, (record) => ({
      developer: record.developer || 'Unassigned developer',
    })).slice(0, 10),
    [bookedRecords]
  )
  const totalSales = bookedRecords.reduce((total, record) => total + getSalesValue(record), 0)
  const personalSales = personalRecords.reduce((total, record) => total + getSalesValue(record), 0)
  const teamSales = teamRecords.reduce((total, record) => total + getSalesValue(record), 0)
  const topDeveloperSales = developerSales[0]?.salesValue || 0

  return (
    <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[0.95fr_1.05fr]">
      <section className="dashboard-sales-card relative overflow-hidden rounded-[22px] border border-[#e5dfd2] bg-[#fffefd] p-4 shadow-[0_12px_32px_rgba(7,26,61,0.06)] before:absolute before:inset-x-0 before:bottom-0 before:h-1 before:bg-gradient-to-r before:from-[#c9a96e] before:to-[#9b762f] sm:p-5">
        <CardHeader
          title={isAdministrator ? "Overall Cumulative Sales" : "Personal & Team Sales"}
          subtitle={isAdministrator ? "Top performing agents by booked sales" : "Personal is HLC-only; Team includes every sale you participated in, including your HLC sales"}
          icon={<TrendingUp size={24} />}
        />

        <div className="sales-summary mt-4 rounded-2xl border border-[#e6e9ef] bg-gradient-to-br from-[#f8fafc] to-white p-4">
          <p className="text-xs font-semibold text-[#64748b]">{isAdministrator ? 'Total Agent Sales' : 'Total for Selected Period'}</p>
          <div className="mt-2 flex flex-wrap items-end gap-x-4 gap-y-2">
            <h3 className="text-3xl font-black tracking-tight text-[#071a3d] lg:text-[40px]">
              {loading ? '—' : formatSales(totalSales)}
            </h3>
            {!loading && (
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-bold text-emerald-700">
                {bookedRecords.length} {bookedRecords.length === 1 ? 'Sale' : 'Sales'}
              </span>
            )}
          </div>
        </div>

        {!isAdministrator && !loading && (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <SalesBreakdown label="Personal Sales" value={personalSales} units={personalRecords.length} detail="You are the HLC" tone="blue" />
            <SalesBreakdown label="Team Sales" value={teamSales} units={teamRecords.length} detail="Includes personal HLC sales" tone="gold" />
          </div>
        )}

        {error && <ErrorMessage message={error} />}
        {!loading && !error && agentSales.length === 0 && <EmptyMessage text="No BRS sales include your account yet." />}
        {isAdministrator && <div className="mt-4 max-h-[240px] space-y-2 overflow-y-auto pr-1">
          {agentSales.map((agent, index) => (
            <div key={agent.key} className="sales-row flex items-center justify-between gap-3 rounded-xl border border-[#e9edf3] bg-white px-3 py-2.5">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#071a3d] font-black text-white ring-1 ring-[#d6b56d]">{index + 1}</div>
                <div className="min-w-0">
                  <h3 className="truncate font-bold text-[#111827]">{agent.name}</h3>
                  <p className="truncate text-sm text-[#64748b]">{agent.team} | {agent.units} units</p>
                </div>
              </div>
              <p className="whitespace-nowrap font-black text-[#111827]">{formatSales(agent.salesValue)}</p>
            </div>
          ))}
        </div>}
        {!isAdministrator && bookedRecords.length > 0 && (
          <div className="mt-5 rounded-2xl border border-[#edf1f6] px-4 py-4 text-sm text-[#64748b]">
            Personal Sales is a subset of Team Sales. Your HLC transactions appear in both so the Team total remains complete for reporting.
          </div>
        )}
      </section>

      <section className="dashboard-sales-card relative overflow-hidden rounded-[22px] border border-[#e5dfd2] bg-[#fffefd] p-4 shadow-[0_12px_32px_rgba(7,26,61,0.06)] before:absolute before:inset-x-0 before:bottom-0 before:h-1 before:bg-gradient-to-r before:from-[#c9a96e] before:to-[#9b762f] sm:p-5">
        <CardHeader
          title={isAdministrator ? "Top 10 Developer Cumulative Sales" : "My Sales by Developer"}
          subtitle={isAdministrator ? "Developer ranking by booked inventory value" : "Breakdown of your booked sales by developer"}
          icon={<Building2 size={24} />}
        />

        {error && <ErrorMessage message={error} />}
        {!loading && !error && developerSales.length === 0 && <EmptyMessage text="No saved developer sales data yet." />}
        <div className="mt-5 max-h-[286px] space-y-3 overflow-y-auto pr-1">
          {developerSales.map((developer, index) => {
            const width = topDeveloperSales > 0
              ? Math.max((developer.salesValue / topDeveloperSales) * 100, 4)
              : 0
            return (
              <div key={developer.key} className="grid grid-cols-[44px_1fr_auto] items-center gap-3">
                <div className="developer-rank flex h-10 w-10 items-center justify-center rounded-xl bg-[#f7f9fc] font-black text-[#111827]">
                  {index < 3 ? <Medal size={19} /> : index + 1}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="truncate font-bold text-[#111827]">{developer.developer}</h3>
                    <span className="whitespace-nowrap text-xs text-[#64748b]">{developer.units} units</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#eef2f7]">
                    <div className="h-full rounded-full bg-gradient-to-r from-[#1d4ed8] to-[#60a5fa]" style={{ width: `${width}%` }} />
                  </div>
                </div>
                <p className="whitespace-nowrap font-black text-[#111827]">{formatSales(developer.salesValue)}</p>
              </div>
            )
          })}
        </div>

        <div className="sales-note mt-5 flex items-center gap-2 rounded-xl border border-[#e9edf3] bg-[#f8fafc] px-3 py-2.5 text-xs font-medium text-[#64748b]">
          <Users size={16} /> Based on saved BRS records, excluding rejected entries
        </div>
      </section>
    </div>
  )
}

function SalesBreakdown({ label, value, units, detail, tone }) {
  const classes = tone === 'blue'
    ? 'border-blue-100 bg-blue-50/70 text-blue-800'
    : 'border-amber-100 bg-amber-50/70 text-amber-800'
  return (
    <div className={`rounded-2xl border p-4 ${classes}`}>
      <p className="text-xs font-black uppercase tracking-wide">{label}</p>
      <p className="mt-2 text-2xl font-black">{formatSales(value)}</p>
      <p className="mt-1 text-xs font-semibold">{units} {units === 1 ? 'sale' : 'sales'} · {detail}</p>
    </div>
  )
}

function CardHeader({ title, subtitle, icon }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div><h2 className="sales-heading text-xl font-black tracking-tight text-[#071a3d] sm:text-[22px]">{title}</h2><div className="mt-2 h-0.5 w-10 bg-[#c9a96e]" /><p className="sales-subheading mt-2 text-xs text-[#64748b] sm:text-sm">{subtitle}</p></div>
      <div className="sales-header-icon flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#e2e7ef] bg-white text-[#071a3d] shadow-sm">{icon}</div>
    </div>
  )
}

function ErrorMessage({ message }) {
  return <p className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">Unable to load sales data: {message}</p>
}

function EmptyMessage({ text }) {
  return <p className="mt-5 rounded-2xl border border-dashed border-[#dbe3ee] px-4 py-8 text-center text-sm text-[#64748b]">{text}</p>
}

function aggregateSales(records, getKey, getLabels) {
  const groups = new Map()
  records.forEach((record) => {
    const key = normalize(getKey(record)) || 'unassigned'
    const current = groups.get(key) || { key, ...getLabels(record), units: 0, salesValue: 0 }
    current.units += 1
    current.salesValue += getSalesValue(record)
    groups.set(key, current)
  })
  return Array.from(groups.values()).sort((a, b) => b.salesValue - a.salesValue || b.units - a.units)
}

function getAgentKey(record) {
  return record.hlcCode || getHlcName(record) || 'Unassigned HLC'
}

function getHlcName(record) {
  if (record.hlcName) return record.hlcName
  const hlcRow = (record.rateDistribution || []).find((row) => normalize(row.role) === 'hlc')
  return hlcRow?.name || record.hlcCode || 'Unassigned HLC'
}

function getSalesValue(record) {
  return Math.max(0, Number(String(record.tcp || 0).replace(/,/g, '')) || 0)
}

function normalize(value) {
  return String(value || '').trim().toLowerCase()
}

function formatSales(value) {
  const amount = Number(value) || 0
  if (amount >= 1_000_000) return `₱${(amount / 1_000_000).toFixed(1)}M`
  if (amount >= 1_000) return `₱${(amount / 1_000).toFixed(1)}K`
  return `₱${amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
}

export default CumulativeSales
