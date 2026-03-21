import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  MapPin,
  Users,
  CalendarDays,
  BadgeCheck,
  Clock3,
  Mail,
  ArrowRight,
  HeartPulse,
  HandCoins,
  Building2,
  Bell,
  CheckCircle2,
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
  const numeric = Number(value || 0)
  return currencyFormatter.format(Number.isNaN(numeric) ? 0 : numeric)
}

function formatDate(value) {
  if (!value) return 'N/A'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function buildAbsoluteUrl(url) {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) return url

  const base = api.defaults.baseURL || ''
  const origin = base.replace(/\/api\/?$/, '')
  return `${origin}${url.startsWith('/') ? url : `/${url}`}`
}

function getListFromResponse(payload) {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.results)) return payload.results
  return []
}

function getProjectImage(project) {
  return (
    buildAbsoluteUrl(project?.feature_image) ||
    'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1600&q=80'
  )
}

function getPartnerNames(project) {
  if (!project) return []

  if (Array.isArray(project.partners)) {
    return project.partners.map((partner) =>
      typeof partner === 'string' ? partner : partner?.name
    ).filter(Boolean)
  }

  if (Array.isArray(project.partner_details)) {
    return project.partner_details.map((partner) => partner?.name).filter(Boolean)
  }

  return []
}

function getBeneficiaryImages(beneficiary) {
  if (Array.isArray(beneficiary?.images)) return beneficiary.images
  if (Array.isArray(beneficiary?.beneficiary_images)) return beneficiary.beneficiary_images
  return []
}

function getUpdateImages(update) {
  if (Array.isArray(update?.images)) return update.images
  if (Array.isArray(update?.project_update_images)) return update.project_update_images
  return []
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
    text.includes('tree') ||
    text.includes('climate') ||
    text.includes('environment') ||
    text.includes('green')
  ) {
    return 'Environment'
  }

  return 'Community'
}

function getStatusTone(status, isGoalReached) {
  const normalized = String(status || '').toLowerCase()

  if (isGoalReached) {
    return 'bg-emerald-100 text-emerald-800'
  }

  if (normalized.includes('complete') || normalized.includes('completed')) {
    return 'bg-blue-100 text-blue-800'
  }

  if (normalized.includes('pending') || normalized.includes('draft')) {
    return 'bg-amber-100 text-amber-800'
  }

  return 'bg-white/90 text-gray-900'
}

function ProjectDetailsPage() {
  const { projectId } = useParams()

  const [project, setProject] = useState(null)
  const [beneficiaries, setBeneficiaries] = useState([])
  const [updates, setUpdates] = useState([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [error, setError] = useState('')

  const [subscriberName, setSubscriberName] = useState('')
  const [subscriberEmail, setSubscriberEmail] = useState('')
  const [subscribeLoading, setSubscribeLoading] = useState(false)
  const [subscribeMessage, setSubscribeMessage] = useState('')
  const [subscribeError, setSubscribeError] = useState('')

  useEffect(() => {
    let isMounted = true

    async function fetchProjectDetails() {
      setLoading(true)
      setError('')
      setNotFound(false)

      try {
        const projectResponse = await api.get(endpoints.projectDetails(projectId))
        const projectData = projectResponse.data

        const [beneficiariesResponse, updatesResponse] = await Promise.allSettled([
          api.get(endpoints.beneficiaries, {
            params: { project: projectData.id },
          }),
          api.get(endpoints.projectUpdates, {
            params: { project: projectData.id },
          }),
        ])

        const beneficiariesData =
          beneficiariesResponse.status === 'fulfilled'
            ? getListFromResponse(beneficiariesResponse.value.data)
            : []

        const updatesData =
          updatesResponse.status === 'fulfilled'
            ? getListFromResponse(updatesResponse.value.data)
            : []

        const safeBeneficiaries = beneficiariesData.filter(
          (item) =>
            String(item?.project) === String(projectData?.id) ||
            String(item?.project_id) === String(projectData?.id) ||
            String(item?.project?.id) === String(projectData?.id)
        )

        const safeUpdates = updatesData.filter(
          (item) =>
            String(item?.project) === String(projectData?.id) ||
            String(item?.project_id) === String(projectData?.id) ||
            String(item?.project?.id) === String(projectData?.id)
        )

        if (!isMounted) return

        setProject(projectData)
        setBeneficiaries(safeBeneficiaries)
        setUpdates(safeUpdates)
      } catch (err) {
        if (!isMounted) return

        if (err?.response?.status === 404) {
          setNotFound(true)
        } else {
          setError(
            err?.response?.data?.detail ||
              'Failed to load this project. Please try again.'
          )
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchProjectDetails()

    return () => {
      isMounted = false
    }
  }, [projectId])

  const derived = useMemo(() => {
    if (!project) return null

    const title = project.title || 'Untitled Project'
    const description = project.description || 'No description available yet.'
    const image = getProjectImage(project)
    const category = inferCategory(project)
    const partners = getPartnerNames(project)
    const goal = Number(project.target_amount || project.budget || 0)
    const raised = Number(project.total_donated || 0)
    const progress = Math.max(
      0,
      Math.min(100, Number(project.funding_percentage || 0))
    )
    const remaining = Number(project.remaining_amount || Math.max(goal - raised, 0))
    const exceeded = Number(project.exceeded_amount || Math.max(raised - goal, 0))
    const isGoalReached = Boolean(project.is_goal_reached)
    const status = project.status || (isGoalReached ? 'Goal Reached' : 'Active')

    const duration =
      project.start_date && project.end_date
        ? `${formatDate(project.start_date)} - ${formatDate(project.end_date)}`
        : project.start_date
          ? `Starts ${formatDate(project.start_date)}`
          : project.end_date
            ? `Ends ${formatDate(project.end_date)}`
            : 'Timeline not available'

    return {
      title,
      description,
      image,
      category,
      partners,
      goal,
      raised,
      progress,
      remaining,
      exceeded,
      isGoalReached,
      status,
      duration,
      location: project.location || 'Location not specified',
      createdAt: formatDate(project.created_at),
      beneficiariesCount: beneficiaries.length,
      updatesCount: updates.length,
    }
  }, [project, beneficiaries.length, updates.length])

  async function handleSubscribe(event) {
    event.preventDefault()
    setSubscribeMessage('')
    setSubscribeError('')

    if (!project?.id) return

    try {
      setSubscribeLoading(true)

      await api.post(endpoints.subscribeToProject, {
        project: project.id,
        name: subscriberName.trim(),
        email: subscriberEmail.trim(),
      })

      setSubscribeMessage('You have subscribed successfully to project updates.')
      setSubscriberName('')
      setSubscriberEmail('')
    } catch (err) {
      setSubscribeError(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          'Subscription failed. Please check your details and try again.'
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
            <p className="text-2xl font-bold text-gray-900">Loading project...</p>
            <p className="mt-3 text-sm text-gray-600">
              Fetching project details, beneficiaries, and updates.
            </p>
          </Card>
        </section>
      </div>
    )
  }

  if (notFound || !project || !derived) {
    return (
      <div className="bg-[#F8F8F6]">
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <Card className="rounded-[28px] p-10 text-center">
            <p className="text-3xl font-bold text-gray-900">Project not found</p>
            <p className="mt-3 text-sm leading-7 text-gray-600">
              The project you are looking for does not exist or is not available.
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

  if (error) {
    return (
      <div className="bg-[#F8F8F6]">
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <Card className="rounded-[28px] p-10 text-center">
            <p className="text-3xl font-bold text-gray-900">Unable to load project</p>
            <p className="mt-3 text-sm leading-7 text-red-600">{error}</p>
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
                  <span>{derived.beneficiariesCount} beneficiaries stories</span>
                </div>

                <div className="flex items-center gap-2">
                  <CalendarDays size={16} className="text-green-400" />
                  <span>{derived.duration}</span>
                </div>
              </div>

              {derived.partners.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-2">
                  {derived.partners.map((partner) => (
                    <span
                      key={partner}
                      className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-medium text-white/85 backdrop-blur"
                    >
                      {partner}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-[28px] border border-white/10 bg-white/10 p-6 text-white backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-white">
                  <HandCoins size={24} />
                </div>
                <div>
                  <p className="text-sm text-white/70">Funding status</p>
                  <p className="text-2xl font-bold">{Math.round(derived.progress)}% funded</p>
                </div>
              </div>

              <div className="mt-6 h-3 rounded-full bg-white/15">
                <div
                  className="h-3 rounded-full bg-green-500 transition-all duration-500"
                  style={{ width: `${Math.min(100, derived.progress)}%` }}
                />
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="rounded-2xl bg-white/5 p-4">
                  <p className="text-sm text-white/65">Raised</p>
                  <p className="mt-2 text-xl font-bold">{formatCurrency(derived.raised)}</p>
                </div>

                <div className="rounded-2xl bg-white/5 p-4">
                  <p className="text-sm text-white/65">Goal</p>
                  <p className="mt-2 text-xl font-bold">{formatCurrency(derived.goal)}</p>
                </div>

                <div className="rounded-2xl bg-white/5 p-4">
                  <p className="text-sm text-white/65">Remaining</p>
                  <p className="mt-2 text-xl font-bold">{formatCurrency(derived.remaining)}</p>
                </div>

                <div className="rounded-2xl bg-white/5 p-4">
                  <p className="text-sm text-white/65">Updates</p>
                  <p className="mt-2 text-xl font-bold">{derived.updatesCount}</p>
                </div>
              </div>

              {derived.exceeded > 0 && (
                <div className="mt-4 rounded-2xl bg-emerald-500/15 p-4 text-emerald-100">
                  <p className="text-sm font-medium">Exceeded target by</p>
                  <p className="mt-1 text-xl font-bold">
                    {formatCurrency(derived.exceeded)}
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
                title="About this project"
                text={project.description || 'No project overview available yet.'}
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
                  <p className="text-sm text-gray-500">Start date</p>
                  <p className="mt-2 font-semibold text-gray-900">
                    {formatDate(project.start_date)}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#F8F8F6] p-4">
                  <p className="text-sm text-gray-500">End date</p>
                  <p className="mt-2 font-semibold text-gray-900">
                    {formatDate(project.end_date)}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="rounded-[28px] p-7">
              <h2 className="text-3xl font-bold text-gray-900">Funding summary</h2>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="flex gap-3 rounded-2xl bg-[#F8F8F6] p-4">
                  <HandCoins size={20} className="mt-0.5 shrink-0 text-green-700" />
                  <div>
                    <p className="text-sm text-gray-500">Total donated</p>
                    <p className="mt-1 font-semibold text-gray-900">
                      {formatCurrency(project.total_donated)}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 rounded-2xl bg-[#F8F8F6] p-4">
                  <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-green-700" />
                  <div>
                    <p className="text-sm text-gray-500">Goal reached</p>
                    <p className="mt-1 font-semibold text-gray-900">
                      {project.is_goal_reached ? 'Yes' : 'Not yet'}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 rounded-2xl bg-[#F8F8F6] p-4">
                  <CalendarDays size={20} className="mt-0.5 shrink-0 text-green-700" />
                  <div>
                    <p className="text-sm text-gray-500">Target amount</p>
                    <p className="mt-1 font-semibold text-gray-900">
                      {formatCurrency(project.target_amount || project.budget)}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 rounded-2xl bg-[#F8F8F6] p-4">
                  <HeartPulse size={20} className="mt-0.5 shrink-0 text-green-700" />
                  <div>
                    <p className="text-sm text-gray-500">Funding percentage</p>
                    <p className="mt-1 font-semibold text-gray-900">
                      {Number(project.funding_percentage || 0).toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="rounded-[28px] p-7">
              <h2 className="text-3xl font-bold text-gray-900">Beneficiaries</h2>

              {beneficiaries.length === 0 ? (
                <div className="mt-6 rounded-2xl bg-[#F8F8F6] p-5 text-sm text-gray-600">
                  No beneficiary records available for this project yet.
                </div>
              ) : (
                <div className="mt-6 grid gap-5">
                  {beneficiaries.map((beneficiary) => {
                    const images = getBeneficiaryImages(beneficiary)

                    return (
                      <div
                        key={beneficiary.id}
                        className="rounded-[24px] border border-gray-200 bg-white p-5"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900">
                              {beneficiary.name || 'Unnamed beneficiary'}
                            </h3>
                            <p className="mt-3 text-sm leading-7 text-gray-600">
                              {beneficiary.description || 'No beneficiary description available.'}
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
                              <div key={image.id} className="overflow-hidden rounded-[18px]">
                                <img
                                  src={buildAbsoluteUrl(image.image)}
                                  alt={image.caption || beneficiary.name || 'Beneficiary image'}
                                  className="h-48 w-full object-cover"
                                />
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
              <h2 className="text-3xl font-bold text-gray-900">Latest updates</h2>

              {updates.length === 0 ? (
                <div className="mt-6 rounded-2xl bg-[#F8F8F6] p-5 text-sm text-gray-600">
                  No project updates have been published yet.
                </div>
              ) : (
                <div className="mt-8 space-y-6">
                  {updates.map((update, index) => {
                    const images = getUpdateImages(update)

                    return (
                      <div key={update.id || index} className="flex gap-4">
                        <div className="flex w-10 shrink-0 justify-center">
                          <div className="mt-1 h-4 w-4 rounded-full bg-green-700" />
                        </div>

                        <div className="flex-1 border-l border-gray-200 pl-5 pb-6">
                          <p className="text-sm font-medium text-green-800">
                            {formatDate(update.created_at || update.date)}
                          </p>

                          <h3 className="mt-2 text-xl font-semibold text-gray-900">
                            {update.title || 'Project update'}
                          </h3>

                          <p className="mt-3 text-sm leading-7 text-gray-600">
                            {update.description || update.text || 'No update details available.'}
                          </p>

                          {images.length > 0 && (
                            <div className="mt-5 grid gap-4 sm:grid-cols-2">
                              {images.map((image) => (
                                <div key={image.id} className="overflow-hidden rounded-[18px]">
                                  <img
                                    src={buildAbsoluteUrl(image.image)}
                                    alt={image.caption || update.title || 'Project update image'}
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
                  <p className="text-sm text-gray-500">Project budget</p>
                  <p className="mt-2 text-2xl font-bold text-gray-900">
                    {formatCurrency(project.budget)}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#F8F8F6] p-4">
                  <p className="text-sm text-gray-500">Target amount</p>
                  <p className="mt-2 text-2xl font-bold text-gray-900">
                    {formatCurrency(project.target_amount)}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#F8F8F6] p-4">
                  <p className="text-sm text-gray-500">Beneficiary entries</p>
                  <p className="mt-2 text-2xl font-bold text-gray-900">
                    {beneficiaries.length}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#F8F8F6] p-4">
                  <p className="text-sm text-gray-500">Published updates</p>
                  <p className="mt-2 text-2xl font-bold text-gray-900">
                    {updates.length}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="rounded-[28px] p-6">
              <h3 className="text-2xl font-bold text-gray-900">Project organization</h3>

              <div className="mt-6 space-y-5">
                <div className="rounded-2xl bg-[#F8F8F6] p-4">
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="mt-2 font-semibold text-gray-900">{derived.location}</p>
                </div>

                {derived.partners.length > 0 && (
                  <div className="rounded-2xl bg-[#F8F8F6] p-4">
                    <p className="text-sm text-gray-500">Partners</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {derived.partners.map((partner) => (
                        <span
                          key={partner}
                          className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-sm font-medium text-gray-800"
                        >
                          <Building2 size={14} className="text-green-700" />
                          {partner}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <Clock3 size={17} className="text-green-700" />
                  <span>Public project details and impact updates are available here.</span>
                </div>
              </div>
            </Card>

            <Card
              id="subscribe-section"
              className="rounded-[28px] overflow-hidden bg-black text-white"
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
                    Get notified when this project publishes new progress updates.
                  </p>

                  <form onSubmit={handleSubscribe} className="mt-6 space-y-3">
                    <div>
                      <input
                        type="text"
                        value={subscriberName}
                        onChange={(e) => setSubscriberName(e.target.value)}
                        placeholder="Your name"
                        className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/45 outline-none backdrop-blur"
                        required
                      />
                    </div>

                    <div>
                      <input
                        type="email"
                        value={subscriberEmail}
                        onChange={(e) => setSubscriberEmail(e.target.value)}
                        placeholder="Your email"
                        className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/45 outline-none backdrop-blur"
                        required
                      />
                    </div>

                    {subscribeMessage && (
                      <div className="rounded-2xl bg-emerald-500/15 p-3 text-sm text-emerald-200">
                        {subscribeMessage}
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

                      <Link to="/contact">
                        <Button variant="darkOutline" className="w-full">
                          Contact Us
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