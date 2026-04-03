import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft,
  KeyRound,
  Loader2,
  LockKeyhole,
} from 'lucide-react'

import api from '../../api/axios'
import endpoints from '../../api/endpoints'
import { useToast } from '../../components/feedback/ToastProvider'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'

function ClaimDonorAccountVerifyPage() {
  const { showToast } = useToast()
  const [searchParams] = useSearchParams()
  const [formData, setFormData] = useState({
    token: '',
    password: '',
    confirm_password: '',
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const token = searchParams.get('token') || ''

    if (token) {
      setFormData((prev) => ({
        ...prev,
        token,
      }))
    }
  }, [searchParams])

  function handleChange(event) {
    const { name, value } = event.target

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!formData.token.trim()) {
      showToast({ type: 'error', message: 'Verification token is required.' })
      return
    }

    if (!formData.password.trim()) {
      showToast({ type: 'error', message: 'Password is required.' })
      return
    }

    if (formData.password !== formData.confirm_password) {
      showToast({ type: 'error', message: 'Passwords do not match.' })
      return
    }

    try {
      setLoading(true)

      const response = await api.post(endpoints.claimDonorAccountVerify, {
        token: formData.token.trim(),
        password: formData.password,
        confirm_password: formData.confirm_password,
      })

      showToast({
        type: 'success',
        message:
          response?.data?.message ||
          'Donor account verified successfully. You can now log in.',
      })
    } catch (err) {
      const data = err?.response?.data
      const tokenError = data?.token?.[0] || data?.token

      showToast({
        type: 'error',
        message:
          data?.message ||
          data?.detail ||
          tokenError ||
          'The claim token is invalid or expired.',
      })
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

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl items-center justify-center">
        <Card className="w-full max-w-[560px] rounded-[28px] border border-[#DDE5DB] bg-[#F3F4F1] p-6 shadow-[0_24px_80px_rgba(16,24,40,0.12)] sm:p-8">
          <Link
            to="/claim-donor-account"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-700 transition hover:text-green-700"
          >
            <ArrowLeft size={16} />
            Back to claim request
          </Link>

          <div className="rounded-[24px] bg-[#0b1a13] px-5 py-6 text-white">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
              <KeyRound size={20} />
            </div>
            <h1 className="mt-4 text-3xl font-bold">Verify donor account</h1>
            <p className="mt-3 text-sm leading-7 text-white/80">
              Enter the token from your email and create a password for your donor account.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Verification Token
              </label>
              <input
                type="text"
                name="token"
                value={formData.token}
                onChange={handleChange}
                placeholder="Paste the token from your email"
                className="h-12 w-full rounded-xl border border-gray-300 bg-white px-4 outline-none transition focus:border-green-700 focus:ring-4 focus:ring-green-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                New Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a new password"
                className="h-12 w-full rounded-xl border border-gray-300 bg-white px-4 outline-none transition focus:border-green-700 focus:ring-4 focus:ring-green-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirm_password"
                value={formData.confirm_password}
                onChange={handleChange}
                placeholder="Repeat your password"
                className="h-12 w-full rounded-xl border border-gray-300 bg-white px-4 outline-none transition focus:border-green-700 focus:ring-4 focus:ring-green-100"
              />
            </div>

            <Button type="submit" className="h-12 w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Verifying account...
                </>
              ) : (
                <>
                  <LockKeyhole size={16} className="mr-2" />
                  Verify and create password
                </>
              )}
            </Button>
          </form>

          <div className="mt-5 flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
            <Link to="/login" className="font-medium text-green-700 hover:underline">
              Back to login
            </Link>

            <Link
              to="/claim-donor-account"
              className="font-medium text-green-700 hover:underline"
            >
              Request a new token
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default ClaimDonorAccountVerifyPage
