import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AlertCircle, Eye, EyeOff, Loader2, LogIn } from 'lucide-react'

import api from '../../api/axios'
import endpoints from '../../api/endpoints'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'

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
    if (normalizedRole === 'staff') return '/staff/dashboard'
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

      if (!access) {
        throw new Error('Access token was not returned by the server.')
      }

      localStorage.setItem('ngo_access_token', access)

      if (refresh) {
        localStorage.setItem('ngo_refresh_token', refresh)
      }

      api.defaults.headers.common.Authorization = `Bearer ${access}`

      const profileResponse = await api.get(
        endpoints.profile || endpoints.me || '/users/profile/'
      )

      const user =
        profileResponse?.data?.data ||
        profileResponse?.data?.user ||
        profileResponse?.data

      if (user) {
        localStorage.setItem('ngo_user', JSON.stringify(user))
      }

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
    <div className="relative min-h-screen overflow-hidden bg-[#F8F8F6]">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-green-200/40 blur-3xl" />
        <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-emerald-100/70 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-lime-100/50 blur-3xl" />

        <div className="absolute inset-0 opacity-[0.045]">
          <div
            className="h-full w-full"
            style={{
              backgroundImage: `
                linear-gradient(rgba(16, 185, 129, 0.7) 1px, transparent 1px),
                linear-gradient(90deg, rgba(16, 185, 129, 0.7) 1px, transparent 1px)
              `,
              backgroundSize: '42px 42px',
            }}
          />
        </div>

        <div className="absolute inset-0 opacity-[0.06]">
          <div
            className="h-full w-full"
            style={{
              backgroundImage:
                'radial-gradient(circle at 1.5px 1.5px, rgba(21, 128, 61, 0.9) 1.5px, transparent 0)',
              backgroundSize: '26px 26px',
            }}
          />
        </div>
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl items-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid w-full items-center gap-8 lg:grid-cols-[1.05fr_460px] xl:grid-cols-[1.1fr_500px]">
          <div className="relative hidden min-h-[680px] overflow-hidden rounded-[32px] lg:block">
            <img
              src="https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1600&q=80"
              alt="Community support"
              className="absolute inset-0 h-full w-full object-cover"
            />

            <div className="absolute inset-0 bg-green-950/55" />
            <div className="absolute inset-0 bg-gradient-to-br from-green-900/60 via-green-950/35 to-black/70" />

            <div className="absolute inset-0 opacity-20">
              <div
                className="h-full w-full"
                style={{
                  backgroundImage: `
                    linear-gradient(rgba(255,255,255,0.12) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(255,255,255,0.12) 1px, transparent 1px)
                  `,
                  backgroundSize: '44px 44px',
                }}
              />
            </div>

            <div className="relative z-10 flex h-full flex-col justify-between p-10 text-white xl:p-12">
              <div>
                <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/90 backdrop-blur">
                  Together for impact
                </span>

                <h1 className="mt-6 max-w-xl text-4xl font-bold leading-tight xl:text-5xl">
                  Support meaningful causes and help communities thrive
                </h1>

                <p className="mt-5 max-w-lg text-sm leading-8 text-white/80 xl:text-base">
                  This platform makes giving more transparent, accountable, and impactful by
                  connecting people to real projects that transform lives through compassion,
                  support, and long-term change.
                </p>
              </div>

              <div className="grid gap-4">
                <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-md">
                  <p className="text-sm font-semibold">Transparent giving</p>
                  <p className="mt-1 text-sm leading-7 text-white/75">
                    Follow project progress, see outcomes, and support verified impact.
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-md">
                  <p className="text-sm font-semibold">Real community change</p>
                  <p className="mt-1 text-sm leading-7 text-white/75">
                    Every contribution supports causes in education, health, livelihoods, and
                    sustainable development.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mx-auto w-full max-w-[500px]">
            <Card className="rounded-[30px] border border-white/70 bg-white/90 p-6 shadow-[0_20px_80px_rgba(16,24,40,0.08)] backdrop-blur-xl sm:p-8">
              <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100 text-green-800">
                <LogIn size={24} />
              </div>

              <div className="text-center">
                <h2 className="text-3xl font-bold tracking-tight text-gray-900">Welcome back</h2>
                <p className="mt-2 text-sm leading-7 text-gray-600">
                  Login to continue supporting impactful causes and managing your account.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="mt-8 space-y-4">
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
                    className="h-12 w-full rounded-2xl border border-gray-300 bg-white px-4 text-sm outline-none ring-0 transition focus:border-green-700"
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
                      className="h-12 w-full rounded-2xl border border-gray-300 bg-white px-4 pr-12 text-sm outline-none ring-0 transition focus:border-green-700"
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

                <Button
                  type="submit"
                  className="mt-2 h-12 w-full rounded-2xl"
                  disabled={loading}
                >
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

              <div className="mt-6 space-y-3 border-t border-gray-200 pt-5 text-center">
                <Link
                  to="/claim-donor-account"
                  className="block text-sm font-medium text-green-700 transition hover:text-green-800 hover:underline"
                >
                  Claim donor account
                </Link>

                <p className="text-sm text-gray-500">
                  Don&apos;t have an account?{' '}
                  <Link
                    to="/register"
                    className="font-semibold text-green-700 transition hover:text-green-800 hover:underline"
                  >
                    Create accountav
                  </Link>
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage