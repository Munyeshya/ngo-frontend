import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  HandCoins,
  HeartPulse,
  GraduationCap,
  Users,
  Sprout,
  MapPin,
  CreditCard,
  Smartphone,
  Wallet,
  BadgeDollarSign,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import AnimatedBackground from '../../components/common/AnimatedBackground'

const projects = [
  {
    id: 1,
    slug: 'community-health-outreach',
    title: 'Community Health Outreach',
    category: 'Health',
    location: 'Kigali, Rwanda',
    raised: '$36,000',
    goal: '$50,000',
    progress: 72,
    image:
      'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1600&q=80',
    icon: HeartPulse,
  },
  {
    id: 2,
    slug: 'back-to-school-support',
    title: 'Back to School Support',
    category: 'Education',
    location: 'Huye, Rwanda',
    raised: '$24,000',
    goal: '$50,000',
    progress: 48,
    image:
      'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1600&q=80',
    icon: GraduationCap,
  },
  {
    id: 3,
    slug: 'women-empowerment-initiative',
    title: 'Women Empowerment Initiative',
    category: 'Community',
    location: 'Musanze, Rwanda',
    raised: '$31,500',
    goal: '$50,000',
    progress: 63,
    image:
      'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1600&q=80',
    icon: Users,
  },
  {
    id: 4,
    slug: 'green-village-restoration',
    title: 'Green Village Restoration',
    category: 'Environment',
    location: 'Nyagatare, Rwanda',
    raised: '$40,500',
    goal: '$50,000',
    progress: 81,
    image:
      'https://images.unsplash.com/photo-1492496913980-501348b61469?auto=format&fit=crop&w=1600&q=80',
    icon: Sprout,
  },
]

const paymentMethods = [
  {
    value: 'momo',
    label: 'Mobile Money',
    description: 'Fast and convenient mobile payment',
    icon: Smartphone,
  },
  {
    value: 'card',
    label: 'Card Payment',
    description: 'Visa, Mastercard, and secure card checkout',
    icon: CreditCard,
  },
  {
    value: 'cash',
    label: 'Cash',
    description: 'Offline cash donation recording',
    icon: Wallet,
  },
]

const quickAmounts = [10, 25, 50, 100, 250, 500]

