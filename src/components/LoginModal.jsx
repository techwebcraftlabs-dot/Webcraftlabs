import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  Zap,
  X
} from 'lucide-react'

import { authApi } from '../lib/api'

function LoginModal({ onClose }) {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
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
      }
      localStorage.setItem('mustChangePassword', String(Boolean(session.mustChangePassword)))
      localStorage.setItem('zonal:lastActivityAt', String(Date.now()))
      if (session.mustChangePassword) {
        localStorage.setItem('activeDashboardPage', 'profile')
      }

      onClose()
      navigate('/dashboard', { replace: true })
    } catch (error) {
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
        bg-[#020817]/85
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
          max-w-[920px]
          overflow-hidden
          rounded-[28px]
          bg-[#030b22]
          shadow-[0_30px_90px_rgba(0,0,0,0.55)]
          border border-white/10
          lg:grid-cols-[0.92fr_1.08fr]
        "
      >
        <button
          type="button"
          onClick={onClose}
          className="
            absolute
            right-4
            top-4
            z-20
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-full
            border border-[#d6b56d]/40
            bg-[#071a3d]
            text-[#e1bd70]
            backdrop-blur
            transition
            hover:bg-[#d6b56d]
            hover:text-[#071a3d]
          "
          aria-label="Close login"
        >
          <X size={20} />
        </button>

        <div className="relative hidden min-h-[560px] overflow-hidden lg:block">
          <img
            src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1200&auto=format&fit=crop"
            alt="Luxury real estate interior"
            className="absolute inset-0 h-full w-full object-cover"
          />

          <div className="absolute inset-0 bg-[#020817]/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#020817] via-[#07152f]/58 to-[#07152f]/15" />

          <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#d6b56d]/35 bg-[#071a3d]/50 px-4 py-2 text-xs font-semibold backdrop-blur">
              <Sparkles size={15} className="text-[#e1bd70]" />
              Zonal command access
            </div>

            <h2 className="text-[42px] font-black leading-[0.98] tracking-tight">
              Welcome back.
              <span className="mt-1 block text-[#e1bd70]">Your workspace awaits.</span>
            </h2>

            <p className="mt-4 max-w-sm text-sm leading-6 text-white/70">
              Jump straight into agents, BRS, approvals, commissions,
              and developer sales from one secure workspace.
            </p>
          </div>
        </div>

        <div className="bg-[#faf9f6] p-5 pt-16 sm:p-8 sm:pt-16 lg:p-9">
          <div className="mb-6">
            <img
              src="/zonal-realty-logo.png"
              alt="Zonal Realty"
              className="mb-5 h-9 w-auto object-contain object-left lg:hidden"
            />
            <div
              className="
                mb-4
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-2xl
                border border-[#d6b56d]/60
                bg-[#071a3d]
                text-[#e1bd70]
              "
            >
              <ShieldCheck size={22} />
            </div>

            <h1 className="text-3xl font-black tracking-tight text-[#071a3d] sm:text-[38px]">
              Login
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Access your Zonal Realty dashboard.
            </p>
          </div>

          <form
            onSubmit={handleLogin}
            className="space-y-4"
          >
            <div>
              <label className="text-sm font-semibold text-[#475569]">
                Email
              </label>

              <div className="mt-2 flex items-center gap-3 rounded-xl border border-[#dbe1e9] bg-white px-4 py-3.5 shadow-sm transition focus-within:border-[#9b762f] focus-within:ring-4 focus-within:ring-[#d6b56d]/10">
                <Mail size={18} className="text-[#9b762f]" />

                <input
                  type="email"
                  placeholder="name@zonalrealty.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent text-[#111827] outline-none placeholder:text-gray-400"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-[#475569]">
                Password
              </label>

              <div className="mt-2 flex items-center gap-3 rounded-xl border border-[#dbe1e9] bg-white px-4 py-3.5 shadow-sm transition focus-within:border-[#9b762f] focus-within:ring-4 focus-within:ring-[#d6b56d]/10">
                <Lock size={18} className="text-[#9b762f]" />

                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent text-[#111827] outline-none placeholder:text-gray-400"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="text-[#111827] transition hover:text-[#111827]"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                </button>
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
                rounded-xl
                border border-[#d6b56d]/40
                bg-[#071a3d]
                px-6
                py-3.5
                font-bold
                text-white
                shadow-xl
                shadow-[#0d1b4c]/20
                transition
                hover:-translate-y-0.5
                hover:bg-[#123f91]
                disabled:translate-y-0
                disabled:opacity-60
              "
            >
              {loading ? 'Signing in...' : 'Enter Dashboard'}
              <ArrowRight size={19} />
            </button>
          </form>

          <div className="mt-6 grid grid-cols-3 gap-2 text-center">
            {[
              { label: 'Secure', icon: ShieldCheck },
              { label: 'Fast', icon: Zap },
              { label: 'Private', icon: Lock },
            ].map(({ label, icon: TrustIcon }) => (
              <div
                key={label}
                className="flex flex-col items-center gap-1.5 rounded-xl border border-[#e5dfd2] bg-white px-2 py-3 text-xs font-bold text-[#071a3d] shadow-sm"
              >
                <TrustIcon className="h-4 w-4 text-[#9b762f]" />
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginModal
