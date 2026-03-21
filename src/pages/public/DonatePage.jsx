import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  HandCoins,
  CreditCard,
  Smartphone,
  Wallet,
  BadgeDollarSign,
  ShieldCheck,
  CheckCircle2,
  Landmark,
  MapPin,
  Loader2,
  AlertCircle,
} from 'lucide-react'

import api from '../../api/axios'
import endpoints from '../../api/endpoints'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import AnimatedBackground from '../../components/common/AnimatedBackground'

const currencyFormatter = new Intl.NumberFormat('en-RW', {
  style: 'currency',
  currency: 'RWF',
  maximumFractionDigits: 0,
})

const paymentMethods = [
  {
    value: 'momo',
    label: 'Mobile Money',
    description: 'Pay using your mobile wallet',
    icon: Smartphone,
  },
  {
    value: 'card',
    label: 'Card Payment',
    description: 'Visa and Mastercard checkout',
    icon: CreditCard,
  },
  {
    value: 'cash',
    label: 'Cash',
    description: 'Record an offline cash donation',
    icon: Wallet,
  },
]

const quickAmounts = [1000, 5000, 10000, 25000, 50000, 100000]

function unwrapPayload(payload) {
  if (!payload) return payload
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.results)) return payload.results
  if (Array.isArray(payload?.data)) return payload.data
  if (payload?.data && typeof payload.data === 'object') return payload.data
  return payload
}

function formatCurrency(value) {
  const amount = Number(value || 0)
  return currencyFormatter.format(Number.isNaN(amount) ? 0 : amount)
}

function getApiOrigin() {
  const baseURL = api?.defaults?.baseURL || ''
  return baseURL.replace(/\/api\/?$/, '')
}

function buildMediaUrl(path) {
  if (!path) return ''
  if (String(path).startsWith('http://') || String(path).startsWith('https://')) {
    return path
  }

  const origin = getApiOrigin()
  return `${origin}${String(path).startsWith('/') ? path : `/${path}`}`
}

function getProjectImage(project) {
  return (
    buildMediaUrl(project?.feature_image) ||
    'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1600&q=80'
  )
}

function inferCategory(project) {
  const text = `${project?.title || ''} ${project?.description || ''}`.toLowerCase()

  if (
    text.includes('health') ||
    text.includes('medical') ||
    text.includes('clinic') ||
    text.includes('hospital')
  ) {
    return 'Health'
  }

  if (
    text.includes('school') ||
    text.includes('education') ||
    text.includes('student') ||
    text.includes('learning')
  ) {
    return 'Education'
  }

  if (
    text.includes('environment') ||
    text.includes('green') ||
    text.includes('tree') ||
    text.includes('climate')
  ) {
    return 'Environment'
  }

  if (
    text.includes('women') ||
    text.includes('community') ||
    text.includes('livelihood') ||
    text.includes('empowerment')
  ) {
    return 'Community'
  }

  return 'Project'
}

function resolveDonationEndpoint() {
  return (
    endpoints?.donations ||
    endpoints?.donationCreate ||
    endpoints?.createDonation ||
    '/donations/'
  )
}

