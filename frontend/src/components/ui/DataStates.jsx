import { ChevronLeft, ChevronRight, Inbox } from 'lucide-react'

export function TableSkeleton({ columns = 6, rows = 5 }) {
  return Array.from({ length: rows }, (_, row) => (
    <tr key={row} className="border-t border-slate-100">
      {Array.from({ length: columns }, (_, column) => (
        <td key={column} className="p-5"><div className="h-4 animate-pulse rounded-full bg-slate-200" style={{ width: `${55 + ((row + column) % 4) * 10}%` }} /></td>
      ))}
    </tr>
  ))
}

export function EmptyState({ title = 'No records found', description, action }) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400"><Inbox size={26} /></div>
      <h3 className="mt-4 font-black text-slate-800">{title}</h3>
      {description && <p className="mt-1 max-w-md text-sm leading-6 text-slate-500">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export function Pagination({ page, pageSize, total, onPageChange, onPageSizeChange }) {
  const pages = Math.max(1, Math.ceil(total / pageSize))
  const safePage = Math.min(page, pages)
  const start = total ? (safePage - 1) * pageSize + 1 : 0
  const end = Math.min(safePage * pageSize, total)
  return (
    <div className="flex flex-col gap-4 border-t border-slate-100 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-slate-500">Showing <strong className="text-slate-700">{start}-{end}</strong> of <strong className="text-slate-700">{total}</strong></p>
      <div className="flex flex-wrap items-center gap-2">
        {onPageSizeChange && <select aria-label="Rows per page" value={pageSize} onChange={(event) => onPageSizeChange(Number(event.target.value))} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold">
          {[10, 25, 50].map((size) => <option key={size} value={size}>{size} rows</option>)}
        </select>}
        <button aria-label="Previous page" disabled={safePage <= 1} onClick={() => onPageChange(safePage - 1)} className="rounded-xl border border-slate-200 p-2 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"><ChevronLeft size={20} /></button>
        <span className="min-w-20 text-center text-sm font-bold text-slate-700">{safePage} / {pages}</span>
        <button aria-label="Next page" disabled={safePage >= pages} onClick={() => onPageChange(safePage + 1)} className="rounded-xl border border-slate-200 p-2 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"><ChevronRight size={20} /></button>
      </div>
    </div>
  )
}
