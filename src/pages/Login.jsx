import { useState } from 'react'
import {
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import { useNavigate } from 'react-router-dom'

import { auth, db } from '../firebase'

import {
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore'

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

      const userCredential =
        await signInWithEmailAndPassword(
          auth,
          email,
          password
        )

      const user =
        userCredential.user

      const q = query(
        collection(db, 'agents'),
        where(
          'zonalEmail',
          '==',
          user.email
        )
      )

      const snapshot =
        await getDocs(q)

      if (!snapshot.empty) {
        const agentData =
          snapshot.docs[0].data()

        if (agentData.status !== 'Active') {
          await signOut(auth)
          alert(
            'Your account is still for approval.'
          )
          return
        }

        localStorage.setItem(
          'role',
          agentData.role ||
            'Agent'
        )

        localStorage.setItem(
          'fullName',
          `${agentData.firstName || ''} ${
            agentData.lastName || ''
          }`
        )

        localStorage.setItem(
          'agentId',
          snapshot.docs[0].id
        )

        localStorage.setItem(
          'agentData',
          JSON.stringify(agentData)
        )
      } else {
        localStorage.setItem(
          'role',
          'Administrator'
        )

        localStorage.setItem(
          'fullName',
          'Administrator'
        )
      }

      navigate('/Dashboard')
    } catch (error) {
      console.log(error)

      let Message =
        'Login failed.'

      switch (error.code) {
        case 'auth/invalid-email':
          Message =
            'Invalid email format.'
          break

        case 'auth/user-disabled':
          Message =
            'Account disabled.'
          break

        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          Message =
            'Incorrect email or password.'
          break

        case 'auth/too-many-requests':
          Message =
            'Too many login attempts. Try again later.'
          break

        default:
          Message =
            error.message
      }

      alert(Message)
    } finally {
      setLoading(false)
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
              bg-[#3b281f]
              text-white
              py-4
              rounded-2xl
              font-semibold
              hover:bg-[#2a1d17]
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
