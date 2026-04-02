import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  UserPlus,
  Users,
} from 'lucide-react'

import api from '../../api/axios'
import endpoints from '../../api/endpoints'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'

const roleOptions = [
  {
    value: 'donor',
    title: 'Donor account',
    description: 'Create your own account to donate, track your giving, and follow project updates.',
  },
  {
    value: 'staff',
    title: 'Staff application',
    description: 'Apply for project management access. An admin must approve your account before login.',
  },
]

function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone_number: '',
    role: 'donor',
    password: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submittedRole, setSubmittedRole] = useState('')

  function handleChange(event) {
    const { name, value } = event.target

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (!formData.username.trim()) {
      setError('Username is required.')
      return
    }

    if (!formData.email.trim()) {
      setError('Email address is required.')
      return
    }

    if (!formData.password.trim()) {
      setError('Password is required.')
      return
    }

    try {
      setLoading(true)

      const response = await api.post(endpoints.register, {
        username: formData.username.trim(),
        email: formData.email.trim(),
        phone_number: formData.phone_number.trim(),
        role: formData.role,
        password: formData.password,
      })

      setSubmittedRole(formData.role)
      setSuccess(
        response?.data?.message ||
          (formData.role === 'staff'
            ? 'Staff application submitted successfully.'
            : 'Account created successfully.')
      )

      setFormData({
        username: '',
        email: '',
        phone_number: '',
        role: formData.role,
        password: '',
      })
    } catch (err) {
      const data = err?.response?.data
      const firstFieldError =
        data && typeof data === 'object'
          ? Object.values(data).flat().find(Boolean)
          : null

      setError(
        data?.message ||
          data?.detail ||
          firstFieldError ||
          'Registration failed. Please review your details and try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#F6F8F4] px-4 py-8 sm:px-6 lg:px-8">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-10 top-10 h-56 w-56 rounded-full bg-green-200/50 blur-3xl" />
        <div className="absolute bottom-10 right-10 h-72 w-72 rounded-full bg-emerald-100/70 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center justify-center">
        <Card className="w-full overflow-hidden rounded-[28px] border border-[#DDE5DB] bg-[#F3F4F1] p-0 shadow-[0_24px_80px_rgba(16,24,40,0.12)]">
          <div className="grid min-h-[640px] lg:grid-cols-[1.02fr_0.98fr]">
            <div className="hidden min-h-[640px] bg-[#0b1a13] p-10 text-white lg:flex lg:flex-col lg:justify-between">
              <div>
                <span className="inline-flex rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/85">
                  Join the platform
                </span>

                <h2 className="mt-6 max-w-xl text-4xl font-bold leading-tight">
                  Choose how you want to participate in the NGO ecosystem
                </h2>

                <p className="mt-5 max-w-lg text-sm leading-8 text-white/80">
                  Donors can create accounts right away. Staff members can apply for access and
                  start working after admin approval.
                </p>
              </div>

              <div className="space-y-4">
                {roleOptions.map((option) => {
                  const Icon = option.value === 'staff' ? ShieldCheck : Users

                  return (
                    <label
                      key={option.value}
                      className={`block cursor-pointer rounded-2xl border p-4 backdrop-blur transition ${
                        formData.role === option.value
                          ? 'border-green-300 bg-white/18'
                          : 'border-white/10 bg-white/10 hover:border-white/20 hover:bg-white/14'
                      }`}
                    >
                      <input
                        type="radio"
                        name="role"
                        value={option.value}
                        checked={formData.role === option.value}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <div className="flex items-start gap-3">
                        <div
                          className={`rounded-2xl p-3 ${
                            formData.role === option.value ? 'bg-white text-[#166534]' : 'bg-white/10'
                          }`}
                        >
                          <Icon size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold">{option.title}</p>
                          <p className="mt-1 text-sm leading-7 text-white/75">
                            {option.description}
                          </p>
                        </div>
                      </div>
                    </label>
                  )
                })}
              </div>
            </div>

            <div className="flex items-center justify-center px-6 py-10 sm:px-10 lg:px-12 xl:px-14">
              <div className="w-full max-w-[420px]">
                <Link
                  to="/login"
                  className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-700 transition hover:text-green-700"
                >
                  <ArrowLeft size={16} />
                  Back to Login
                </Link>

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
                      placeholder="Choose a username"
                      className="h-12 w-full rounded-xl border border-gray-300 bg-white px-4 outline-none transition focus:border-green-700 focus:ring-4 focus:ring-green-100"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email address"
                      className="h-12 w-full rounded-xl border border-gray-300 bg-white px-4 outline-none transition focus:border-green-700 focus:ring-4 focus:ring-green-100"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      name="phone_number"
                      value={formData.phone_number}
                      onChange={handleChange}
                      placeholder="Optional phone number"
                      className="h-12 w-full rounded-xl border border-gray-300 bg-white px-4 outline-none transition focus:border-green-700 focus:ring-4 focus:ring-green-100"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Create a secure password"
                      className="h-12 w-full rounded-xl border border-gray-300 bg-white px-4 outline-none transition focus:border-green-700 focus:ring-4 focus:ring-green-100"
                    />
                  </div>

                  {error && (
                    <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      <AlertCircle size={18} className="mt-0.5 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  {success && (
                    <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
                        <div>
                          <p>{success}</p>
                          {submittedRole === 'staff' ? (
                            <p className="mt-2 text-sm text-green-800">
                              Watch your email for approval updates. You will only be able to log in
                              after an admin activates your staff account.
                            </p>
                          ) : (
                            <p className="mt-2 text-sm text-green-800">
                              Your donor account is ready. You can now log in.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <Button type="submit" className="h-12 w-full" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 size={16} className="mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <UserPlus size={16} className="mr-2" />
                        {formData.role === 'staff' ? 'Apply as Staff' : 'Create Donor Account'}
                      </>
                    )}
                  </Button>
                </form>

                <div className="mt-5 flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
                  <Link to="/login" className="font-medium text-green-700 hover:underline">
                    Already have an account?
                  </Link>

                  <Link
                    to="/claim-donor-account"
                    className="font-medium text-green-700 hover:underline"
                  >
                    Claim donor account
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

export default RegisterPage
