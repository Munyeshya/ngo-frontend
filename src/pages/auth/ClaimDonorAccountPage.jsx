import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertCircle, ArrowLeft, CheckCircle2, Loader2, MailCheck } from 'lucide-react'

import api from '../../api/axios'
import endpoints from '../../api/endpoints'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'

function ClaimDonorAccountPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (!email.trim()) {
      setError('Email address is required.')
      return
    }

    try {
      setLoading(true)

      const response = await api.post(endpoints.claimDonorAccount, {
        email: email.trim(),
      })

      setSuccess(
        response?.data?.message ||
          'A donor claim verification email has been sent if the account exists.'
      )
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.detail ||
          'We could not process your request. Please try again.'
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

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl items-center justify-center">
        <Card className="w-full max-w-[560px] rounded-[28px] border border-[#DDE5DB] bg-[#F3F4F1] p-6 shadow-[0_24px_80px_rgba(16,24,40,0.12)] sm:p-8">
          <Link
            to="/login"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-700 transition hover:text-green-700"
          >
            <ArrowLeft size={16} />
            Back to Login
          </Link>

          <div className="rounded-[24px] bg-[#0b1a13] px-5 py-6 text-white">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
              <MailCheck size={20} />
            </div>
            <h1 className="mt-4 text-3xl font-bold">Claim your donor account</h1>
            <p className="mt-3 text-sm leading-7 text-white/80">
              If you donated before creating an account, enter the same email you used during
              donation. We will send you a verification link so you can set your password.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Donation Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Enter the email you used when donating"
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
                    <p className="mt-2 text-sm text-green-800">
                      Check your inbox and spam folder. The verification token expires after one
                      hour.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <Button type="submit" className="h-12 w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Sending verification email...
                </>
              ) : (
                <>
                  <MailCheck size={16} className="mr-2" />
                  Send claim verification email
                </>
              )}
            </Button>
          </form>

          <div className="mt-5 flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
            <Link to="/register" className="font-medium text-green-700 hover:underline">
              Create a donor account instead
            </Link>

            <Link
              to="/claim-donor-account/verify"
              className="font-medium text-green-700 hover:underline"
            >
              Already have a token?
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default ClaimDonorAccountPage