function DonatePage() {
  const { projectId } = useParams()

  const project = useMemo(() => {
    return projects.find(
      (item) => String(item.id) === projectId || item.slug === projectId
    )
  }, [projectId])

  const [formData, setFormData] = useState({
    donor_name: '',
    donor_email: '',
    amount: '',
    payment_method: 'momo',
    message: '',
    is_anonymous: false,
  })

  if (!project) {
    return (
      <div className="bg-[#F8F8F6]">
        <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
          <Card className="rounded-[28px] p-10 text-center">
            <p className="text-3xl font-bold text-gray-900">Project not found</p>
            <p className="mt-3 text-sm leading-7 text-gray-600">
              The project you want to support is not available.
            </p>
            <div className="mt-6">
              <Link to="/projects">
                <Button>Back to Projects</Button>
              </Link>
            </div>
          </Card>
        </section>
      </div>
    )
  }

  const Icon = project.icon

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

  const handleSubmit = (e) => {
    e.preventDefault()

    const payload = {
      project: project.id,
      donor_name: formData.donor_name,
      donor_email: formData.donor_email,
      amount: formData.amount,
      payment_method: formData.payment_method,
      message: formData.message,
      is_anonymous: formData.is_anonymous,
    }

    console.log('Donation payload:', payload)
  }

  return (
    <div className="bg-[#F8F8F6]">
      <section className="relative overflow-hidden bg-black">
        <AnimatedBackground variant="dark" />

        <div className="absolute inset-0">
          <img
            src={project.image}
            alt={project.title}
            className="h-full w-full object-cover opacity-25"
          />
        </div>

        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/50" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
          <Link
            to={`/projects/${project.slug || project.id}`}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-medium text-white/90 backdrop-blur transition hover:bg-white/15"
          >
            <ArrowLeft size={16} />
            Back to Project
          </Link>

          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_420px]">
            <div>
              <span className="inline-flex rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-800">
                {project.category}
              </span>

              <h1 className="mt-5 text-4xl font-bold leading-tight text-white sm:text-5xl">
                Donate to {project.title}
              </h1>

              <div className="mt-5 flex flex-wrap gap-4 text-sm text-white/75">
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-green-400" />
                  <span>{project.location}</span>
                </div>
              </div>

              <p className="mt-6 max-w-2xl text-base leading-8 text-white/70">
                Your contribution supports this project directly and helps move it closer to its
                funding goal.
              </p>
            </div>

            <Card className="rounded-[28px] border border-white/10 bg-white/10 p-6 text-white backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-white">
                  <Icon size={24} />
                </div>
                <div>
                  <p className="text-sm text-white/70">Current progress</p>
                  <p className="text-2xl font-bold">{project.progress}% funded</p>
                </div>
              </div>

              <div className="mt-6 h-3 rounded-full bg-white/15">
                <div
                  className="h-3 rounded-full bg-green-500"
                  style={{ width: `${project.progress}%` }}
                />
              </div>

              <div className="mt-5 flex items-center justify-between text-sm">
                <div>
                  <p className="text-white/65">Raised</p>
                  <p className="font-semibold text-white">{project.raised}</p>
                </div>
                <div className="text-right">
                  <p className="text-white/65">Goal</p>
                  <p className="font-semibold text-white">{project.goal}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <form onSubmit={handleSubmit} className="space-y-8">
            <Card className="rounded-[28px] p-7 sm:p-8">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100 text-green-800">
                  <HandCoins size={22} />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">Complete your donation</h2>
                  <p className="mt-1 text-sm text-gray-600">
                    Fill in your details, choose an amount, and select a payment method.
                  </p>
                </div>
              </div>

              <div className="mt-8 grid gap-8 xl:grid-cols-[1fr_380px]">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Donor information</h3>
                  <p className="mt-2 text-sm text-gray-600">
                    Provide the basic information required for this donation.
                  </p>

                  <div className="mt-6 space-y-5">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="donor_name"
                        value={formData.donor_name}
                        onChange={handleChange}
                        placeholder="Enter your full name"
                        className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none transition focus:border-green-700"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="donor_email"
                        value={formData.donor_email}
                        onChange={handleChange}
                        placeholder="Enter your email address"
                        className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none transition focus:border-green-700"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Message
                      </label>
                      <textarea
                        rows="6"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Write an optional message for this donation"
                        className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none transition focus:border-green-700"
                      />
                    </div>

                    <label className="flex items-start gap-3 rounded-2xl bg-[#F8F8F6] px-4 py-4 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        name="is_anonymous"
                        checked={formData.is_anonymous}
                        onChange={handleChange}
                        className="mt-1 h-4 w-4 rounded border-gray-300 text-green-700 focus:ring-green-700"
                      />
                      <span>
                        Donate anonymously and hide your identity from public-facing donation
                        displays.
                      </span>
                    </label>
                  </div>
                </div>

                <div>
                  <div className="rounded-[24px] border border-gray-200 bg-[#F8F8F6] p-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-green-100 text-green-800">
                        <BadgeDollarSign size={20} />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">Amount & payment</h3>
                        <p className="text-sm text-gray-600">
                          Choose how much and how you want to give.
                        </p>
                      </div>
                    </div>

                    <div className="mt-6">
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Donation Amount
                      </label>
                      <input
                        type="number"
                        name="amount"
                        value={formData.amount}
                        onChange={handleChange}
                        placeholder="Enter amount"
                        className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-green-700"
                      />
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-3">
                      {quickAmounts.map((amount) => (
                        <button
                          key={amount}
                          type="button"
                          onClick={() => handleQuickAmount(amount)}
                          className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                            String(amount) === formData.amount
                              ? 'border-green-700 bg-green-700 text-white'
                              : 'border-gray-200 bg-white text-gray-800 hover:border-green-700 hover:text-green-800'
                          }`}
                        >
                          ${amount}
                        </button>
                      ))}
                    </div>

                    <div className="mt-6">
                      <label className="mb-3 block text-sm font-medium text-gray-700">
                        Payment Method
                      </label>

                      <div className="space-y-3">
                        {paymentMethods.map((method) => {
                          const MethodIcon = method.icon
                          const isActive = formData.payment_method === method.value

                          return (
                            <button
                              key={method.value}
                              type="button"
                              onClick={() => handlePaymentMethodSelect(method.value)}
                              className={`flex w-full items-center justify-between rounded-2xl border px-4 py-4 text-left transition ${
                                isActive
                                  ? 'border-green-700 bg-white shadow-sm'
                                  : 'border-gray-200 bg-white hover:border-green-300'
                              }`}
                            >
                              <div className="flex items-center gap-4">
                                <div
                                  className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                                    isActive
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-gray-100 text-gray-700'
                                  }`}
                                >
                                  <MethodIcon size={22} />
                                </div>

                                <div>
                                  <p className="font-semibold text-gray-900">{method.label}</p>
                                  <p className="text-sm text-gray-600">{method.description}</p>
                                </div>
                              </div>

                              <div
                                className={`flex h-6 w-6 items-center justify-center rounded-full border ${
                                  isActive
                                    ? 'border-green-700 bg-green-700 text-white'
                                    : 'border-gray-300 bg-white text-transparent'
                                }`}
                              >
                                <CheckCircle2 size={14} />
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    <div className="mt-6 rounded-2xl bg-black p-4 text-white">
                      <div className="flex items-start gap-3">
                        <ShieldCheck size={18} className="mt-0.5 text-green-400" />
                        <div>
                          <p className="font-semibold">Secure donation flow</p>
                          <p className="mt-1 text-sm leading-6 text-white/70">
                            Your donation information is prepared for submission using the project,
                            donor name, donor email, amount, payment method, message, and anonymous
                            status fields.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap gap-4">
                <Button type="submit" className="min-w-[220px]">
                  <HandCoins size={16} className="mr-2" />
                  Submit Donation
                </Button>

                <Link to={`/projects/${project.slug || project.id}`}>
                  <Button variant="outline">Return to Project</Button>
                </Link>
              </div>
            </Card>
          </form>

          <div className="space-y-6">
            <Card className="rounded-[28px] p-6">
              <h3 className="text-2xl font-bold text-gray-900">Donation summary</h3>

              <div className="mt-6 space-y-4">
                <div className="rounded-2xl bg-[#F8F8F6] p-4">
                  <p className="text-sm text-gray-500">Project</p>
                  <p className="mt-1 font-semibold text-gray-900">{project.title}</p>
                </div>

                <div className="rounded-2xl bg-[#F8F8F6] p-4">
                  <p className="text-sm text-gray-500">Category</p>
                  <p className="mt-1 font-semibold text-gray-900">{project.category}</p>
                </div>

                <div className="rounded-2xl bg-[#F8F8F6] p-4">
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="mt-1 font-semibold text-gray-900">{project.location}</p>
                </div>

                <div className="rounded-2xl bg-[#F8F8F6] p-4">
                  <p className="text-sm text-gray-500">Selected payment</p>
                  <p className="mt-1 font-semibold capitalize text-gray-900">
                    {formData.payment_method}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="rounded-[28px] p-6">
              <h3 className="text-2xl font-bold text-gray-900">Funding status</h3>

              <div className="mt-6">
                <div className="mb-3 flex items-center justify-between text-sm">
                  <span className="text-gray-500">Progress</span>
                  <span className="font-semibold text-green-800">{project.progress}%</span>
                </div>

                <div className="h-3 rounded-full bg-gray-200">
                  <div
                    className="h-3 rounded-full bg-green-800"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>

                <div className="mt-5 flex items-center justify-between text-sm">
                  <div>
                    <p className="text-gray-500">Raised</p>
                    <p className="font-semibold text-gray-900">{project.raised}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-500">Goal</p>
                    <p className="font-semibold text-gray-900">{project.goal}</p>
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