function DonatePage() {
  const params = useParams()
  const routeProjectId = params.projectId ?? params.id ?? ''

  const navigate = useNavigate()

  const [project, setProject] = useState(null)
  const [isLoadingProject, setIsLoadingProject] = useState(true)
  const [projectError, setProjectError] = useState('')

  const [formData, setFormData] = useState({
    donor_name: '',
    donor_email: '',
    amount: '',
    payment_method: 'momo',
    message: '',
    is_anonymous: false,

    momo_phone: '',
    momo_provider: 'mtn',
    momo_reference: '',

    card_holder_name: '',
    card_number: '',
    card_expiry: '',
    card_cvv: '',

    cash_payer_name: '',
    cash_reference: '',
    cash_collection_point: '',
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [submitSuccess, setSubmitSuccess] = useState('')

  useEffect(() => {
    let active = true

    async function fetchProject() {
      try {
        setIsLoadingProject(true)
        setProjectError('')

        const response = await api.get(endpoints.projectDetails(routeProjectId))
        const projectData = unwrapPayload(response.data)

        if (!active) return
        setProject(projectData)
      } catch (error) {
        if (!active) return

        setProjectError(
          error?.response?.data?.message ||
            error?.response?.data?.detail ||
            'Failed to load project.'
        )
      } finally {
        if (active) {
          setIsLoadingProject(false)
        }
      }
    }

    if (routeProjectId) {
      fetchProject()
    } else {
      setProjectError('Invalid project route.')
      setIsLoadingProject(false)
    }

    return () => {
      active = false
    }
  }, [routeProjectId])

  const projectImage = useMemo(() => getProjectImage(project), [project])
  const projectCategory = useMemo(() => inferCategory(project), [project])
  const projectRaised = useMemo(() => formatCurrency(project?.total_donated || 0), [project])
  const projectGoal = useMemo(() => formatCurrency(project?.target_amount || 0), [project])
  const projectProgress = useMemo(() => Number(project?.funding_percentage || 0), [project])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handlePaymentMethodSelect = (value) => {
    setFormData((prev) => ({
      ...prev,
      payment_method: value,
    }))
  }

  const handleQuickAmount = (amount) => {
    setFormData((prev) => ({
      ...prev,
      amount: String(amount),
    }))
  }

  const validateForm = () => {
    if (!formData.donor_name.trim()) return 'Full name is required.'
    if (!formData.donor_email.trim()) return 'Email address is required.'
    if (!/\S+@\S+\.\S+/.test(formData.donor_email)) return 'Enter a valid email address.'
    if (!formData.amount || Number(formData.amount) <= 0) return 'Enter a valid donation amount.'
    if (!formData.payment_method) return 'Select a payment method.'
    if (!project?.id) return 'Project information is missing.'
    return ''
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitError('')
    setSubmitSuccess('')

    const validationError = validateForm()
    if (validationError) {
      setSubmitError(validationError)
      return
    }

    const payload = {
      project: project.id,
      donor_name: formData.donor_name.trim(),
      donor_email: formData.donor_email.trim(),
      amount: Number(formData.amount).toFixed(2),
      payment_method: formData.payment_method,
      message: formData.message.trim(),
      is_anonymous: formData.is_anonymous,
    }

    try {
      setIsSubmitting(true)

      await api.post(resolveDonationEndpoint(), payload)

      setSubmitSuccess('Donation submitted successfully.')

      setFormData({
        donor_name: '',
        donor_email: '',
        amount: '',
        payment_method: 'momo',
        message: '',
        is_anonymous: false,

        momo_phone: '',
        momo_provider: 'mtn',
        momo_reference: '',

        card_holder_name: '',
        card_number: '',
        card_expiry: '',
        card_cvv: '',

        cash_payer_name: '',
        cash_reference: '',
        cash_collection_point: '',
      })

      setTimeout(() => {
        navigate(`/projects/${project.id}`)
      }, 1200)
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        'Failed to submit donation.'

      setSubmitError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoadingProject) {
    return (
      <div className="bg-[#F8F8F6]">
        <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
          <Card className="rounded-[24px] p-8">
            <div className="flex items-center justify-center gap-3 text-gray-700">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm font-medium">Loading project...</span>
            </div>
          </Card>
        </section>
      </div>
    )
  }

  if (projectError || !project) {
    return (
      <div className="bg-[#F8F8F6]">
        <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
          <Card className="rounded-[24px] p-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
              <AlertCircle size={22} />
            </div>
            <p className="mt-4 text-2xl font-bold text-gray-900">Project not found</p>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              {projectError || 'The project you want to support is not available.'}
            </p>
            <div className="mt-5">
              <Link to="/projects">
                <Button>Back to Projects</Button>
              </Link>
            </div>
          </Card>
        </section>
      </div>
    )
  }

  return (
    <div className="bg-[#F8F8F6]">
      <section className="relative overflow-hidden bg-black">
        <AnimatedBackground variant="dark" />

        <div className="absolute inset-0">
          <img
            src={projectImage}
            alt={project.title}
            className="h-full w-full object-cover opacity-20"
          />
        </div>

        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/50" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
          <Link
            to={`/projects/${project.id}`}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-medium text-white/90 backdrop-blur transition hover:bg-white/15"
          >
            <ArrowLeft size={14} />
            Back to Project
          </Link>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
            <div>
              <span className="inline-flex rounded-full bg-green-100 px-3 py-1.5 text-xs font-semibold text-green-800">
                {projectCategory}
              </span>

              <h1 className="mt-4 text-3xl font-bold leading-tight text-white sm:text-4xl">
                {project.title}
              </h1>

              <div className="mt-4 flex flex-wrap gap-4 text-xs text-white/75 sm:text-sm">
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-green-400" />
                  <span>{project.location || 'Location not specified'}</span>
                </div>
              </div>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/70">
                {project.description || 'Support this project through a simple donation flow.'}
              </p>
            </div>

            <Card className="rounded-[24px] border border-white/10 bg-white/10 p-4 text-white backdrop-blur-xl">
              <div>
                <p className="text-xs text-white/70">Current progress</p>
                <p className="text-xl font-bold">{projectProgress.toFixed(2)}% funded</p>
              </div>

              <div className="mt-4 h-2.5 rounded-full bg-white/15">
                <div
                  className="h-2.5 rounded-full bg-green-500"
                  style={{ width: `${Math.min(projectProgress, 100)}%` }}
                />
              </div>

              <div className="mt-4 flex items-center justify-between text-xs sm:text-sm">
                <div>
                  <p className="text-white/65">Raised</p>
                  <p className="font-semibold text-white">{projectRaised}</p>
                </div>
                <div className="text-right">
                  <p className="text-white/65">Goal</p>
                  <p className="font-semibold text-white">{projectGoal}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card className="rounded-[24px] p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-green-100 text-green-800">
                  <HandCoins size={18} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Complete your donation</h2>
                  <p className="mt-0.5 text-xs text-gray-600 sm:text-sm">
                    Fill in donor info, choose amount, then complete payment details.
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_360px]">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Donor information</h3>

                  <div className="mt-4 space-y-4">
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-gray-700 sm:text-sm">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="donor_name"
                        value={formData.donor_name}
                        onChange={handleChange}
                        placeholder="Enter your full name"
                        className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-green-700"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-gray-700 sm:text-sm">
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="donor_email"
                        value={formData.donor_email}
                        onChange={handleChange}
                        placeholder="Enter your email address"
                        className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-green-700"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-gray-700 sm:text-sm">
                        Message
                      </label>
                      <textarea
                        rows="5"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Optional message"
                        className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-green-700"
                      />
                    </div>

                    <label className="flex items-start gap-3 rounded-xl bg-[#F8F8F6] px-4 py-3 text-xs text-gray-700 sm:text-sm">
                      <input
                        type="checkbox"
                        name="is_anonymous"
                        checked={formData.is_anonymous}
                        onChange={handleChange}
                        className="mt-0.5 h-4 w-4 rounded border-gray-300 text-green-700 focus:ring-green-700"
                      />
                      <span>
                        Donate anonymously and hide your identity from public-facing donation
                        displays.
                      </span>
                    </label>
                  </div>
                </div>

                <div>
                  <div className="rounded-[20px] border border-gray-200 bg-[#F8F8F6] p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-green-100 text-green-800">
                        <BadgeDollarSign size={18} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Amount & payment</h3>
                        <p className="text-xs text-gray-600 sm:text-sm">
                          Choose amount and payment option.
                        </p>
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="mb-1.5 block text-xs font-medium text-gray-700 sm:text-sm">
                        Donation Amount
                      </label>
                      <input
                        type="number"
                        name="amount"
                        value={formData.amount}
                        onChange={handleChange}
                        placeholder="Enter amount"
                        className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-green-700"
                      />
                    </div>

                    <div className="mt-3 grid grid-cols-3 gap-2">
                      {quickAmounts.map((amount) => (
                        <button
                          key={amount}
                          type="button"
                          onClick={() => handleQuickAmount(amount)}
                          className={`rounded-xl border px-3 py-2 text-xs font-semibold transition sm:text-sm ${
                            String(amount) === formData.amount
                              ? 'border-green-700 bg-green-700 text-white'
                              : 'border-gray-200 bg-white text-gray-800 hover:border-green-700 hover:text-green-800'
                          }`}
                        >
                          {amount.toLocaleString()}
                        </button>
                      ))}
                    </div>

                    <div className="mt-4">
                      <label className="mb-2 block text-xs font-medium text-gray-700 sm:text-sm">
                        Payment Method
                      </label>

                      <div className="space-y-2.5">
                        {paymentMethods.map((method) => {
                          const MethodIcon = method.icon
                          const isActive = formData.payment_method === method.value

                          return (
                            <button
                              key={method.value}
                              type="button"
                              onClick={() => handlePaymentMethodSelect(method.value)}
                              className={`flex w-full items-center justify-between rounded-xl border px-3 py-3 text-left transition ${
                                isActive
                                  ? 'border-green-700 bg-white shadow-sm'
                                  : 'border-gray-200 bg-white hover:border-green-300'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                                    isActive
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-gray-100 text-gray-700'
                                  }`}
                                >
                                  <MethodIcon size={18} />
                                </div>

                                <div>
                                  <p className="text-sm font-semibold text-gray-900">
                                    {method.label}
                                  </p>
                                  <p className="text-xs text-gray-600">{method.description}</p>
                                </div>
                              </div>

                              <div
                                className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                                  isActive
                                    ? 'border-green-700 bg-green-700 text-white'
                                    : 'border-gray-300 bg-white text-transparent'
                                }`}
                              >
                                <CheckCircle2 size={12} />
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    <div className="mt-4">
                      {formData.payment_method === 'momo' && (
                        <div className="rounded-xl bg-white p-4">
                          <div className="mb-3 flex items-center gap-2">
                            <Smartphone size={16} className="text-green-700" />
                            <p className="text-sm font-semibold text-gray-900">
                              Mobile Money details
                            </p>
                          </div>

                          <div className="space-y-3">
                            <div>
                              <label className="mb-1.5 block text-xs font-medium text-gray-700">
                                Phone Number
                              </label>
                              <input
                                type="text"
                                name="momo_phone"
                                value={formData.momo_phone}
                                onChange={handleChange}
                                placeholder="e.g. 0788 000 000"
                                className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-green-700"
                              />
                            </div>

                            <div>
                              <label className="mb-1.5 block text-xs font-medium text-gray-700">
                                Provider
                              </label>
                              <select
                                name="momo_provider"
                                value={formData.momo_provider}
                                onChange={handleChange}
                                className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-green-700"
                              >
                                <option value="mtn">MTN MoMo</option>
                                <option value="airtel">Airtel Money</option>
                              </select>
                            </div>

                            <div>
                              <label className="mb-1.5 block text-xs font-medium text-gray-700">
                                Transaction Reference
                              </label>
                              <input
                                type="text"
                                name="momo_reference"
                                value={formData.momo_reference}
                                onChange={handleChange}
                                placeholder="Optional reference"
                                className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-green-700"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {formData.payment_method === 'card' && (
                        <div className="rounded-xl bg-white p-4">
                          <div className="mb-3 flex items-center gap-2">
                            <CreditCard size={16} className="text-green-700" />
                            <p className="text-sm font-semibold text-gray-900">Card details</p>
                          </div>

                          <div className="space-y-3">
                            <div>
                              <label className="mb-1.5 block text-xs font-medium text-gray-700">
                                Cardholder Name
                              </label>
                              <input
                                type="text"
                                name="card_holder_name"
                                value={formData.card_holder_name}
                                onChange={handleChange}
                                placeholder="Name on card"
                                className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-green-700"
                              />
                            </div>

                            <div>
                              <label className="mb-1.5 block text-xs font-medium text-gray-700">
                                Card Number
                              </label>
                              <input
                                type="text"
                                name="card_number"
                                value={formData.card_number}
                                onChange={handleChange}
                                placeholder="1234 5678 9012 3456"
                                className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-green-700"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="mb-1.5 block text-xs font-medium text-gray-700">
                                  Expiry
                                </label>
                                <input
                                  type="text"
                                  name="card_expiry"
                                  value={formData.card_expiry}
                                  onChange={handleChange}
                                  placeholder="MM/YY"
                                  className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-green-700"
                                />
                              </div>

                              <div>
                                <label className="mb-1.5 block text-xs font-medium text-gray-700">
                                  CVV
                                </label>
                                <input
                                  type="password"
                                  name="card_cvv"
                                  value={formData.card_cvv}
                                  onChange={handleChange}
                                  placeholder="***"
                                  className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-green-700"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {formData.payment_method === 'cash' && (
                        <div className="rounded-xl bg-white p-4">
                          <div className="mb-3 flex items-center gap-2">
                            <Landmark size={16} className="text-green-700" />
                            <p className="text-sm font-semibold text-gray-900">
                              Cash donation details
                            </p>
                          </div>

                          <div className="space-y-3">
                            <div>
                              <label className="mb-1.5 block text-xs font-medium text-gray-700">
                                Payer Name
                              </label>
                              <input
                                type="text"
                                name="cash_payer_name"
                                value={formData.cash_payer_name}
                                onChange={handleChange}
                                placeholder="Person making the cash payment"
                                className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-green-700"
                              />
                            </div>

                            <div>
                              <label className="mb-1.5 block text-xs font-medium text-gray-700">
                                Receipt / Reference
                              </label>
                              <input
                                type="text"
                                name="cash_reference"
                                value={formData.cash_reference}
                                onChange={handleChange}
                                placeholder="Receipt number or note"
                                className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-green-700"
                              />
                            </div>

                            <div>
                              <label className="mb-1.5 block text-xs font-medium text-gray-700">
                                Collection Point
                              </label>
                              <input
                                type="text"
                                name="cash_collection_point"
                                value={formData.cash_collection_point}
                                onChange={handleChange}
                                placeholder="Office or collection location"
                                className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-green-700"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 rounded-xl bg-black p-4 text-white">
                      <div className="flex items-start gap-3">
                        <ShieldCheck size={16} className="mt-0.5 text-green-400" />
                        <div>
                          <p className="text-sm font-semibold">Secure donation flow</p>
                          <p className="mt-1 text-xs leading-6 text-white/70">
                            Your donation is linked to the live project loaded from the backend.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {submitError && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {submitError}
                </div>
              )}

              {submitSuccess && (
                <div className="mt-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                  {submitSuccess}
                </div>
              )}

              <div className="mt-6 flex flex-wrap gap-3">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="min-w-[190px] px-5 py-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <HandCoins size={15} className="mr-2" />
                  {isSubmitting ? 'Submitting...' : 'Submit Donation'}
                </Button>

                <Link to={`/projects/${project.id}`}>
                  <Button variant="outline" className="px-5 py-2.5 text-sm">
                    Return to Project
                  </Button>
                </Link>
              </div>
            </Card>
          </form>

          <div className="space-y-5">
            <Card className="rounded-[24px] p-5">
              <h3 className="text-xl font-bold text-gray-900">Donation summary</h3>

              <div className="mt-4 space-y-3">
                <div className="rounded-xl bg-[#F8F8F6] p-3.5">
                  <p className="text-xs text-gray-500">Project</p>
                  <p className="mt-1 text-sm font-semibold text-gray-900">{project.title}</p>
                </div>

                <div className="rounded-xl bg-[#F8F8F6] p-3.5">
                  <p className="text-xs text-gray-500">Category</p>
                  <p className="mt-1 text-sm font-semibold text-gray-900">{projectCategory}</p>
                </div>

                <div className="rounded-xl bg-[#F8F8F6] p-3.5">
                  <p className="text-xs text-gray-500">Location</p>
                  <p className="mt-1 text-sm font-semibold text-gray-900">
                    {project.location || 'Location not specified'}
                  </p>
                </div>

                <div className="rounded-xl bg-[#F8F8F6] p-3.5">
                  <p className="text-xs text-gray-500">Selected payment</p>
                  <p className="mt-1 text-sm font-semibold capitalize text-gray-900">
                    {formData.payment_method}
                  </p>
                </div>

                <div className="rounded-xl bg-[#F8F8F6] p-3.5">
                  <p className="text-xs text-gray-500">Entered amount</p>
                  <p className="mt-1 text-sm font-semibold text-gray-900">
                    {formData.amount ? formatCurrency(formData.amount) : 'Not set'}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="rounded-[24px] p-5">
              <h3 className="text-xl font-bold text-gray-900">Funding status</h3>

              <div className="mt-4">
                <div className="mb-2 flex items-center justify-between text-xs sm:text-sm">
                  <span className="text-gray-500">Progress</span>
                  <span className="font-semibold text-green-800">
                    {projectProgress.toFixed(2)}%
                  </span>
                </div>

                <div className="h-2.5 rounded-full bg-gray-200">
                  <div
                    className="h-2.5 rounded-full bg-green-800"
                    style={{ width: `${Math.min(projectProgress, 100)}%` }}
                  />
                </div>

                <div className="mt-4 flex items-center justify-between text-xs sm:text-sm">
                  <div>
                    <p className="text-gray-500">Raised</p>
                    <p className="font-semibold text-gray-900">{projectRaised}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-500">Goal</p>
                    <p className="font-semibold text-gray-900">{projectGoal}</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}

export default DonatePage