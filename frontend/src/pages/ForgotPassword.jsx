// src/pages/ForgotPassword.jsx
import { Loader2, Mail } from "lucide-react"
import { useState } from "react"
import { Link } from "react-router-dom"

const ForgotPassword = () => {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)

    // Simulate sending reset email
    setTimeout(() => {
      setLoading(false)
      setMessage("A reset link has been sent to your email.")
    }, 2000)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Forgot Password</h2>
          <p className="text-base-content/60">Enter your email to receive a reset link</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Email</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="size-5 text-base-content/40" />
              </div>
              <input
                type="email"
                className="input input-bordered w-full pl-10"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={loading || !email}
          >
            {loading ? (
              <>
                <Loader2 className="size-5 animate-spin mr-2" />
                Sending...
              </>
            ) : (
              "Send Reset Link"
            )}
          </button>
        </form>

        {message && <p className="text-success text-center">{message}</p>}

        <div className="text-center text-base-content/60 mt-4">
          <Link to="/login" className="link link-primary">Back to Login</Link>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
