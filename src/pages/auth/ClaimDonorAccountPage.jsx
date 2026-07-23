import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, KeyRound, Loader2, LockKeyhole, MailCheck } from 'lucide-react'

import api from '../../api/axios'
import endpoints from '../../api/endpoints'
import { useToast } from '../../components/feedback/ToastProvider'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'

function ClaimDonorAccountPage() {
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [step, setStep] = useState('request')
  const [formData, setFormData] = useState({
    otp: '',
    password: '',
    confirm_password: '',
  })
  const [loading, setLoading] = useState(false)

  async function handleRequest(event) {
    event.preventDefault()

    if (!email.trim()) {
      showToast({ type: 'error', message: 'Email address is required.' })
      return
    }

    try {
      setLoading(true)

      const response = await api.post(endpoints.claimDonorAccount, {
        email: email.trim(),
      })

      showToast({
        type: 'success',
        message:
          response?.data?.message ||
          'A verification code has been sent if the email is eligible.',
      })
      setStep('verify')
    } catch (err) {
      showToast({
        type: 'error',
        message:
          err?.response?.data?.message ||
          err?.response?.data?.detail ||
          'We could not process your request. Please try again.',
      })
    } finally {
      setLoading(false)
    }
  }

  function handleChange(event) {
    const { name, value } = event.target
    setFormData((current) => ({ ...current, [name]: value }))
  }

  async function handleVerify(event) {
    event.preventDefault()

    if (!/^\d{6}$/.test(formData.otp)) {
      showToast({ type: 'error', message: 'Enter the six-digit code from your email.' })
      return
    }
    if (formData.password.length < 8) {
      showToast({ type: 'error', message: 'Password must contain at least 8 characters.' })
      return
    }
    if (formData.password !== formData.confirm_password) {
      showToast({ type: 'error', message: 'Passwords do not match.' })
      return
    }

    try {
      setLoading(true)
      const response = await api.post(endpoints.claimDonorAccountVerify, {
        email: email.trim(),
        otp: formData.otp,
        password: formData.password,
        confirm_password: formData.confirm_password,
      })
      showToast({
        type: 'success',
        message: response?.data?.message || 'Your donor account is ready. You can now log in.',
      })
      navigate('/login', { replace: true })
    } catch (err) {
      const data = err?.response?.data
      showToast({
        type: 'error',
        message:
          data?.otp?.[0] ||
          data?.otp ||
          data?.message ||
          data?.detail ||
          'The verification code is invalid or expired.',
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
            to="/login"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-700 transition hover:text-green-700"
          >
            <ArrowLeft size={16} />
            Back to Login
          </Link>

          <div className="rounded-[24px] bg-[#0b1a13] px-5 py-6 text-white">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
              {step === 'request' ? <MailCheck size={20} /> : <KeyRound size={20} />}
            </div>
            <h1 className="mt-4 text-3xl font-bold">Claim your donor account</h1>
            <p className="mt-3 text-sm leading-7 text-white/80">
              {step === 'request'
                ? 'Enter the email used for a guest donation or project update subscription. We will send a six-digit verification code.'
                : `Enter the code sent to ${email} and create your donor account password.`}
            </p>
          </div>

          {step === 'request' ? (
            <form onSubmit={handleRequest} className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Donation or subscription email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Enter the email you previously used"
                  className="h-12 w-full rounded-xl border border-gray-300 bg-white px-4 outline-none transition focus:border-green-700 focus:ring-4 focus:ring-green-100"
                  required
                />
              </div>

              <Button type="submit" className="h-12 w-full" disabled={loading}>
                {loading ? <Loader2 size={16} className="mr-2 animate-spin" /> : <MailCheck size={16} className="mr-2" />}
                {loading ? 'Sending code...' : 'Send verification code'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Verification code</label>
                <input
                  type="text"
                  name="otp"
                  value={formData.otp}
                  onChange={handleChange}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  placeholder="Enter the 6-digit code"
                  className="h-12 w-full rounded-xl border border-gray-300 bg-white px-4 text-center text-lg font-semibold tracking-[0.35em] outline-none transition focus:border-green-700 focus:ring-4 focus:ring-green-100"
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">New password</label>
                <input type="password" name="password" value={formData.password} onChange={handleChange} autoComplete="new-password" placeholder="At least 8 characters" className="h-12 w-full rounded-xl border border-gray-300 bg-white px-4 outline-none transition focus:border-green-700 focus:ring-4 focus:ring-green-100" required />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Confirm password</label>
                <input type="password" name="confirm_password" value={formData.confirm_password} onChange={handleChange} autoComplete="new-password" placeholder="Repeat your password" className="h-12 w-full rounded-xl border border-gray-300 bg-white px-4 outline-none transition focus:border-green-700 focus:ring-4 focus:ring-green-100" required />
              </div>
              <Button type="submit" className="h-12 w-full" disabled={loading}>
                {loading ? <Loader2 size={16} className="mr-2 animate-spin" /> : <LockKeyhole size={16} className="mr-2" />}
                {loading ? 'Creating account...' : 'Verify and set password'}
              </Button>
              <div className="flex items-center justify-between text-xs">
                <button type="button" onClick={() => setStep('request')} className="font-medium text-green-700 hover:underline">Change email</button>
                <button type="button" onClick={handleRequest} disabled={loading} className="font-medium text-green-700 hover:underline disabled:opacity-60">Resend code</button>
              </div>
            </form>
          )}

          <div className="mt-5 flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
            <Link to="/register" className="font-medium text-green-700 hover:underline">
              Create a donor account instead
            </Link>

            <Link to="/login" className="font-medium text-green-700 hover:underline">
              Back to login
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default ClaimDonorAccountPage
