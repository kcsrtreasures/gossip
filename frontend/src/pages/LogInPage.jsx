import axios from "axios"
import { Eye, EyeOff, Loader2, Lock, Mail, MessageSquare } from "lucide-react"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import AuthImagePattern from "../components/AuthImagePattern"
import { useAuthStore } from "../store/useAuthStore"

const LogInPage = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({ email: "", password: "" })
  const { login, isLoggingIn } = useAuthStore()

  const handleSubmit = async (e) => {
    e.preventDefault()
    const result = await login(formData) // expects user/token

    const redirect = new URLSearchParams(window.location.search).get("redirect")

    if (result?.token && window.opener) {
      // Desktop popup flow
      window.opener.postMessage(
        {
          type: "LOGIN_SUCCESS",
          user: { fullName: result.user.fullName },
          token: result.token,
        },
        redirect || window.location.origin
      )
      try {
        window.close()
      } catch {
        if (redirect) window.location.href = redirect
      }
    } else if (result?.token && redirect) {
      // Mobile redirect only if login started from Breads website
      window.location.href = redirect
    }
  }

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await axios.get("/auth/check", { withCredentials: true })
        const redirect = new URLSearchParams(window.location.search).get("redirect")

        if (res.data?.fullName && window.opener) {
          // Desktop popup flow
          window.opener.postMessage(
            {
              type: "LOGIN_SUCCESS",
              user: { fullName: res.data.fullName },
              token: res.data.token,
            },
            redirect || window.location.origin
          )
          try {
            window.close()
          } catch {
            if (redirect) window.location.href = redirect
          }
        } else if (res.data?.fullName && redirect) {
          // Mobile redirect only if login started from Breads website
          window.location.href = redirect
        }
      } catch (err) {
        // No session, show login form
      }
    }

    checkSession()
  }, [])

  return (
    <div>
      <div className="min-h-screen grid lg:grid-cols-2">
        {/* left side of the form */}
        <div className="flex flex-col justify-center items-center p-6 sm:p-12">
          <div className="w-full max-w-md space-y-8">
            {/* LOGO */}
            <div className="text-center mb-8">
              <div className="flex flex-col items-center gap-2 group">
                <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <MessageSquare className="size-6 text-primary" />
                </div>
                <h1 className="text-2xl font-bold mt-2">Welcome Back!</h1>
                <p className="text-base-content/60">Sign in to your account</p>
              </div>
            </div>

            {/* Form */}
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
                    className={`input input-bordered w-full pl-10`}
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Password</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="size-5 text-base-content/40" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    className={`input input-bordered w-full pl-10`}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="size-5 text-base-content/40" />
                    ) : (
                      <Eye className="size-5 text-base-content/40" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-full"
                disabled={isLoggingIn || !formData.email || !formData.password}
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="size-5 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            <div className="text-center">
              <p className="text-base-content/60">
                Don't have an account?{" "}
                <Link to="/signup" className="link link-primary">
                  Create account
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* right side */}
        <AuthImagePattern
          title="Join our community"
          subtitle="Connect with friends, share moments, and stay in touch with your loved ones."
        />
      </div>
    </div>
  )
}

export default LogInPage
