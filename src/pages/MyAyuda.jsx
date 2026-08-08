import { useEffect, useState } from 'react'
import { HandCoins, ReceiptText, WalletCards } from 'lucide-react'

import { ayudaApi } from '../lib/api'
import { EmptyState, Pagination, TableSkeleton } from '../components/ui/DataStates'

const money = (value) => `₱${Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export default function MyAyuda() {
  const [loans, setLoans] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  useEffect(() => { ayudaApi.list().then(setLoans).catch((requestError) => setError(requestError.message)).finally(() => setLoading(false)) }, [])
  const original = loans.reduce((sum, loan) => sum + Number(loan.originalAmount || 0), 0)
  const paid = loans.reduce((sum, loan) => sum + Number(loan.totalPaid || 0), 0)
  const balance = loans.reduce((sum, loan) => sum + Number(loan.remainingBalance || 0), 0)
  const paymentRows = loans.flatMap((loan) => buildPaymentRows(loan)).sort((a, b) => new Date(b.paidAt) - new Date(a.paidAt))
  const pageCount = Math.max(1, Math.ceil(paymentRows.length / pageSize))
  const safePage = Math.min(page, pageCount)
  const visiblePayments = paymentRows.slice((safePage - 1) * pageSize, safePage * pageSize)

  return <div className="space-y-6"><section className="relative overflow-hidden rounded-[24px] border border-[#173764] bg-[linear-gradient(120deg,#071a3d_0%,#0a2d68_62%,#123f91_100%)] p-5 text-white shadow-[0_16px_38px_rgba(7,26,61,0.16)] sm:p-6"><div aria-hidden="true" className="absolute -right-12 top-4 hidden h-36 w-64 rotate-[-12deg] border border-[#d6b56d]/30 md:block" /><div className="relative flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#d6b56d]/50 bg-white/10 text-[#e1bd70]"><HandCoins size={20} /></div><div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#e1bd70]">My Account</p><h1 className="mt-1 text-2xl font-black sm:text-[30px]">My Ayuda</h1><p className="mt-1 text-xs text-blue-100/80 sm:text-sm">Read-only loan balance and commission deduction records.</p></div></div></section>
    {error && <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>}
    <section className="grid gap-4 md:grid-cols-3"><Stat icon={WalletCards} label="Original Loan" value={money(original)} /><Stat icon={ReceiptText} label="Total Paid" value={money(paid)} positive /><Stat icon={HandCoins} label="Remaining Balance" value={money(balance)} danger /></section>
    <section className="overflow-hidden rounded-[28px] border border-slate-200/70 bg-white shadow-sm"><div className="p-6"><p className="text-xs font-black uppercase tracking-widest text-blue-600">Payment Ledger</p><h2 className="mt-1 text-2xl font-black text-slate-900">Voucher Ayuda deductions</h2><p className="mt-1 text-sm text-slate-500">Every saved commission voucher with an Ayuda deduction is recorded here.</p><div className="responsive-table-wrap mt-6"><table className="w-full min-w-[760px]"><thead className="bg-slate-50 text-left text-xs uppercase text-slate-500"><tr><th className="p-4">Date</th><th className="p-4">Buyer / Voucher</th><th className="p-4">Description</th><th className="p-4 text-right">Deduction</th><th className="p-4 text-right">Remaining Balance</th></tr></thead><tbody>{loading && <TableSkeleton columns={5} rows={4} />}{!loading && visiblePayments.map((payment) => <tr key={`${payment.loanId}-${payment.id}`} className="border-t"><td className="p-4">{new Date(payment.paidAt).toLocaleDateString()}</td><td className="p-4 font-bold text-blue-700">{formatPaymentReference(payment)}</td><td className="p-4 text-slate-600">{payment.notes || 'Commission deduction'}</td><td className="p-4 text-right font-black text-emerald-600">{money(payment.amount)}</td><td className="p-4 text-right font-black text-slate-900">{money(payment.balanceAfter)}</td></tr>)}{!loading && !paymentRows.length && <tr><td colSpan="5"><EmptyState title="No Ayuda deductions yet" description="A record will appear after a commission computation with an Ayuda deduction is saved." /></td></tr>}</tbody></table></div></div>{!loading && paymentRows.length > 0 && <Pagination page={safePage} pageSize={pageSize} total={paymentRows.length} onPageChange={setPage} onPageSizeChange={(size) => { setPageSize(size); setPage(1) }} />}</section>
  </div>
}

function Stat({ icon: Icon, label, value, positive = false, danger = false }) { return <div className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><div><p className="text-sm text-slate-500">{label}</p><p className={`mt-2 text-3xl font-black ${positive ? 'text-emerald-600' : danger ? 'text-red-600' : 'text-slate-900'}`}>{value}</p></div><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600"><Icon size={22} /></div></div></div> }
function buildPaymentRows(loan) { let remaining = Number(loan.originalAmount || 0); return [...(loan.payments || [])].sort((a, b) => new Date(a.paidAt) - new Date(b.paidAt)).map((payment) => { remaining = Math.max(0, remaining - Number(payment.amount || 0)); return { ...payment, loanId: loan.id, balanceAfter: remaining } }) }
function formatPaymentReference(payment) { const buyer = payment.buyer || 'Buyer'; const voucher = payment.voucherNo && payment.voucherNo !== 'null' ? payment.voucherNo : ''; return voucher ? `${buyer} — Voucher ${voucher}` : payment.computationId ? `${buyer} — Computation #${payment.computationId}` : 'Manual payment' }
