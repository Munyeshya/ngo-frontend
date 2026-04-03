import { useEffect, useMemo, useState } from 'react'
import {
  ArrowRight,
  CalendarDays,
  FolderKanban,
  HandCoins,
  Handshake,
  HeartHandshake,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  UserCheck,
  UserCog,
  Users,
} from 'lucide-react'
import { Link } from 'react-router-dom'

import api from '../../api/axios'
import endpoints from '../../api/endpoints'
import Card from '../../components/ui/Card'
import { getUser } from '../../utils/storage'

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

function getDonationProjectId(donation) {
  if (typeof donation?.project === 'number' || typeof donation?.project === 'string') {
    return donation.project
  }
  return donation?.project?.id ?? null
}

function getDisplayName(user) {
  return (
    user?.full_name ||
    [user?.first_name, user?.last_name].filter(Boolean).join(' ').trim() ||
    user?.username ||
    user?.email ||
    'User'
  )
}

function getProjectOwnerName(project) {
  return String(project?.created_by || '').trim().toLowerCase()
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
  const [projectsCount, setProjectsCount] = useState(0)
  const [donationsCount, setDonationsCount] = useState(0)
  const [beneficiariesCount, setBeneficiariesCount] = useState(0)
  const [updatesCount, setUpdatesCount] = useState(0)
  const [usersCount, setUsersCount] = useState(0)
  const [partnersCount, setPartnersCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [staffSearch, setStaffSearch] = useState('')

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
        }

        const results = await Promise.allSettled(requests)
        if (!active) return

        const [projectsRes, donationsRes, beneficiariesRes, updatesRes, usersRes, partnersRes] =
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
        .slice(0, 6),
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
    const pendingStaff = staffUsers.filter((user) => !user?.is_active)
    const activePartners = partners.filter((partner) => partner?.is_active).length

    const metrics = staffUsers.map((user) => {
      const ownerName = String(user?.username || '').toLowerCase()
      const ownedProjects = projects.filter((project) => getProjectOwnerName(project) === ownerName)
      const ownedProjectIds = new Set(ownedProjects.map((project) => project.id))
      const ownedDonations = donations.filter((donation) =>
        ownedProjectIds.has(getDonationProjectId(donation))
      )
      const ownedBeneficiaries = beneficiaries.filter((beneficiary) =>
        ownedProjectIds.has(beneficiary?.project)
      )
      const ownedUpdates = updates.filter((update) => ownedProjectIds.has(update?.project))
      const raised = ownedDonations.reduce((sum, donation) => sum + Number(donation?.amount || 0), 0)

      return {
        id: user.id,
        name: getDisplayName(user),
        isActive: Boolean(user?.is_active),
        projects: ownedProjects.length,
        donations: ownedDonations.length,
        beneficiaries: ownedBeneficiaries.length,
        updates: ownedUpdates.length,
        raised,
      }
    })

    return {
      staffUsers,
      pendingStaff,
      activePartners,
      highestRaised: Math.max(...metrics.map((item) => item.raised), 0),
      metrics: metrics.sort((a, b) => b.raised - a.raised || b.projects - a.projects),
    }
  }, [beneficiaries, donations, partners, projects, updates, users])

  const filteredStaffMetrics = useMemo(() => {
    const query = staffSearch.trim().toLowerCase()
    if (!query) return adminMetrics.metrics

    return adminMetrics.metrics.filter((item) =>
      String(item.name || '').toLowerCase().includes(query)
    )
  }, [adminMetrics.metrics, staffSearch])

  const staffPageSize = 2
  const staffPageCount = Math.max(1, Math.ceil(filteredStaffMetrics.length / staffPageSize))
  const [staffPage, setStaffPage] = useState(1)

  useEffect(() => {
    setStaffPage(1)
  }, [staffSearch])

  useEffect(() => {
    if (staffPage > staffPageCount) {
      setStaffPage(staffPageCount)
    }
  }, [staffPage, staffPageCount])

  const paginatedStaffMetrics = useMemo(() => {
    const start = (staffPage - 1) * staffPageSize
    return filteredStaffMetrics.slice(start, start + staffPageSize)
  }, [filteredStaffMetrics, staffPage])

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
      <StatCard icon={HeartHandshake} label="Impact" title="Beneficiaries" value={beneficiariesCount} accent="lime" />
      <StatCard icon={CalendarDays} label="Updates" title="Project Updates" value={updatesCount} />
    </div>
  )

  const activitySection = (
    <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
      <Card className="rounded-[24px] p-4">
        <div>
          <h2 className="text-base font-bold text-gray-900">Recent Donations</h2>
          <p className="mt-1 text-xs text-gray-500">Latest contribution activity visible to your role.</p>
        </div>
        {recentDonations.length === 0 ? (
          <div className="mt-4 rounded-2xl bg-[#F8F8F6] p-4 text-xs text-gray-600">No donation activity available yet.</div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="text-left">
                  <th className="pb-2.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-gray-500">Project</th>
                  <th className="pb-2.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-gray-500">Amount</th>
                  <th className="pb-2.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-gray-500">Payment</th>
                  <th className="pb-2.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-gray-500">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentDonations.slice(0, 5).map((donation) => (
                  <tr key={donation.id}>
                    <td className="py-3 pr-3">
                      <p className="text-[12px] font-semibold text-gray-900">{getProjectName(donation)}</p>
                      <p className="mt-1 text-[10px] text-gray-500">{donation?.donor_name || donation?.donor_username || 'Donor'}</p>
                    </td>
                    <td className="py-3 pr-3 text-[12px] font-semibold text-green-800">{formatCurrency(donation?.amount)}</td>
                    <td className="py-3 pr-3">
                      <span className="inline-flex rounded-full bg-green-100 px-2.5 py-1 text-[10px] font-semibold capitalize text-green-800">
                        {donation?.payment_method || 'N/A'}
                      </span>
                    </td>
                    <td className="py-3 text-[11px] text-gray-600">{formatDate(getDonationDate(donation))}</td>
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
          <p className="mt-1 text-xs text-gray-500">Projects with the highest visible funding progress.</p>
        </div>
        {topFundedProjects.length === 0 ? (
          <div className="mt-4 rounded-2xl bg-[#F8F8F6] p-4 text-xs text-gray-600">No project funding data available yet.</div>
        ) : (
          <div className="mt-4 space-y-3">
            {topFundedProjects.map((project) => (
              <div key={project.id} className="rounded-2xl border border-gray-200 bg-[#FCFCFB] p-3.5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[12px] font-semibold text-gray-900">{project?.title || 'Untitled project'}</p>
                    <p className="mt-1 text-[10px] text-gray-500">{project?.location || 'Location not specified'}</p>
                  </div>
                  <div className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-1 text-[10px] font-semibold text-green-800">
                    <TrendingUp size={12} className="mr-1" />
                    {Number(project?.funding_percentage || 0).toFixed(0)}%
                  </div>
                </div>
                <div className="mt-3 h-2 rounded-full bg-gray-200">
                  <div
                    className="h-2 rounded-full bg-green-800"
                    style={{ width: `${Math.min(Number(project?.funding_percentage || 0), 100)}%` }}
                  />
                </div>
                <div className="mt-3 flex items-center justify-between text-[11px]">
                  <div>
                    <p className="text-gray-500">Raised</p>
                    <p className="font-semibold text-gray-900">{formatCurrency(project?.total_donated)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-500">Target</p>
                    <p className="font-semibold text-gray-900">{formatCurrency(project?.target_amount)}</p>
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
          <p className="mt-1.5 text-sm text-gray-600">Track approvals, staff performance, partner readiness, and platform-wide activity.</p>
        </div>
        <div className="inline-flex items-center rounded-2xl bg-green-50 px-3.5 py-2 text-xs font-semibold text-green-800">
          <TrendingUp size={16} className="mr-2" />
          Platform Raised: {formatCurrency(totalDonationAmount)}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Users} label="Users" title="Total Accounts" value={usersCount} />
        <StatCard icon={UserCheck} label="Approvals" title="Pending Staff" value={adminMetrics.pendingStaff.length} accent="amber" />
        <StatCard icon={Handshake} label="Partners" title="Active Partners" value={adminMetrics.activePartners} subtext={`of ${partnersCount} total`} />
        <StatCard icon={FolderKanban} label="Projects" title="Active Projects" value={activeProjectsCount} subtext={`${projectsCount} total`} accent="lime" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="rounded-[24px] p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-base font-bold text-gray-900">Staff Performance</h2>
              <p className="mt-1 text-xs text-gray-500">Overall numbers by staff owner across the platform.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <input
                  type="text"
                  value={staffSearch}
                  onChange={(event) => setStaffSearch(event.target.value)}
                  placeholder="Search staff"
                  className="h-8 w-[170px] rounded-xl border border-gray-300 bg-white px-3 text-[11px] outline-none transition focus:border-[#166534] focus:ring-4 focus:ring-green-100"
                />
              </div>
              <Link
                to="/dashboard/users"
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-green-800 px-2.5 py-2 text-[10px] font-semibold text-white transition hover:bg-[#0f4d27]"
              >
                <UserCog size={12} />
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
          {filteredStaffMetrics.length === 0 ? (
            <div className="mt-4 rounded-2xl bg-[#F8F8F6] p-4 text-xs text-gray-600">No staff records are available yet.</div>
          ) : (
            <div className="mt-4 space-y-3">
              {paginatedStaffMetrics.map((item) => (
                <div key={item.id} className="rounded-[20px] border border-gray-200 bg-[#FCFCFB] p-3.5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="truncate text-[12px] font-semibold text-gray-900">{item.name}</p>
                      <p className="mt-1 text-[11px] text-gray-500">{item.isActive ? 'Active staff' : 'Pending / Inactive'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-gray-500">Raised</p>
                      <p className="mt-1 text-[12px] font-semibold text-green-800">{formatCurrency(item.raised)}</p>
                    </div>
                  </div>
                  <div className="mt-2.5 h-1.5 rounded-full bg-gray-200">
                    <div
                      className="h-1.5 rounded-full bg-green-800"
                      style={{ width: `${Math.min(adminMetrics.highestRaised > 0 ? (item.raised / adminMetrics.highestRaised) * 100 : 0, 100)}%` }}
                    />
                  </div>
                  <div className="mt-2.5 grid gap-2.5 sm:grid-cols-4">
                    <div><p className="text-[10px] text-gray-500">Projects</p><p className="mt-1 text-[12px] font-semibold text-gray-900">{item.projects}</p></div>
                    <div><p className="text-[10px] text-gray-500">Donations</p><p className="mt-1 text-[12px] font-semibold text-gray-900">{item.donations}</p></div>
                    <div><p className="text-[10px] text-gray-500">Beneficiaries</p><p className="mt-1 text-[12px] font-semibold text-gray-900">{item.beneficiaries}</p></div>
                    <div><p className="text-[10px] text-gray-500">Updates</p><p className="mt-1 text-[12px] font-semibold text-gray-900">{item.updates}</p></div>
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between text-[11px] text-gray-500">
                <span>
                  Page {staffPage} of {staffPageCount}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setStaffPage((page) => Math.max(1, page - 1))}
                    disabled={staffPage === 1}
                    className="inline-flex h-7 w-7 items-center justify-center text-gray-500 transition hover:text-gray-800 disabled:opacity-35"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setStaffPage((page) => Math.min(staffPageCount, page + 1))}
                    disabled={staffPage === staffPageCount}
                    className="inline-flex h-7 w-7 items-center justify-center text-gray-500 transition hover:text-gray-800 disabled:opacity-35"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>

      {activitySection}
    </div>
  ) : (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff Workspace</h1>
          <p className="mt-1.5 text-sm text-gray-600">Focus on your project work, donation activity, beneficiaries, and updates.</p>
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
            <p className="mt-1 text-sm text-gray-500">Open one of your projects to manage beneficiaries, donations, updates, and details.</p>
          </div>
          <Link to="/dashboard/projects" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-green-800 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-[#0f4d27]">
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
