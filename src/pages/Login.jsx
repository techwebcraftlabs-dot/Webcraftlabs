import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { authApi } from '../lib/api'

function Login() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] =
    useState('')

  const [loading, setLoading] =
    useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()

    if (!email || !password) {
      alert('Please enter email and password')
      return
    }

    try {
      setLoading(true)

      const session = await authApi.login({
        email,
        password,
      })

      localStorage.setItem(
        'role',
        session.role
      )

      localStorage.setItem(
        'fullName',
        session.fullName
      )

      localStorage.removeItem('agentId')
      localStorage.removeItem('agentData')

      if (session.agentId) {
        localStorage.setItem(
          'agentId',
          session.agentId
        )

      }
      localStorage.setItem('mustChangePassword', String(Boolean(session.mustChangePassword)))
      if (session.mustChangePassword) {
        localStorage.setItem('activeDashboardPage', 'profile')
      }

      navigate('/dashboard', {
        replace: true,
      })
    } catch (error) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="min-h-screen bg-[#f4f7fb] flex items-center justify-center px-6">
      <div className="bg-white w-full max-w-md p-10 rounded-[35px] shadow-2xl">

        <h1 className="text-4xl font-black text-[#111827] text-center">
          Login
        </h1>

        <p className="text-gray-500 text-center mt-3">
          Welcome back to Zonal Realty
        </p>

        <form
          onSubmit={handleLogin}
          className="mt-10 space-y-5"
        >
          <div>
            <label className="text-sm text-gray-500">
              Email
            </label>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) =>
                setEmail(
                  e.target.value
                )
              }
              className="
                w-full
                mt-2
                px-5
                py-4
                rounded-2xl
                border
                border-gray-200
                outline-none
              "
            />
          </div>

          <div>
            <label className="text-sm text-gray-500">
              Password
            </label>

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) =>
                setPassword(
                  e.target.value
                )
              }
              className="
                w-full
                mt-2
                px-5
                py-4
                rounded-2xl
                border
                border-gray-200
                outline-none
              "
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="
              w-full
              bg-[#0d1b4c]
              text-white
              py-4
              rounded-2xl
              font-semibold
              hover:bg-[#09122f]
              transition-all
              disabled:opacity-50
            "
          >
            {loading
              ? 'Logging in...'
              : 'Login'}
          </button>
        </form>
      </div>
    </section>
  )
}

export default Login
