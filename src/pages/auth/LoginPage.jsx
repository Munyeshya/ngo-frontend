import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AlertCircle, Eye, EyeOff, Loader2, LogIn, ShieldCheck } from 'lucide-react'

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

      const redirectTo = getRoleRedirect(user?.role)
      navigate(redirectTo, { replace: true })
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
    <Card className="overflow-hidden rounded-[28px] p-0">
      <div className="grid lg:grid-cols-[1fr_420px]">
        <div className="hidden bg-gradient-to-br from-green-900 via-green-800 to-green-700 p-8 text-white lg:flex lg:flex-col lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-white/80">
              <ShieldCheck size={14} />
              NGO Platform Access
            </div>

            <h2 className="mt-6 text-4xl font-bold leading-tight">
              Welcome back to your NGO account
            </h2>

            <p className="mt-4 max-w-md text-sm leading-7 text-white/75">
              Sign in as donor, staff, or admin to access the right dashboard and continue your
              work securely.
            </p>
          </div>

          <div className="grid gap-4">
            <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
              <p className="text-sm font-semibold">Donors</p>
              <p className="mt-1 text-sm text-white/75">
                Track your donations, history, and supported projects.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
              <p className="text-sm font-semibold">Staff</p>
              <p className="mt-1 text-sm text-white/75">
                Manage project operations, updates, beneficiaries, and progress.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
              <p className="text-sm font-semibold">Admins</p>
              <p className="mt-1 text-sm text-white/75">
                Access platform-wide management, users, reports, and controls.
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8 lg:p-10">
          <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
          <p className="mt-2 text-sm text-gray-600">
            Login to continue to your account.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Enter your username"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none ring-0 transition focus:border-green-700"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Password</label>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 pr-12 outline-none ring-0 transition focus:border-green-700"
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

            <Button type="submit" className="w-full" disabled={loading}>
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
    </Card>
  )
}

export default LoginPage