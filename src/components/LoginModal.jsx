import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  X
} from 'lucide-react'

import { authApi } from '../lib/api'

function LoginModal({ onClose }) {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    setErrorMessage('')

    if (!email || !password) {
      setErrorMessage('Please enter email and password.')
      return
    }

    try {
      setLoading(true)

      const session = await authApi.login({ email, password })

      localStorage.setItem('role', session.role)
      localStorage.setItem('fullName', session.fullName)
      localStorage.removeItem('agentId')
      localStorage.removeItem('agentData')

      if (session.agentId) {
        localStorage.setItem('agentId', session.agentId)
        localStorage.setItem('agentData', JSON.stringify(session.agentData))
      }

      onClose()
      navigate('/dashboard', { replace: true })
    } catch (error) {
      console.log(error)
      setErrorMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="
        fixed
        inset-0
        z-[100]
        flex
        items-center
        justify-center
        overflow-y-auto
        bg-black/75
        px-4
        py-8
        backdrop-blur-md
      "
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
        aria-label="Close login popup"
      />

      <div
        className="
          relative
          grid
          w-full
          max-w-5xl
          overflow-hidden
          rounded-[34px]
          bg-[#111111]
          shadow-[0_30px_90px_rgba(0,0,0,0.55)]
          lg:grid-cols-[0.95fr_1.05fr]
        "
      >
        <button
          type="button"
          onClick={onClose}
          className="
            absolute
            right-5
            top-5
            z-20
            flex
            h-11
            w-11
            items-center
            justify-center
            rounded-full
            bg-white/10
            text-white
            backdrop-blur
            transition
            hover:bg-white
            hover:text-[#2d1f18]
          "
          aria-label="Close login"
        >
          <X size={20} />
        </button>

        <div className="relative hidden min-h-[620px] overflow-hidden lg:block">
          <img
            src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1200&auto=format&fit=crop"
            alt="Luxury real estate interior"
            className="absolute inset-0 h-full w-full object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-black/20" />

          <div className="absolute bottom-0 left-0 right-0 p-10 text-white">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm backdrop-blur">
              <Sparkles size={16} />
              Zonal command access
            </div>

            <h2 className="text-5xl font-black leading-none">
              Welcome back,
              <span className="block text-[#d6a77a]">
                Agent!
              </span>
            </h2>

            <p className="mt-5 max-w-sm text-white/75">
              Jump straight into agents, BRS, approvals, commissions,
              and developer sales from one secure workspace.
            </p>
          </div>
        </div>

        <div className="bg-[#fbf8f3] p-6 sm:p-8 lg:p-10">
          <div className="mb-8">
            <div
              className="
                mb-5
                flex
                h-14
                w-14
                items-center
                justify-center
                rounded-2xl
                bg-[#2d1f18]
                text-[#d6a77a]
              "
            >
              <ShieldCheck size={26} />
            </div>

            <h1 className="text-4xl font-black text-[#2d1f18] sm:text-5xl">
              Login
            </h1>

            <p className="mt-3 text-gray-500">
              Access your Zonal Realty dashboard.
            </p>
          </div>

          <form
            onSubmit={handleLogin}
            className="space-y-5"
          >
            <div>
              <label className="text-sm font-semibold text-[#6f5b4d]">
                Email
              </label>

              <div className="mt-2 flex items-center gap-3 rounded-2xl border border-[#eadccd] bg-white px-5 py-4 shadow-sm focus-within:border-[#c9a063]">
                <Mail size={19} className="text-[#a56b3f]" />

                <input
                  type="email"
                  placeholder="name@zonalrealty.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent text-[#2d1f18] outline-none placeholder:text-gray-400"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-[#6f5b4d]">
                Password
              </label>

              <div className="mt-2 flex items-center gap-3 rounded-2xl border border-[#eadccd] bg-white px-5 py-4 shadow-sm focus-within:border-[#c9a063]">
                <Lock size={19} className="text-[#a56b3f]" />

                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent text-[#2d1f18] outline-none placeholder:text-gray-400"
                />
              </div>
            </div>

            {errorMessage && (
              <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
                {errorMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="
                flex
                w-full
                items-center
                justify-center
                gap-3
                rounded-2xl
                bg-[#2d1f18]
                px-6
                py-4
                font-bold
                text-white
                shadow-xl
                shadow-[#2d1f18]/20
                transition
                hover:-translate-y-0.5
                hover:bg-[#3f2c22]
                disabled:translate-y-0
                disabled:opacity-60
              "
            >
              {loading ? 'Signing in...' : 'Enter Dashboard'}
              <ArrowRight size={19} />
            </button>
          </form>

          <div className="mt-8 grid grid-cols-3 gap-3 text-center">
            {['Secure', 'Fast', 'Private'].map((item) => (
              <div
                key={item}
                className="rounded-2xl bg-white px-3 py-4 text-sm font-bold text-[#2d1f18] shadow-sm"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginModal
