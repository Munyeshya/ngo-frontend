import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Bell,
  BriefcaseBusiness,
  HandCoins,
  HeartHandshake,
  TrendingUp,
  UserCircle2,
} from 'lucide-react'

import api from '../../api/axios'
import endpoints from '../../api/endpoints'

function unwrapPayload(payload) {
  if (!payload) return payload
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.results)) return payload.results
  if (Array.isArray(payload?.data)) return payload.data
  if (payload?.data && typeof payload.data === 'object') return payload.data
  return payload
}

function normalizeListResponse(payload) {
  const unwrapped = unwrapPayload(payload)

  if (Array.isArray(unwrapped)) return unwrapped
  if (Array.isArray(unwrapped?.results)) return unwrapped.results
  if (Array.isArray(payload?.results)) return payload.results

  return []
}

function formatCurrency(value) {
  const amount = Number(value || 0)

  return new Intl.NumberFormat('en-RW', {
    style: 'currency',
    currency: 'RWF',
    maximumFractionDigits: 0,
  }).format(Number.isNaN(amount) ? 0 : amount)
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

function getStoredUser() {
  try {
    const raw = localStorage.getItem('ngo_user')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function buildDisplayName(user) {
  if (!user) return 'Donor'

  return (
    user.full_name ||
    [user.first_name, user.last_name].filter(Boolean).join(' ').trim() ||
    user.name ||
    user.username ||
    'Donor'
  )
}

function getProjectNameFromInterest(item) {
  return (
    item?.project_title ||
    item?.project_name ||
    item?.project?.title ||
    item?.title ||
    'Subscribed Project'
  )
}

function getProjectIdFromInterest(item) {
  return item?.project?.id || item?.project_id || item?.project || item?.id
}

function DonorDashboardPage() {
  const [profile, setProfile] = useState(getStoredUser())
  const [donations, setDonations] = useState([])
  const [interests, setInterests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function loadDashboard() {
      try {
        setLoading(true)
        setError('')

        const [profileRes, donationsRes, interestsRes] = await Promise.allSettled([
          api.get(endpoints.profile || endpoints.me),
          api.get(endpoints.myDonations),
          api.get(endpoints.myInterests),
        ])

        if (!active) return

        if (profileRes.status === 'fulfilled') {
          const profileData = unwrapPayload(profileRes.value.data)
          setProfile(profileData)

          if (profileData) {
            localStorage.setItem('ngo_user', JSON.stringify(profileData))
          }
        }

        if (donationsRes.status === 'fulfilled') {
          setDonations(normalizeListResponse(donationsRes.value.data))
        } else {
          setDonations([])
        }

        if (interestsRes.status === 'fulfilled') {
          setInterests(normalizeListResponse(interestsRes.value.data))
        } else {
          setInterests([])
        }

        if (
          profileRes.status === 'rejected' &&
          donationsRes.status === 'rejected' &&
          interestsRes.status === 'rejected'
        ) {
          throw new Error('Failed to load donor dashboard.')
        }
      } catch (err) {
        if (!active) return

        setError(
          err?.response?.data?.detail ||
            err?.response?.data?.message ||
            err?.message ||
            'Failed to load donor dashboard.'
        )
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadDashboard()

    return () => {
      active = false
    }
  }, [])

  const stats = useMemo(() => {
    const totalDonations = donations.length
    const totalAmount = donations.reduce((sum, item) => sum + Number(item?.amount || 0), 0)

    const supportedProjects = new Set(
      donations.map((item) => item?.project?.id || item?.project_id || item?.project).filter(Boolean)
    ).size

    const activeSubscriptions = interests.length

    return {
      totalDonations,
      totalAmount,
      supportedProjects,
      activeSubscriptions,
    }
  }, [donations, interests])

  const recentDonations = useMemo(() => {
    return [...donations]
      .sort((a, b) => new Date(b?.created_at || b?.date || 0) - new Date(a?.created_at || a?.date || 0))
      .slice(0, 5)
  }, [donations])

  const recentInterests = useMemo(() => {
    return [...interests]
      .sort((a, b) => new Date(b?.created_at || 0) - new Date(a?.created_at || 0))
      .slice(0, 4)
  }, [interests])

  const displayName = buildDisplayName(profile)

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="rounded-[28px] border border-gray-200 bg-white p-6 sm:p-8">
          <p className="text-2xl font-bold text-gray-900">Loading dashboard...</p>
          <p className="mt-2 text-sm text-gray-500">
            We are preparing your donation summary and project interests.
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-[28px] border border-red-200 bg-white p-6 sm:p-8">
        <p className="text-2xl font-bold text-gray-900">Unable to load dashboard</p>
        <p className="mt-3 text-sm leading-7 text-red-600">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[30px] bg-[#166534] text-white">
        <div className="relative px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
          <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-40 w-40 rounded-full bg-emerald-300/10 blur-3xl" />

          <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-medium text-white/75">Donor Dashboard</p>
              <h2 className="mt-2 text-3xl font-bold sm:text-4xl">
                Welcome back, {displayName}
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-white/80">
                Track your giving journey, review your supported projects, and stay connected to
                the causes you care about.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/projects"
                className="inline-flex items-center justify-center rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-[#166534] transition hover:bg-green-50"
              >
                Browse Projects
              </Link>

              <Link
                to="/donor/donations"
                className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
              >
                View Donations
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[26px] border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div className="rounded-2xl bg-green-100 p-3 text-[#166534]">
              <HandCoins size={20} />
            </div>
            <span className="text-xs font-medium text-gray-400">Summary</span>
          </div>
          <p className="mt-4 text-sm text-gray-500">Total Donations</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">{stats.totalDonations}</p>
        </div>

        <div className="rounded-[26px] border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div className="rounded-2xl bg-emerald-100 p-3 text-[#166534]">
              <TrendingUp size={20} />
            </div>
            <span className="text-xs font-medium text-gray-400">Amount</span>
          </div>
          <p className="mt-4 text-sm text-gray-500">Total Given</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">
            {formatCurrency(stats.totalAmount)}
          </p>
        </div>

        <div className="rounded-[26px] border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div className="rounded-2xl bg-lime-100 p-3 text-[#166534]">
              <BriefcaseBusiness size={20} />
            </div>
            <span className="text-xs font-medium text-gray-400">Projects</span>
          </div>
          <p className="mt-4 text-sm text-gray-500">Supported Projects</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">{stats.supportedProjects}</p>
        </div>

        <div className="rounded-[26px] border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div className="rounded-2xl bg-green-100 p-3 text-[#166534]">
              <Bell size={20} />
            </div>
            <span className="text-xs font-medium text-gray-400">Updates</span>
          </div>
          <p className="mt-4 text-sm text-gray-500">Active Subscriptions</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">{stats.activeSubscriptions}</p>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[28px] border border-gray-200 bg-white p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Recent Donations</h3>
              <p className="mt-1 text-sm text-gray-500">
                Your latest contributions and supported causes.
              </p>
            </div>

            <Link
              to="/donor/donations"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#166534] transition hover:text-[#0F4D27]"
            >
              See all
              <ArrowRight size={16} />
            </Link>
          </div>

          {recentDonations.length === 0 ? (
            <div className="mt-6 rounded-[22px] bg-[#F6F8F4] p-6 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#166534] shadow-sm">
                <HeartHandshake size={24} />
              </div>
              <p className="mt-4 text-lg font-semibold text-gray-900">No donations yet</p>
              <p className="mt-2 text-sm leading-7 text-gray-500">
                Once you donate to a project, your contribution history will appear here.
              </p>
              <Link
                to="/projects"
                className="mt-5 inline-flex items-center justify-center rounded-2xl bg-[#166534] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0F4D27]"
              >
                Explore Projects
              </Link>
            </div>
          ) : (
            <div className="mt-6 overflow-hidden rounded-[22px] border border-gray-200">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-[#F8F8F6]">
                    <tr>
                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">
                        Project
                      </th>
                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">
                        Amount
                      </th>
                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">
                        Payment
                      </th>
                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">
                        Date
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100 bg-white">
                    {recentDonations.map((donation) => (
                      <tr key={donation.id}>
                        <td className="px-5 py-4">
                          <p className="text-sm font-semibold text-gray-900">
                            {donation?.project?.title ||
                              donation?.project_title ||
                              'Project Donation'}
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            {donation?.message || 'Thank you for supporting this cause.'}
                          </p>
                        </td>

                        <td className="px-5 py-4 text-sm font-semibold text-[#166534]">
                          {formatCurrency(donation?.amount)}
                        </td>

                        <td className="px-5 py-4">
                          <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-semibold capitalize text-green-800">
                            {donation?.payment_method || 'N/A'}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-sm text-gray-600">
                          {formatDate(donation?.created_at || donation?.date)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-[28px] border border-gray-200 bg-white p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Subscribed Projects</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Projects you follow for progress updates.
                </p>
              </div>

              <Link
                to="/donor/subscriptions"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#166534] transition hover:text-[#0F4D27]"
              >
                See all
                <ArrowRight size={16} />
              </Link>
            </div>

            {recentInterests.length === 0 ? (
              <div className="mt-6 rounded-[22px] bg-[#F6F8F4] p-6 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#166534] shadow-sm">
                  <Bell size={24} />
                </div>
                <p className="mt-4 text-lg font-semibold text-gray-900">
                  No subscriptions yet
                </p>
                <p className="mt-2 text-sm leading-7 text-gray-500">
                  Subscribe to project updates to stay informed about progress and impact.
                </p>
              </div>
            ) : (
              <div className="mt-6 space-y-3">
                {recentInterests.map((interest) => {
                  const projectId = getProjectIdFromInterest(interest)
                  const projectName = getProjectNameFromInterest(interest)

                  return (
                    <div
                      key={interest.id || `${projectId}-${projectName}`}
                      className="rounded-[22px] border border-gray-200 bg-[#FCFCFB] p-4"
                    >
                      <p className="text-sm font-semibold text-gray-900">{projectName}</p>
                      <p className="mt-1 text-xs text-gray-500">
                        Subscribed on {formatDate(interest?.created_at)}
                      </p>

                      {projectId && (
                        <Link
                          to={`/projects/${projectId}`}
                          className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[#166534] transition hover:text-[#0F4D27]"
                        >
                          View project
                          <ArrowRight size={15} />
                        </Link>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div className="rounded-[28px] border border-gray-200 bg-white p-6">
            <h3 className="text-2xl font-bold text-gray-900">Profile Snapshot</h3>
            <p className="mt-1 text-sm text-gray-500">
              Your current donor account details.
            </p>

            <div className="mt-6 rounded-[22px] bg-[#F8F8F6] p-5">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#166534] text-white">
                  <UserCircle2 size={26} />
                </div>

                <div className="min-w-0">
                  <p className="truncate text-lg font-bold text-gray-900">{displayName}</p>
                  <p className="truncate text-sm text-gray-500">
                    {profile?.email || 'No email available'}
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-white p-4">
                  <p className="text-xs text-gray-500">Role</p>
                  <p className="mt-1 text-sm font-semibold capitalize text-gray-900">
                    {profile?.role || 'donor'}
                  </p>
                </div>

                <div className="rounded-2xl bg-white p-4">
                  <p className="text-xs text-gray-500">Subscriptions</p>
                  <p className="mt-1 text-sm font-semibold text-gray-900">
                    {stats.activeSubscriptions}
                  </p>
                </div>
              </div>

              <Link
                to="/donor/profile"
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#166534] transition hover:text-[#0F4D27]"
              >
                Manage profile
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default DonorDashboardPage