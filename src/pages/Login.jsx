import { useState } from 'react'

function Login() {

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = (e) => {
    e.preventDefault()

    if (
      email === 'admin@zonal.com' &&
      password === 'zonal123'
    ) {

      localStorage.setItem('isLoggedIn', 'true')

      window.location.href = '/Dashboard'

    } else {
      alert('Invalid Credentials')
    }
  }

  return (
    <section className="min-h-screen bg-[#f6f1eb] flex items-center justify-center px-6">

      <div className="bg-white w-full max-w-md p-10 rounded-[35px] shadow-2xl">

        <h1 className="text-4xl font-black text-[#3b281f] text-center">
          Login
        </h1>

        <p className="text-gray-500 text-center mt-3">
          Welcome back to Zonal Realty
        </p>

        <form
          onSubmit={handleLogin}
          className="mt-10 space-y-5"
        >

          {/* EMAIL */}
          <div>

            <label className="text-sm text-gray-500">
              Emailfsfsfs
            </label>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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

          {/* PASSWORD */}
          <div>

            <label className="text-sm text-gray-500">
              Password
            </label>

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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

          {/* BUTTON */}
          <button
            type="submit"
            className="
              w-full
              bg-[#3b281f]
              text-white
              py-4
              rounded-2xl
              font-semibold
              hover:bg-[#2a1d17]
              transition-all
            "
          >
            Login
          </button>

        </form>

      </div>

    </section>
  )
}

export default Login