import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'

function clearStoredSession() {
  localStorage.clear()
  sessionStorage.clear()
}

function ProtectedRoute({ children }) {
  const [checkingAuth, setCheckingAuth] =
    useState(false)

  const [hasSession, setHasSession] = useState(() =>
    Boolean(localStorage.getItem('role'))
  )

  useEffect(() => {
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
