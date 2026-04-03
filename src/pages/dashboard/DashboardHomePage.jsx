import { useEffect, useMemo, useState } from 'react'
import {
  ArrowRight,
  CalendarDays,
  FolderKanban,
  HandCoins,
  Handshake,
  HeartHandshake,
  TrendingUp,
  UserCheck,
  Users,
} from 'lucide-react'
import { Link } from 'react-router-dom'

import api from '../../api/axios'
import endpoints from '../../api/endpoints'
import Card from '../../components/ui/Card'
import { getUser } from '../../utils/storage'

const TYPE_COLORS = ['#166534', '#15803d', '#65a30d', '#0f766e']

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
  if (Array.isArray(payload?.data?.results)) return payload.data.results
  return []
}

function getCountFromResponse(payload, fallbackArray = []) {
  if (typeof payload?.count === 'number') return payload.count
  if (typeof payload?.data?.count === 'number') return payload.data.count
  return fallbackArray.length
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

function getProjectName(donation) {
  return donation?.project_title || donation?.project?.title || 'Project Donation'
}

function getDonationDate(donation) {
  return donation?.donated_at || donation?.created_at || donation?.date || null
}

function StatCard({ icon: Icon, label, title, value, accent = 'green', subtext = '' }) {
  const tone =
    accent === 'amber'
      ? 'bg-amber-100 text-amber-800'
      : accent === 'lime'
      ? 'bg-lime-100 text-green-800'
      : 'bg-green-100 text-green-800'

  return (
    <Card className="rounded-[24px] p-4">
      <div className="flex items-start justify-between">
        <div className={`rounded-2xl p-3 ${tone}`}>
          <Icon size={20} />
        </div>
        <span className="text-xs font-medium text-gray-400">{label}</span>
      </div>
      <p className="mt-4 text-sm text-gray-500">{title}</p>
      <p className="mt-2 text-[1.7rem] font-bold text-gray-900">{value}</p>
      {subtext ? <p className="mt-2 text-sm font-medium text-green-800">{subtext}</p> : null}
    </Card>
  )
}

function DashboardHomePage() {
  const currentUser = getUser()
  const isAdmin = String(currentUser?.role || '').toLowerCase() === 'admin'
  const [projects, setProjects] = useState([])
  const [donations, setDonations] = useState([])
  const [beneficiaries, setBeneficiaries] = useState([])
  const [updates, setUpdates] = useState([])
  const [users, setUsers] = useState([])
  const [partners, setPartners] = useState([])
  const [typeSupportAnalytics, setTypeSupportAnalytics] = useState({ months: [], series: [] })
  const [projectsCount, setProjectsCount] = useState(0)
  const [donationsCount, setDonationsCount] = useState(0)
  const [beneficiariesCount, setBeneficiariesCount] = useState(0)
  const [updatesCount, setUpdatesCount] = useState(0)
  const [usersCount, setUsersCount] = useState(0)
  const [partnersCount, setPartnersCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function loadDashboard() {
      try {
        setLoading(true)
        setError('')

        const requests = [
          api.get(endpoints.projects),
          api.get(endpoints.donations),
          api.get(endpoints.beneficiaries),
          api.get(endpoints.projectUpdates),
        ]

        if (isAdmin) {
          requests.push(api.get(endpoints.users))
          requests.push(api.get(endpoints.partners))
          requests.push(api.get(endpoints.donationTypeSupportAnalytics))
        }

        const results = await Promise.allSettled(requests)
        if (!active) return

        const [
          projectsRes,
          donationsRes,
          beneficiariesRes,
          updatesRes,
          usersRes,
          partnersRes,
          analyticsRes,
        ] =
          results

        if (projectsRes.status === 'fulfilled') {
          const list = normalizeListResponse(projectsRes.value.data)
          setProjects(list)
          setProjectsCount(getCountFromResponse(projectsRes.value.data, list))
        } else {
          setProjects([])
          setProjectsCount(0)
        }

        if (donationsRes.status === 'fulfilled') {
          const list = normalizeListResponse(donationsRes.value.data)
          setDonations(list)
          setDonationsCount(getCountFromResponse(donationsRes.value.data, list))
        } else {
          setDonations([])
          setDonationsCount(0)
        }

        if (beneficiariesRes.status === 'fulfilled') {
          const list = normalizeListResponse(beneficiariesRes.value.data)
          setBeneficiaries(list)
          setBeneficiariesCount(getCountFromResponse(beneficiariesRes.value.data, list))
        } else {
          setBeneficiaries([])
          setBeneficiariesCount(0)
        }

        if (updatesRes.status === 'fulfilled') {
          const list = normalizeListResponse(updatesRes.value.data)
          setUpdates(list)
          setUpdatesCount(getCountFromResponse(updatesRes.value.data, list))
        } else {
          setUpdates([])
          setUpdatesCount(0)
        }

        if (isAdmin && usersRes?.status === 'fulfilled') {
          const list = normalizeListResponse(usersRes.value.data)
          setUsers(list)
          setUsersCount(getCountFromResponse(usersRes.value.data, list))
        } else {
          setUsers([])
          setUsersCount(0)
        }

        if (isAdmin && partnersRes?.status === 'fulfilled') {
          const list = normalizeListResponse(partnersRes.value.data)
          setPartners(list)
          setPartnersCount(getCountFromResponse(partnersRes.value.data, list))
        } else {
          setPartners([])
          setPartnersCount(0)
        }

        if (isAdmin && analyticsRes?.status === 'fulfilled') {
          const analytics = analyticsRes.value?.data?.data || analyticsRes.value?.data || {}
          setTypeSupportAnalytics({
            months: Array.isArray(analytics?.months) ? analytics.months : [],
            series: Array.isArray(analytics?.series) ? analytics.series : [],
          })
        } else {
          setTypeSupportAnalytics({ months: [], series: [] })
        }

        if (
          projectsRes.status === 'rejected' &&
          donationsRes.status === 'rejected' &&
          beneficiariesRes.status === 'rejected' &&
          updatesRes.status === 'rejected'
        ) {
          throw new Error('Failed to load dashboard data.')
        }
      } catch (err) {
        if (!active) return
        setError(
          err?.response?.data?.detail ||
            err?.response?.data?.message ||
            err?.message ||
            'Failed to load dashboard data.'
        )
      } finally {
        if (active) setLoading(false)
      }
    }

    loadDashboard()
    return () => {
      active = false
    }
  }, [isAdmin])

  const totalDonationAmount = useMemo(
    () => donations.reduce((sum, item) => sum + Number(item?.amount || 0), 0),
    [donations]
  )

  const activeProjectsCount = useMemo(
    () =>
      projects.filter((project) => String(project?.status || '').toLowerCase() === 'active')
        .length,
    [projects]
  )

  const recentDonations = useMemo(
    () =>
      [...donations]
        .sort(
          (a, b) => new Date(getDonationDate(b) || 0) - new Date(getDonationDate(a) || 0)
        )
        .slice(0, 5),
    [donations]
  )

  const topFundedProjects = useMemo(
    () =>
      [...projects]
        .sort((a, b) => Number(b?.total_donated || 0) - Number(a?.total_donated || 0))
        .slice(0, 3),
    [projects]
  )

  const adminMetrics = useMemo(() => {
    const staffUsers = users.filter((user) => String(user?.role || '').toLowerCase() === 'staff')
    return {
      pendingStaff: staffUsers.filter((user) => !user?.is_active),
      activePartners: partners.filter((partner) => partner?.is_active).length,
    }
  }, [partners, users])

  const supportByTypeChart = useMemo(() => {
    const months = typeSupportAnalytics?.months?.length ? typeSupportAnalytics.months : []
    const series = (typeSupportAnalytics?.series || [])
      .slice(0, 4)
      .map((item, index) => ({
        label: item?.project_type_display || item?.project_type || 'Other',
        total: Number(item?.total_amount || 0),
        months: Array.isArray(item?.monthly_amounts) ? item.monthly_amounts.map((value) => Number(value || 0)) : Array(12).fill(0),
        color: TYPE_COLORS[index % TYPE_COLORS.length],
      }))

    const maxValue = Math.max(...series.flatMap((item) => item.months), 0)

    return { months, series, maxValue }
  }, [typeSupportAnalytics])

  if (loading) {
    return (
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1.5 text-sm text-gray-600">Loading management overview...</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="p-4">
              <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
              <div className="mt-4 h-8 w-20 animate-pulse rounded bg-gray-200" />
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1.5 text-sm text-gray-600">Welcome to the management area.</p>
        </div>
        <Card className="border border-red-200 p-5">
          <p className="text-base font-semibold text-gray-900">Unable to load dashboard</p>
          <p className="mt-2 text-sm leading-7 text-red-600">{error}</p>
        </Card>
      </div>
    )
  }

  const staffStatCards = (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <StatCard icon={FolderKanban} label="Projects" title="Your Projects" value={projectsCount} />
      <StatCard
        icon={HandCoins}
        label="Donations"
        title="Visible Donations"
        value={donationsCount}
        subtext={formatCurrency(totalDonationAmount)}
      />
      <StatCard
        icon={HeartHandshake}
        label="Impact"
        title="Beneficiaries"
        value={beneficiariesCount}
        accent="lime"
      />
      <StatCard icon={CalendarDays} label="Updates" title="Project Updates" value={updatesCount} />
    </div>
  )

  const activitySection = (
    <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
      <Card className="rounded-[24px] p-4">
        <div>
          <h2 className="text-base font-bold text-gray-900">Recent Donations</h2>
          <p className="mt-1 text-xs text-gray-500">
            Latest contribution activity visible to your role.
          </p>
        </div>
        {recentDonations.length === 0 ? (
          <div className="mt-4 rounded-2xl bg-[#F8F8F6] p-4 text-xs text-gray-600">
            No donation activity available yet.
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="text-left">
                  <th className="pb-2.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-gray-500">
                    Project
                  </th>
                  <th className="pb-2.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-gray-500">
                    Amount
                  </th>
                  <th className="pb-2.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-gray-500">
                    Payment
                  </th>
                  <th className="pb-2.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-gray-500">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentDonations.map((donation) => (
                  <tr key={donation.id}>
                    <td className="py-3 pr-3">
                      <p className="text-[12px] font-semibold text-gray-900">
                        {getProjectName(donation)}
                      </p>
                      <p className="mt-1 text-[10px] text-gray-500">
                        {donation?.donor_name || donation?.donor_username || 'Donor'}
                      </p>
                    </td>
                    <td className="py-3 pr-3 text-[12px] font-semibold text-green-800">
                      {formatCurrency(donation?.amount)}
                    </td>
                    <td className="py-3 pr-3">
                      <span className="inline-flex rounded-full bg-green-100 px-2.5 py-1 text-[10px] font-semibold capitalize text-green-800">
                        {donation?.payment_method || 'N/A'}
                      </span>
                    </td>
                    <td className="py-3 text-[11px] text-gray-600">
                      {formatDate(getDonationDate(donation))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card className="rounded-[24px] p-4">
        <div>
          <h2 className="text-base font-bold text-gray-900">Top Funded Projects</h2>
          <p className="mt-1 text-xs text-gray-500">
            Projects with the highest visible funding progress.
          </p>
        </div>
        {topFundedProjects.length === 0 ? (
          <div className="mt-4 rounded-2xl bg-[#F8F8F6] p-4 text-xs text-gray-600">
            No project funding data available yet.
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {topFundedProjects.map((project) => (
              <div
                key={project.id}
                className="rounded-2xl border border-gray-200 bg-[#FCFCFB] p-3.5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[12px] font-semibold text-gray-900">
                      {project?.title || 'Untitled project'}
                    </p>
                    <p className="mt-1 text-[10px] text-gray-500">
                      {project?.location || 'Location not specified'}
                    </p>
                  </div>
                  <div className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-1 text-[10px] font-semibold text-green-800">
                    <TrendingUp size={12} className="mr-1" />
                    {Number(project?.funding_percentage || 0).toFixed(0)}%
                  </div>
                </div>
                <div className="mt-3 h-2 rounded-full bg-gray-200">
                  <div
                    className="h-2 rounded-full bg-green-800"
                    style={{
                      width: `${Math.min(Number(project?.funding_percentage || 0), 100)}%`,
                    }}
                  />
                </div>
                <div className="mt-3 flex items-center justify-between text-[11px]">
                  <div>
                    <p className="text-gray-500">Raised</p>
                    <p className="font-semibold text-gray-900">
                      {formatCurrency(project?.total_donated)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-500">Target</p>
                    <p className="font-semibold text-gray-900">
                      {formatCurrency(project?.target_amount)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )

  return isAdmin ? (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Overview</h1>
          <p className="mt-1.5 text-sm text-gray-600">
            Track approvals, partner readiness, type-based support, and platform-wide activity.
          </p>
        </div>
        <div className="inline-flex items-center rounded-2xl bg-green-50 px-3.5 py-2 text-xs font-semibold text-green-800">
          <TrendingUp size={16} className="mr-2" />
          Platform Raised: {formatCurrency(totalDonationAmount)}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Users} label="Users" title="Total Accounts" value={usersCount} />
        <StatCard
          icon={UserCheck}
          label="Approvals"
          title="Pending Staff"
          value={adminMetrics.pendingStaff.length}
          accent="amber"
        />
        <StatCard
          icon={Handshake}
          label="Partners"
          title="Active Partners"
          value={adminMetrics.activePartners}
          subtext={`of ${partnersCount} total`}
        />
        <StatCard
          icon={FolderKanban}
          label="Projects"
          title="Active Projects"
          value={activeProjectsCount}
          subtext={`${projectsCount} total`}
          accent="lime"
        />
      </div>

      <Card className="rounded-[24px] p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-900">Support by Project Type</h2>
            <p className="mt-1 text-xs text-gray-500">
              Donation support patterns by project type from January to December.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/dashboard/users"
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-green-800 px-2.5 py-2 text-[10px] font-semibold text-white transition hover:bg-[#0f4d27]"
            >
              <Users size={12} />
              Users
            </Link>
            <Link
              to="/dashboard/partners"
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-green-200 px-2.5 py-2 text-[10px] font-semibold text-green-800 transition hover:bg-green-50"
            >
              <Handshake size={12} />
              Partners
            </Link>
          </div>
        </div>

        {supportByTypeChart.series.length === 0 ? (
          <div className="mt-4 rounded-2xl bg-[#F8F8F6] p-4 text-xs text-gray-600">
            No typed project donation data is available yet.
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            <div className="flex flex-wrap gap-2">
              {supportByTypeChart.series.map((item) => (
                <div
                  key={item.label}
                  className="inline-flex items-center gap-2 rounded-full bg-[#F8F8F6] px-3 py-1.5 text-[10px] font-semibold text-gray-700"
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span>{item.label}</span>
                  <span className="text-gray-500">- {formatCurrency(item.total)}</span>
                </div>
              ))}
            </div>

            <div className="overflow-x-auto rounded-[20px] border border-gray-200 bg-[#FCFCFB] p-3">
              <svg
                viewBox="0 0 720 240"
                className="h-[240px] w-full min-w-[680px]"
                aria-label="Support by project type line chart"
              >
                <text x="14" y="24" fontSize="10" fill="#6b7280" fontWeight="600">
                  RWF
                </text>

                {Array.from({ length: 5 }).map((_, index) => {
                  const value = supportByTypeChart.maxValue
                    ? supportByTypeChart.maxValue - (supportByTypeChart.maxValue / 4) * index
                    : 0
                  const y = 24 + index * 44

                  return (
                    <text
                      key={`axis-${index}`}
                      x="38"
                      y={y + 4}
                      textAnchor="end"
                      fontSize="9"
                      fill="#6b7280"
                    >
                      {formatCurrency(value)}
                    </text>
                  )
                })}

                {Array.from({ length: 5 }).map((_, index) => {
                  const y = 24 + index * 44
                  return (
                    <line
                      key={`grid-${index}`}
                      x1="44"
                      y1={y}
                      x2="690"
                      y2={y}
                      stroke="#e5e7eb"
                      strokeWidth="1"
                    />
                  )
                })}

                {supportByTypeChart.months.map((month, index) => {
                  const x = 44 + (index / Math.max(supportByTypeChart.months.length - 1, 1)) * 646
                  return (
                    <g key={month}>
                      <line x1={x} y1="24" x2={x} y2="200" stroke="#f3f4f6" strokeWidth="1" />
                      <text
                        x={x}
                        y="220"
                        textAnchor="middle"
                        fontSize="10"
                        fill="#6b7280"
                      >
                        {month}
                      </text>
                    </g>
                  )
                })}

                {supportByTypeChart.series.map((item) => {
                  const points = item.months.map((value, index) => {
                    const x =
                      44 +
                      (index / Math.max(item.months.length - 1, 1)) * 646
                    const ratio = supportByTypeChart.maxValue > 0 ? value / supportByTypeChart.maxValue : 0
                    const y = 200 - ratio * 176
                    return { x, y, value }
                  })

                  const path = points
                    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
                    .join(' ')

                  return (
                    <g key={item.label}>
                      <path
                        d={path}
                        fill="none"
                        stroke={item.color}
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      {points.map((point, index) => (
                        <circle
                          key={`${item.label}-${index}`}
                          cx={point.x}
                          cy={point.y}
                          r="3.5"
                          fill={item.color}
                        >
                          <title>{`${item.label} - ${supportByTypeChart.months[index] || `Month ${index + 1}`}: ${formatCurrency(point.value)}`}</title>
                        </circle>
                      ))}
                    </g>
                  )
                })}

                <text x="367" y="236" textAnchor="middle" fontSize="10" fill="#6b7280" fontWeight="600">
                  Months
                </text>
              </svg>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              {supportByTypeChart.series.map((item) => (
                <div key={`${item.label}-total`} className="rounded-[18px] bg-[#F8F8F6] px-3 py-2.5">
                  <p className="text-[10px] text-gray-500">Total for {item.label}</p>
                  <p className="mt-1 text-[12px] font-semibold text-gray-900">
                    {formatCurrency(item.total)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {activitySection}
    </div>
  ) : (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff Workspace</h1>
          <p className="mt-1.5 text-sm text-gray-600">
            Focus on your project work, donation activity, beneficiaries, and updates.
          </p>
        </div>
        <div className="inline-flex items-center rounded-2xl bg-green-50 px-3.5 py-2 text-xs font-semibold text-green-800">
          <TrendingUp size={16} className="mr-2" />
          Active Projects: {activeProjectsCount}
        </div>
      </div>

      {staffStatCards}

      <Card className="rounded-[24px] p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-900">Project Workspaces</h2>
            <p className="mt-1 text-sm text-gray-500">
              Open one of your projects to manage beneficiaries, donations, updates, and details.
            </p>
          </div>
          <Link
            to="/dashboard/projects"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-green-800 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-[#0f4d27]"
          >
            Open Projects
            <ArrowRight size={14} />
          </Link>
        </div>
      </Card>

      {activitySection}
    </div>
  )
}

export default DashboardHomePage
