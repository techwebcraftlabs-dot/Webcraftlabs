import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { authApi } from '../lib/api'

const IDLE_LIMIT_MS = 5 * 60 * 1000
const LAST_ACTIVITY_KEY = 'zonal:lastActivityAt'

function clearStoredSession() {
  localStorage.clear()
  sessionStorage.clear()
}

function ProtectedRoute({ children }) {
  const [checkingAuth, setCheckingAuth] =
    useState(true)

  const [hasSession, setHasSession] = useState(false)

  useEffect(() => {
    let active = true

    authApi.session()
      .then((session) => {
        if (!active) return
        localStorage.setItem('role', session.role)
        localStorage.setItem('fullName', session.fullName)
        if (session.agentId) localStorage.setItem('agentId', session.agentId)
        else localStorage.removeItem('agentId')
        localStorage.setItem('mustChangePassword', String(Boolean(session.mustChangePassword)))
        if (session.mustChangePassword) localStorage.setItem('activeDashboardPage', 'profile')
        setHasSession(true)
      })
      .catch(() => {
        if (!active) return
        clearStoredSession()
        setHasSession(false)
      })
      .finally(() => {
        if (active) setCheckingAuth(false)
      })

    const verifyRestoredPage = () => {
      if (
        document.visibilityState === 'visible' &&
        !localStorage.getItem('role')
      ) {
        clearStoredSession()
        setHasSession(false)
        setCheckingAuth(false)
      }
    }

    window.addEventListener(
      'pageshow',
      verifyRestoredPage
    )

    document.addEventListener(
      'visibilitychange',
      verifyRestoredPage
    )

    return () => {
      active = false
      window.removeEventListener(
        'pageshow',
        verifyRestoredPage
      )

      document.removeEventListener(
        'visibilitychange',
        verifyRestoredPage
      )
    }
  }, [])

  useEffect(() => {
    if (!hasSession) return undefined

    let loggingOut = false
    let lastRecorded = Number(localStorage.getItem(LAST_ACTIVITY_KEY)) || Date.now()
    if (!localStorage.getItem(LAST_ACTIVITY_KEY)) {
      localStorage.setItem(LAST_ACTIVITY_KEY, String(lastRecorded))
    }

    const logoutForInactivity = async () => {
      if (loggingOut) return
      loggingOut = true
      try { await authApi.logout() } catch { /* local logout still applies */ }
      clearStoredSession()
      setHasSession(false)
      setCheckingAuth(false)
    }

    const checkIdleTime = () => {
      const storedActivity = Number(localStorage.getItem(LAST_ACTIVITY_KEY)) || lastRecorded
      if (Date.now() - storedActivity >= IDLE_LIMIT_MS) logoutForInactivity()
    }

    const recordActivity = () => {
      if (loggingOut) return
      const now = Date.now()
      if (now - lastRecorded < 1000) return
      lastRecorded = now
      localStorage.setItem(LAST_ACTIVITY_KEY, String(now))
    }

    const handleVisibility = () => {
      if (document.visibilityState !== 'visible') return
      checkIdleTime()
    }

    const activityEvents = ['pointerdown', 'pointermove', 'keydown', 'touchstart', 'scroll']
    activityEvents.forEach((eventName) => window.addEventListener(eventName, recordActivity, { passive: true }))
    document.addEventListener('visibilitychange', handleVisibility)
    window.addEventListener('storage', checkIdleTime)
    const interval = window.setInterval(checkIdleTime, 10000)
    checkIdleTime()

    return () => {
      activityEvents.forEach((eventName) => window.removeEventListener(eventName, recordActivity))
      document.removeEventListener('visibilitychange', handleVisibility)
      window.removeEventListener('storage', checkIdleTime)
      window.clearInterval(interval)
    }
  }, [hasSession])

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#f5f7fb] flex items-center justify-center text-gray-500">
        Checking session...
      </div>
    )
  }

  if (!hasSession) {
    return (
      <Navigate
        to="/"
        replace
      />
    )
  }

  return children
}

export default ProtectedRoute
