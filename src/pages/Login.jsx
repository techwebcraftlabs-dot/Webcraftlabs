import { useState } from 'react';
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault()

    if (!email || !password) {
      return
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);  
      navigate('/Dashboard');
    } catch (error) {
      // This is where we catch that 400 error!
      let Message = "An error occurred. Please try again.";
      console.log(error.code);

      // Switch case to handle specific Firebase Auth errors
      switch (error.code) {
        case "auth/invalid-email":
          Message = "The email address is not formatted correctly.";
          break;
        case "auth/user-disabled":
          Message = "This user account has been disabled.";
          break;
        case "auth/user-not-found":
        case "auth/wrong-password":
        case "auth/invalid-credential": 
          // Modern Firebase merges these for security, so hackers can't guess emails
          Message = "Incorrect email or password. Please try again.";
          break;
        case "auth/too-many-requests":
          Message = "Too many failed attempts. This account has been temporarily blocked. Try again later.";
          break;
      }
      alert(Message);
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
              Email
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