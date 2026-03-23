import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AlertCircle, ArrowLeft, Eye, EyeOff, Loader2, LogIn } from 'lucide-react'

import api from '../../api/axios'
import endpoints from '../../api/endpoints'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { setAuth } from '../../utils/storage'

function LoginPage() {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    username: '',
    password: '',
  })

  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  function handleChange(event) {
    const { name, value } = event.target

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  function getRoleRedirect(role) {
    const normalizedRole = String(role || '').toLowerCase()

    if (normalizedRole === 'admin') return '/admin/dashboard'
    if (normalizedRole === 'staff') return '/dashboard'
    if (normalizedRole === 'donor') return '/donor/dashboard'

    return '/'
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (!formData.username.trim()) {
      setError('Username is required.')
      return
    }

    if (!formData.password.trim()) {
      setError('Password is required.')
      return
    }

    try {
      setLoading(true)

      const loginResponse = await api.post(endpoints.login, {
        username: formData.username.trim(),
        password: formData.password,
      })

      const access =
        loginResponse?.data?.access ||
        loginResponse?.data?.data?.access ||
        loginResponse?.data?.token?.access

      const refresh =
        loginResponse?.data?.refresh ||
        loginResponse?.data?.data?.refresh ||
        loginResponse?.data?.token?.refresh

      let user =
        loginResponse?.data?.user ||
        loginResponse?.data?.data?.user ||
        null

      if (!access) {
        throw new Error('Access token was not returned by the server.')
      }

      api.defaults.headers.common.Authorization = `Bearer ${access}`

      if (!user) {
        const profileResponse = await api.get(
          endpoints.profile || endpoints.me || '/users/profile/'
        )

        user =
          profileResponse?.data?.data ||
          profileResponse?.data?.user ||
          profileResponse?.data
      }

      setAuth({
        access,
        refresh,
        user,
      })

      setSuccess('Login successful. Redirecting...')
      navigate(getRoleRedirect(user?.role), { replace: true })
    } catch (err) {
      const message =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.response?.data?.non_field_errors?.[0] ||
        err?.message ||
        'Login failed. Please check your credentials and try again.'

      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#F6F8F4] px-4 py-8 sm:px-6 lg:px-8">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-10 top-10 h-56 w-56 rounded-full bg-green-200/50 blur-3xl" />
        <div className="absolute bottom-10 right-10 h-72 w-72 rounded-full bg-emerald-100/70 blur-3xl" />

        <div className="absolute inset-0 opacity-[0.045]">
          <div
            className="h-full w-full"
            style={{
              backgroundImage: `
                linear-gradient(rgba(22,101,52,0.12) 1px, transparent 1px),
                linear-gradient(90deg, rgba(22,101,52,0.12) 1px, transparent 1px)
              `,
              backgroundSize: '38px 38px',
            }}
          />
        </div>
      </div>

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center justify-center">
        <Card className="w-full overflow-hidden rounded-[28px] border border-[#DDE5DB] bg-[#F3F4F1] p-0 shadow-[0_24px_80px_rgba(16,24,40,0.12)]">
          <div className="grid min-h-[640px] lg:grid-cols-[1.05fr_0.95fr]">
            <div className="relative hidden min-h-[640px] overflow-hidden lg:block">
              <img
                src="https://rs.projects-abroad.org/v1/hero/product-5d52a6ffeac4e.[1600].jpeg"
                alt="Community support"
                className="absolute inset-0 h-full w-full object-cover"
              />

              <div className="absolute inset-0 bg-green-950/50" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-green-950/30 to-black/45" />

              <div className="relative z-10 flex h-full flex-col justify-between p-10 text-white">
                <div>
                  <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/85 backdrop-blur">
                    Together for impact
                  </span>

                  <h2 className="mt-6 max-w-xl text-4xl font-bold leading-tight">
                    Support meaningful causes and help communities thrive
                  </h2>

                  <p className="mt-5 max-w-lg text-sm leading-8 text-white/80">
                    This platform connects people, projects, and support systems to make giving more
                    transparent, impactful, and accessible. Every contribution helps strengthen lives,
                    expand opportunities, and build lasting change.
                  </p>
                </div>

                <div className="grid gap-4">
                  <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-md">
                    <p className="text-sm font-semibold">Transparent giving</p>
                    <p className="mt-1 text-sm leading-7 text-white/75">
                      Follow real projects, see progress, and support verified impact.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-md">
                    <p className="text-sm font-semibold">Community-centered action</p>
                    <p className="mt-1 text-sm leading-7 text-white/75">
                      From education and health to livelihoods and sustainability, every project serves
                      a meaningful cause.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center px-6 py-10 sm:px-10 lg:px-12 xl:px-14">
              <div className="w-full max-w-[380px]">
                <Link
                  to="/"
                  className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-700 transition hover:text-green-700"
                >
                  <ArrowLeft size={16} />
                  Back to Home
                </Link>

                <h1 className="text-3xl font-bold text-gray-900">Welcome back</h1>
                <p className="mt-2 text-sm text-gray-600">
                  Login to continue to your account.
                </p>

                <form onSubmit={handleSubmit} className="mt-7 space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Username
                    </label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="Enter your username"
                      className="h-12 w-full rounded-xl border border-gray-300 bg-white px-4 outline-none ring-0 transition focus:border-green-700 focus:ring-4 focus:ring-green-100"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Password
                    </label>

                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Enter your password"
                        className="h-12 w-full rounded-xl border border-gray-300 bg-white px-4 pr-12 outline-none ring-0 transition focus:border-green-700 focus:ring-4 focus:ring-green-100"
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute inset-y-0 right-0 flex items-center px-4 text-gray-500 transition hover:text-gray-700"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      <AlertCircle size={18} className="mt-0.5 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  {success && (
                    <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                      {success}
                    </div>
                  )}

                  <Button type="submit" className="h-12 w-full" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 size={16} className="mr-2 animate-spin" />
                        Logging in...
                      </>
                    ) : (
                      <>
                        <LogIn size={16} className="mr-2" />
                        Login
                      </>
                    )}
                  </Button>
                </form>

                <div className="mt-5 flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
                  <Link to="/claim-donor-account" className="font-medium text-green-700 hover:underline">
                    Claim donor account
                  </Link>

                  <Link to="/register" className="font-medium text-green-700 hover:underline">
                    Create account
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default LoginPage