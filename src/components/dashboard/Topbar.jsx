import { useEffect, useRef, useState } from 'react'
import { Bell, CalendarDays, CheckCheck, HandCoins, ReceiptText } from 'lucide-react'
import { agentApi, notificationApi } from '../../lib/api'

function getStoredValue(key, fallback) {
  return localStorage.getItem(key) || fallback
}

function formatNotificationDate(value) {
  if (!value) return 'Just now'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Recently'
  return date.toLocaleString('en-PH', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

function Topbar() {
  const fullName = getStoredValue('fullName', 'User')
  const role = getStoredValue('role', 'Agent')
  const agentId = localStorage.getItem('agentId')
  const isAdministrator = role === 'Administrator'
  const [notificationData, setNotificationData] = useState({ notifications: [], unreadCount: 0 })
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const notificationRef = useRef(null)

  useEffect(() => {
    if (!agentId) return undefined
    let active = true
    const load = () => notificationApi.list()
      .then((data) => { if (active) setNotificationData(data) })
      .catch(() => {})
    load()
    const interval = window.setInterval(load, 60000)
    return () => { active = false; window.clearInterval(interval) }
  }, [agentId])

  useEffect(() => {
    const close = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) setNotificationsOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  const markRead = async (id) => {
    try { setNotificationData(await notificationApi.markRead(id)) } catch { /* keep the current list */ }
  }

  return (
    <div className="relative mb-5 flex min-h-[180px] flex-col justify-between gap-5 overflow-visible rounded-[22px] border border-[#313335] bg-[linear-gradient(120deg,#191b1d_0%,#25282b_62%,#34312b_100%)] px-5 py-5 text-white shadow-[0_18px_44px_rgba(27,29,31,0.16)] sm:min-h-[160px] sm:flex-row sm:items-center md:px-7 lg:min-h-[176px] lg:px-8">
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 hidden w-[48%] overflow-hidden opacity-25 md:block">
        <div className="absolute -right-16 top-8 h-44 w-72 rotate-[-12deg] border border-[#d6b56d]" />
        <div className="absolute right-12 top-16 h-36 w-64 rotate-[-12deg] border border-[#d6b56d]" />
        <div className="absolute right-36 top-24 h-28 w-52 rotate-[-12deg] border border-[#d6b56d]" />
      </div>

      {/* LEFT */}
      <div className="relative z-10 w-full sm:w-auto">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] font-bold text-blue-50 backdrop-blur-sm">
          <CalendarDays className="h-3.5 w-3.5 text-[#e1bd70]" />
          {isAdministrator ? 'Business Overview' : `${role} Overview`}
        </div>

        <h1
          className="
            text-3xl
            lg:text-[38px]
            font-black
            text-white
          "
        >
          Dashboard
        </h1>

        <p
          className="
            max-w-xl
            text-xs
            sm:text-sm
            text-white/65
            mt-1
            lg:mt-2
          "
        >
          {isAdministrator
            ? 'Monitor sales activity, approvals, and property performance.'
            : 'Track your sales and commissions from transactions where you are included.'}
        </p>

      </div>

      {/* RIGHT */}
      <div className="relative z-20 flex w-full items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/10 p-2.5 backdrop-blur-sm sm:w-auto sm:justify-start sm:border-0 sm:bg-transparent sm:p-0">

        {agentId && (
          <div ref={notificationRef} className="relative">
            <button
              type="button"
              aria-label="Notifications"
              onClick={() => setNotificationsOpen((open) => !open)}
              className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white shadow-sm transition hover:bg-white/20"
            >
              <Bell className="h-5 w-5" />
              {notificationData.unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-red-600 px-1 text-[10px] font-black leading-none text-white">
                  {notificationData.unreadCount > 9 ? '9+' : notificationData.unreadCount}
                </span>
              )}
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 top-14 z-50 w-[min(330px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white shadow-[0_18px_45px_rgba(15,23,42,0.20)]">
                <div className="flex items-center justify-between border-b border-[#edf1f6] px-4 py-3">
                  <div>
                    <p className="text-sm font-black text-[#0d1b4c]">Notifications</p>
                    <p className="text-[11px] text-slate-500">Releases and clawbacks</p>
                  </div>
                  {notificationData.unreadCount > 0 && (
                    <button type="button" onClick={() => markRead()} className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800">
                      <CheckCheck className="h-4 w-4" /> Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-[168px] overflow-y-auto overscroll-contain">
                  {notificationData.notifications.length === 0 ? (
                    <div className="px-5 py-8 text-center">
                      <Bell className="mx-auto mb-2 h-7 w-7 text-slate-300" />
                      <p className="text-sm font-bold text-slate-700">No notifications yet</p>
                      <p className="mt-1 text-[11px] text-slate-500">Released commissions and clawbacks appear here.</p>
                    </div>
                  ) : notificationData.notifications.map((notification) => (
                    <button
                      type="button"
                      key={notification.id}
                      onClick={() => markRead(notification.id)}
                      className={`flex w-full gap-3 border-b border-[#f0f3f7] px-4 py-3 text-left transition hover:bg-[#f7f9fd] ${notification.readAt ? 'bg-white' : 'bg-blue-50/70'}`}
                    >
                      <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${notification.type === 'clawback' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                        {notification.type === 'clawback' ? <HandCoins className="h-5 w-5" /> : <ReceiptText className="h-5 w-5" />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-start justify-between gap-2">
                          <span className="text-sm font-extrabold text-[#0d1b4c]">{notification.title}</span>
                          {!notification.readAt && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-red-600" />}
                        </span>
                        <span className="mt-0.5 block text-[11px] leading-4 text-slate-600">{notification.message}</span>
                        <span className="mt-1.5 block text-[10px] font-semibold text-slate-400">{formatNotificationDate(notification.createdAt)}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="text-right">

          <h3
            className="
              font-bold
              text-white
            "
          >
            {fullName}
          </h3>

          <p
            className="
              text-xs
              text-white/60
            "
          >
            {role}
          </p>

        </div>

        <div
          className={`
            relative
            w-12
            h-12
            rounded-full
            flex
            items-center
            justify-center
            text-white
            font-bold
            text-lg
            shadow-[0_12px_24px_rgba(59,40,31,0.22)]
            border-2 border-[#d6b56d]/70
            ${agentId ? 'bg-[#9a6c26]' : 'bg-white'}
          `}
        >
          {agentId ? (
            <>
              <span>{fullName.charAt(0)}</span>
              <img
                src={agentApi.photoUrl(agentId)}
                alt="Profile"
                onError={(event) => { event.currentTarget.style.display = 'none' }}
                className="absolute h-11 w-11 rounded-full object-cover"
              />
            </>
          ) : (
            <img
              src="/webcraft-logo-transparent.png"
              alt="Webcraft Labs logo"
              className="h-9 w-9 object-contain"
            />
          )}
        </div>

      </div>

    </div>
  )
}

export default Topbar
