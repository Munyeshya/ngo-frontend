import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  MapPin,
  Users,
  HandCoins,
  CalendarDays,
  BadgeCheck,
  Clock3,
  Bell,
  ArrowRight,
  Building2,
  Image as ImageIcon,
  FileText,
  CheckCircle2,
  AlertCircle,
  Landmark,
  Target,
} from 'lucide-react'

import api from '../../api/axios'
import endpoints from '../../api/endpoints'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import AnimatedBackground from '../../components/common/AnimatedBackground'
import SectionTitle from '../../components/common/SectionTitle'

const currencyFormatter = new Intl.NumberFormat('en-RW', {
  style: 'currency',
  currency: 'RWF',
  maximumFractionDigits: 0,
})

function formatCurrency(value) {
  const amount = Number(value || 0)
  return currencyFormatter.format(Number.isNaN(amount) ? 0 : amount)
}

function formatDate(value) {
  if (!value) return 'N/A'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function normalizeListResponse(payload) {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.results)) return payload.results
  return []
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

function getStatusTone(status, isGoalReached) {
  const normalized = String(status || '').toLowerCase()

  if (isGoalReached) return 'bg-emerald-100 text-emerald-800'
  if (normalized.includes('completed')) return 'bg-blue-100 text-blue-800'
  if (normalized.includes('paused')) return 'bg-amber-100 text-amber-800'
  if (normalized.includes('draft')) return 'bg-slate-200 text-slate-800'

  return 'bg-white/90 text-gray-900'
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

function extractBeneficiaryImages(beneficiary) {
  if (Array.isArray(beneficiary?.images)) return beneficiary.images
  if (Array.isArray(beneficiary?.beneficiary_images)) return beneficiary.beneficiary_images
  return []
}

function extractUpdateImages(update) {
  if (Array.isArray(update?.images)) return update.images
  if (Array.isArray(update?.project_update_images)) return update.project_update_images
  return []
}

function ProjectDetailsPage() {
  const { projectId } = useParams()

  const [project, setProject] = useState(null)
  const [partners, setPartners] = useState([])
  const [beneficiaries, setBeneficiaries] = useState([])
  const [updates, setUpdates] = useState([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notFound, setNotFound] = useState(false)

  const [subscriberName, setSubscriberName] = useState('')
  const [subscriberEmail, setSubscriberEmail] = useState('')
  const [subscribeLoading, setSubscribeLoading] = useState(false)
  const [subscribeSuccess, setSubscribeSuccess] = useState('')
  const [subscribeError, setSubscribeError] = useState('')

  useEffect(() => {
    let active = true

    async function loadProjectPage() {
      try {
        setLoading(true)
        setError('')
        setNotFound(false)

        const [projectRes, beneficiariesRes, updatesRes] = await Promise.all([
          api.get(endpoints.projectDetails(projectId)),
          api.get(endpoints.beneficiaries, {
            params: { project: projectId },
          }),
          api.get(endpoints.projectUpdates, {
            params: { project: projectId },
          }),
        ])

        if (!active) return

        const projectData = projectRes.data
        const beneficiariesData = normalizeListResponse(beneficiariesRes.data)
        const updatesData = normalizeListResponse(updatesRes.data)

        setProject(projectData)
        setBeneficiaries(beneficiariesData)
        setUpdates(updatesData)

        if (Array.isArray(projectData?.partner_details)) {
          setPartners(projectData.partner_details)
        } else if (Array.isArray(projectData?.partners) && projectData.partners.length > 0) {
          const partnerResponses = await Promise.all(
            projectData.partners.map((partnerId) =>
              api.get(endpoints.partnerDetails(partnerId))
            )
          )

          if (!active) return
          setPartners(partnerResponses.map((response) => response.data))
        } else {
          setPartners([])
        }
      } catch (err) {
        if (!active) return

        if (err?.response?.status === 404) {
          setNotFound(true)
        } else {
          setError(
            err?.response?.data?.detail ||
              'Failed to load project details. Please try again.'
          )
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    loadProjectPage()

    return () => {
      active = false
    }
  }, [projectId])

  const derived = useMemo(() => {
    if (!project) return null

    const targetAmount = Number(project.target_amount || 0)
    const budget = Number(project.budget || 0)
    const totalDonated = Number(project.total_donated || 0)
    const fundingPercentage = Math.max(
      0,
      Math.min(100, Number(project.funding_percentage || 0))
    )
    const remainingAmount = Number(project.remaining_amount || 0)
    const exceededAmount = Number(project.exceeded_amount || 0)
    const isGoalReached = Boolean(project.is_goal_reached)

    const timeline =
      project.start_date && project.end_date
        ? `${formatDate(project.start_date)} - ${formatDate(project.end_date)}`
        : project.start_date
          ? `Starts ${formatDate(project.start_date)}`
          : project.end_date
            ? `Ends ${formatDate(project.end_date)}`
            : 'Timeline not available'

    const allBeneficiaryImages = beneficiaries.flatMap((beneficiary) =>
      extractBeneficiaryImages(beneficiary)
    )
    const allUpdateImages = updates.flatMap((update) => extractUpdateImages(update))

    return {
      title: project.title || 'Untitled project',
      description: project.description || 'No project description available yet.',
      image: getProjectImage(project),
      category: inferCategory(project),
      status: project.status || 'Active',
      location: project.location || 'Location not specified',
      targetAmount,
      budget,
      totalDonated,
      fundingPercentage,
      remainingAmount,
      exceededAmount,
      isGoalReached,
      timeline,
      createdAt: formatDate(project.created_at),
      updatedAt: formatDate(project.updated_at),
      beneficiariesCount: beneficiaries.length,
      updatesCount: updates.length,
      partnerCount: partners.length,
      beneficiaryImageCount: allBeneficiaryImages.length,
      updateImageCount: allUpdateImages.length,
    }
  }, [project, beneficiaries, updates, partners])

  async function handleSubscribe(event) {
    event.preventDefault()

    if (!project?.id) return

    setSubscribeSuccess('')
    setSubscribeError('')
    setSubscribeLoading(true)

    try {
      await api.post(endpoints.subscribeToProject, {
        project: project.id,
        name: subscriberName.trim(),
        email: subscriberEmail.trim(),
      })

      setSubscribeSuccess('You have subscribed successfully to project updates.')
      setSubscriberName('')
      setSubscriberEmail('')
    } catch (err) {
      setSubscribeError(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          'Subscription failed. Please check the information and try again.'
      )
    } finally {
      setSubscribeLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-[#F8F8F6]">
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <Card className="rounded-[28px] p-10">
            <p className="text-3xl font-bold text-gray-900">Loading project...</p>
            <p className="mt-3 text-sm leading-7 text-gray-600">
              Fetching project details, partners, beneficiaries, and public updates.
            </p>
          </Card>
        </section>
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="bg-[#F8F8F6]">
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <Card className="rounded-[28px] p-10 text-center">
            <p className="text-3xl font-bold text-gray-900">Project not found</p>
            <p className="mt-3 text-sm leading-7 text-gray-600">
              The requested project does not exist or is no longer available.
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

  if (error || !project || !derived) {
    return (
      <div className="bg-[#F8F8F6]">
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <Card className="rounded-[28px] p-10 text-center">
            <p className="text-3xl font-bold text-gray-900">Unable to load project</p>
            <p className="mt-3 text-sm leading-7 text-red-600">
              {error || 'Something went wrong while loading the project.'}
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

  return (
    <div className="bg-[#F8F8F6]">
      <section className="relative overflow-hidden bg-black">
        <AnimatedBackground variant="dark" />

        <div className="absolute inset-0">
          <img
            src={derived.image}
            alt={derived.title}
            className="h-full w-full object-cover opacity-30"
          />
        </div>

        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/45" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <Link
            to="/projects"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-medium text-white/90 backdrop-blur transition hover:bg-white/15"
          >
            <ArrowLeft size={16} />
            Back to Projects
          </Link>

          <div className="mt-8 grid items-end gap-8 lg:grid-cols-[1.08fr_0.92fr]">
            <div>
              <div className="flex flex-wrap gap-3">
                <span className="rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-800">
                  {derived.category}
                </span>

                <span
                  className={`rounded-full px-4 py-2 text-sm font-semibold ${getStatusTone(
                    derived.status,
                    derived.isGoalReached
                  )}`}
                >
                  {derived.status}
                </span>

                {derived.isGoalReached && (
                  <span className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-800">
                    Goal Reached
                  </span>
                )}
              </div>

              <h1 className="mt-6 max-w-4xl text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
                {derived.title}
              </h1>

              <p className="mt-5 max-w-3xl text-base leading-8 text-white/70 sm:text-lg">
                {derived.description}
              </p>

              <div className="mt-7 flex flex-wrap gap-5 text-sm text-white/75">
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-green-400" />
                  <span>{derived.location}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Users size={16} className="text-green-400" />
                  <span>{derived.beneficiariesCount} beneficiaries</span>
                </div>

                <div className="flex items-center gap-2">
                  <CalendarDays size={16} className="text-green-400" />
                  <span>{derived.timeline}</span>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-white/10 p-6 text-white backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-white">
                  <HandCoins size={24} />
                </div>
                <div>
                  <p className="text-sm text-white/70">Funding status</p>
                  <p className="text-2xl font-bold">
                    {Math.round(derived.fundingPercentage)}% funded
                  </p>
                </div>
              </div>

              <div className="mt-6 h-3 rounded-full bg-white/15">
                <div
                  className="h-3 rounded-full bg-green-500 transition-all duration-500"
                  style={{ width: `${derived.fundingPercentage}%` }}
                />
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="rounded-2xl bg-white/5 p-4">
                  <p className="text-sm text-white/65">Raised</p>
                  <p className="mt-2 text-xl font-bold">
                    {formatCurrency(derived.totalDonated)}
                  </p>
                </div>

                <div className="rounded-2xl bg-white/5 p-4">
                  <p className="text-sm text-white/65">Target</p>
                  <p className="mt-2 text-xl font-bold">
                    {formatCurrency(derived.targetAmount)}
                  </p>
                </div>

                <div className="rounded-2xl bg-white/5 p-4">
                  <p className="text-sm text-white/65">Remaining</p>
                  <p className="mt-2 text-xl font-bold">
                    {formatCurrency(derived.remainingAmount)}
                  </p>
                </div>

                <div className="rounded-2xl bg-white/5 p-4">
                  <p className="text-sm text-white/65">Updates</p>
                  <p className="mt-2 text-xl font-bold">{derived.updatesCount}</p>
                </div>
              </div>

              {derived.exceededAmount > 0 && (
                <div className="mt-4 rounded-2xl bg-emerald-500/15 p-4 text-emerald-100">
                  <p className="text-sm font-medium">Exceeded target by</p>
                  <p className="mt-1 text-xl font-bold">
                    {formatCurrency(derived.exceededAmount)}
                  </p>
                </div>
              )}

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <Link to={`/donate/${project.id}`}>
                  <Button className="w-full">Donate Now</Button>
                </Link>

                <a href="#subscribe-section" className="block">
                  <Button variant="darkOutline" className="w-full">
                    Subscribe
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-8">
            <Card className="rounded-[28px] p-7">
              <SectionTitle
                badge="Project overview"
                title="Everything about this project"
                text="This page combines all public project information available from the backend."
              />

              <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl bg-[#F8F8F6] p-4">
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="mt-2 font-semibold text-gray-900">{derived.status}</p>
                </div>

                <div className="rounded-2xl bg-[#F8F8F6] p-4">
                  <p className="text-sm text-gray-500">Created</p>
                  <p className="mt-2 font-semibold text-gray-900">{derived.createdAt}</p>
                </div>

                <div className="rounded-2xl bg-[#F8F8F6] p-4">
                  <p className="text-sm text-gray-500">Last updated</p>
                  <p className="mt-2 font-semibold text-gray-900">{derived.updatedAt}</p>
                </div>

                <div className="rounded-2xl bg-[#F8F8F6] p-4">
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="mt-2 font-semibold text-gray-900">{derived.location}</p>
                </div>
              </div>

              <div className="mt-8 rounded-[24px] bg-[#F8F8F6] p-5">
                <h3 className="text-xl font-semibold text-gray-900">Description</h3>
                <p className="mt-3 text-sm leading-7 text-gray-700">
                  {project.description || 'No project description available yet.'}
                </p>
              </div>
            </Card>

            <Card className="rounded-[28px] p-7">
              <h2 className="text-3xl font-bold text-gray-900">Funding summary</h2>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="flex gap-3 rounded-2xl bg-[#F8F8F6] p-4">
                  <Landmark size={20} className="mt-0.5 shrink-0 text-green-700" />
                  <div>
                    <p className="text-sm text-gray-500">Budget</p>
                    <p className="mt-1 font-semibold text-gray-900">
                      {formatCurrency(derived.budget)}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 rounded-2xl bg-[#F8F8F6] p-4">
                  <Target size={20} className="mt-0.5 shrink-0 text-green-700" />
                  <div>
                    <p className="text-sm text-gray-500">Target amount</p>
                    <p className="mt-1 font-semibold text-gray-900">
                      {formatCurrency(derived.targetAmount)}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 rounded-2xl bg-[#F8F8F6] p-4">
                  <HandCoins size={20} className="mt-0.5 shrink-0 text-green-700" />
                  <div>
                    <p className="text-sm text-gray-500">Total donated</p>
                    <p className="mt-1 font-semibold text-gray-900">
                      {formatCurrency(derived.totalDonated)}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 rounded-2xl bg-[#F8F8F6] p-4">
                  <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-green-700" />
                  <div>
                    <p className="text-sm text-gray-500">Goal reached</p>
                    <p className="mt-1 font-semibold text-gray-900">
                      {derived.isGoalReached ? 'Yes' : 'Not yet'}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 rounded-2xl bg-[#F8F8F6] p-4">
                  <BadgeCheck size={20} className="mt-0.5 shrink-0 text-green-700" />
                  <div>
                    <p className="text-sm text-gray-500">Funding percentage</p>
                    <p className="mt-1 font-semibold text-gray-900">
                      {Number(derived.fundingPercentage).toFixed(1)}%
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 rounded-2xl bg-[#F8F8F6] p-4">
                  <AlertCircle size={20} className="mt-0.5 shrink-0 text-green-700" />
                  <div>
                    <p className="text-sm text-gray-500">Exceeded amount</p>
                    <p className="mt-1 font-semibold text-gray-900">
                      {formatCurrency(derived.exceededAmount)}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="rounded-[28px] p-7">
              <h2 className="text-3xl font-bold text-gray-900">Project timeline and records</h2>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-gray-200 bg-white p-5">
                  <p className="text-sm text-gray-500">Start date</p>
                  <p className="mt-2 font-semibold text-gray-900">
                    {formatDate(project.start_date)}
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-5">
                  <p className="text-sm text-gray-500">End date</p>
                  <p className="mt-2 font-semibold text-gray-900">
                    {formatDate(project.end_date)}
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-5">
                  <p className="text-sm text-gray-500">Beneficiary records</p>
                  <p className="mt-2 font-semibold text-gray-900">
                    {derived.beneficiariesCount}
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-5">
                  <p className="text-sm text-gray-500">Public updates</p>
                  <p className="mt-2 font-semibold text-gray-900">{derived.updatesCount}</p>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-5">
                  <p className="text-sm text-gray-500">Beneficiary images</p>
                  <p className="mt-2 font-semibold text-gray-900">
                    {derived.beneficiaryImageCount}
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-5">
                  <p className="text-sm text-gray-500">Update images</p>
                  <p className="mt-2 font-semibold text-gray-900">
                    {derived.updateImageCount}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="rounded-[28px] p-7">
              <h2 className="text-3xl font-bold text-gray-900">Partners</h2>

              {partners.length === 0 ? (
                <div className="mt-6 rounded-2xl bg-[#F8F8F6] p-5 text-sm text-gray-600">
                  No partner information is attached to this project yet.
                </div>
              ) : (
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {partners.map((partner) => (
                    <div
                      key={partner.id || partner.name}
                      className="rounded-[24px] border border-gray-200 bg-white p-5"
                    >
                      <div className="flex items-start gap-4">
                        {partner.logo ? (
                          <img
                            src={buildMediaUrl(partner.logo)}
                            alt={partner.name || 'Partner logo'}
                            className="h-16 w-16 rounded-2xl object-cover"
                          />
                        ) : (
                          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F8F8F6] text-green-700">
                            <Building2 size={24} />
                          </div>
                        )}

                        <div className="min-w-0 flex-1">
                          <h3 className="text-xl font-semibold text-gray-900">
                            {partner.name || 'Unnamed partner'}
                          </h3>

                          {partner.website && (
                            <a
                              href={partner.website}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-2 inline-block text-sm font-medium text-green-700 hover:underline"
                            >
                              Visit website
                            </a>
                          )}
                        </div>
                      </div>

                      {partner.description && (
                        <p className="mt-4 text-sm leading-7 text-gray-600">
                          {partner.description}
                        </p>
                      )}

                      <div className="mt-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            partner.is_active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {partner.is_active ? 'Active partner' : 'Inactive partner'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card className="rounded-[28px] p-7">
              <h2 className="text-3xl font-bold text-gray-900">Beneficiaries and impact stories</h2>

              {beneficiaries.length === 0 ? (
                <div className="mt-6 rounded-2xl bg-[#F8F8F6] p-5 text-sm text-gray-600">
                  No beneficiary records are available for this project yet.
                </div>
              ) : (
                <div className="mt-6 grid gap-5">
                  {beneficiaries.map((beneficiary) => {
                    const images = extractBeneficiaryImages(beneficiary)

                    return (
                      <div
                        key={beneficiary.id}
                        className="rounded-[24px] border border-gray-200 bg-white p-5"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div className="max-w-3xl">
                            <h3 className="text-xl font-semibold text-gray-900">
                              {beneficiary.name || 'Unnamed beneficiary'}
                            </h3>

                            <p className="mt-3 text-sm leading-7 text-gray-600">
                              {beneficiary.description ||
                                'No beneficiary description available.'}
                            </p>
                          </div>

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              beneficiary.is_active
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {beneficiary.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>

                        {images.length > 0 && (
                          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {images.map((image) => (
                              <div
                                key={image.id || image.image}
                                className="overflow-hidden rounded-[20px]"
                              >
                                <img
                                  src={buildMediaUrl(image.image)}
                                  alt={image.caption || beneficiary.name || 'Beneficiary image'}
                                  className="h-52 w-full object-cover"
                                />
                                {image.caption && (
                                  <p className="mt-2 text-xs text-gray-500">{image.caption}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </Card>

            <Card className="rounded-[28px] p-7">
              <h2 className="text-3xl font-bold text-gray-900">Latest project updates</h2>

              {updates.length === 0 ? (
                <div className="mt-6 rounded-2xl bg-[#F8F8F6] p-5 text-sm text-gray-600">
                  No public project updates have been published yet.
                </div>
              ) : (
                <div className="mt-8 space-y-6">
                  {updates.map((update, index) => {
                    const images = extractUpdateImages(update)

                    return (
                      <div key={update.id || index} className="flex gap-4">
                        <div className="flex w-10 shrink-0 justify-center">
                          <div className="mt-1 h-4 w-4 rounded-full bg-green-700" />
                        </div>

                        <div className="flex-1 border-l border-gray-200 pb-6 pl-5">
                          <p className="text-sm font-medium text-green-800">
                            {formatDate(update.created_at || update.date)}
                          </p>

                          <h3 className="mt-2 text-xl font-semibold text-gray-900">
                            {update.title || 'Project update'}
                          </h3>

                          <p className="mt-3 text-sm leading-7 text-gray-600">
                            {update.description ||
                              update.text ||
                              'No update description available.'}
                          </p>

                          {images.length > 0 && (
                            <div className="mt-5 grid gap-4 sm:grid-cols-2">
                              {images.map((image) => (
                                <div
                                  key={image.id || image.image}
                                  className="overflow-hidden rounded-[20px]"
                                >
                                  <img
                                    src={buildMediaUrl(image.image)}
                                    alt={image.caption || update.title || 'Update image'}
                                    className="h-56 w-full object-cover"
                                  />
                                  {image.caption && (
                                    <p className="mt-2 text-xs text-gray-500">{image.caption}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </Card>
          </div>

          <div className="space-y-8">
            <Card className="rounded-[28px] p-6">
              <h3 className="text-2xl font-bold text-gray-900">Quick stats</h3>

              <div className="mt-6 grid gap-4">
                <div className="rounded-2xl bg-[#F8F8F6] p-4">
                  <p className="text-sm text-gray-500">Partners</p>
                  <p className="mt-2 text-2xl font-bold text-gray-900">
                    {derived.partnerCount}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#F8F8F6] p-4">
                  <p className="text-sm text-gray-500">Beneficiaries</p>
                  <p className="mt-2 text-2xl font-bold text-gray-900">
                    {derived.beneficiariesCount}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#F8F8F6] p-4">
                  <p className="text-sm text-gray-500">Updates</p>
                  <p className="mt-2 text-2xl font-bold text-gray-900">
                    {derived.updatesCount}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#F8F8F6] p-4">
                  <p className="text-sm text-gray-500">Funding progress</p>
                  <p className="mt-2 text-2xl font-bold text-gray-900">
                    {Math.round(derived.fundingPercentage)}%
                  </p>
                </div>
              </div>
            </Card>

            <Card className="rounded-[28px] p-6">
              <h3 className="text-2xl font-bold text-gray-900">Available public data</h3>

              <div className="mt-6 space-y-4">
                <div className="flex items-start gap-3 text-sm text-gray-700">
                  <FileText size={17} className="mt-0.5 text-green-700" />
                  <span>Project profile, status, location, budget, target, and dates</span>
                </div>

                <div className="flex items-start gap-3 text-sm text-gray-700">
                  <HandCoins size={17} className="mt-0.5 text-green-700" />
                  <span>Funding totals and computed fundraising progress</span>
                </div>

                <div className="flex items-start gap-3 text-sm text-gray-700">
                  <Building2 size={17} className="mt-0.5 text-green-700" />
                  <span>Partner information attached to the project</span>
                </div>

                <div className="flex items-start gap-3 text-sm text-gray-700">
                  <Users size={17} className="mt-0.5 text-green-700" />
                  <span>Beneficiary records and narrative impact stories</span>
                </div>

                <div className="flex items-start gap-3 text-sm text-gray-700">
                  <ImageIcon size={17} className="mt-0.5 text-green-700" />
                  <span>Beneficiary and update images when available</span>
                </div>

                <div className="flex items-start gap-3 text-sm text-gray-700">
                  <Clock3 size={17} className="mt-0.5 text-green-700" />
                  <span>Public progress updates over time</span>
                </div>
              </div>
            </Card>

            <Card
              id="subscribe-section"
              className="overflow-hidden rounded-[28px] bg-black text-white"
            >
              <div className="relative overflow-hidden p-6">
                <AnimatedBackground variant="dark" />

                <div className="relative z-10">
                  <p className="text-sm uppercase tracking-[0.18em] text-green-300">
                    Stay informed
                  </p>

                  <h3 className="mt-3 text-2xl font-bold">
                    Subscribe for project updates
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-white/70">
                    Receive future progress updates for this project by email.
                  </p>

                  <form onSubmit={handleSubscribe} className="mt-6 space-y-3">
                    <input
                      type="text"
                      value={subscriberName}
                      onChange={(e) => setSubscriberName(e.target.value)}
                      placeholder="Your name"
                      className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/45 outline-none backdrop-blur"
                      required
                    />

                    <input
                      type="email"
                      value={subscriberEmail}
                      onChange={(e) => setSubscriberEmail(e.target.value)}
                      placeholder="Your email"
                      className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/45 outline-none backdrop-blur"
                      required
                    />

                    {subscribeSuccess && (
                      <div className="rounded-2xl bg-emerald-500/15 p-3 text-sm text-emerald-200">
                        {subscribeSuccess}
                      </div>
                    )}

                    {subscribeError && (
                      <div className="rounded-2xl bg-red-500/15 p-3 text-sm text-red-200">
                        {subscribeError}
                      </div>
                    )}

                    <div className="grid gap-3">
                      <Button className="w-full" type="submit" disabled={subscribeLoading}>
                        <Bell size={16} className="mr-2" />
                        {subscribeLoading ? 'Subscribing...' : 'Subscribe for Updates'}
                      </Button>

                      <Link to={`/donate/${project.id}`}>
                        <Button variant="darkOutline" className="w-full">
                          Donate Now <ArrowRight size={16} className="ml-2" />
                        </Button>
                      </Link>

                      <Link to="/projects">
                        <Button variant="darkOutline" className="w-full">
                          Explore More Projects
                        </Button>
                      </Link>
                    </div>
                  </form>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}

export default ProjectDetailsPage