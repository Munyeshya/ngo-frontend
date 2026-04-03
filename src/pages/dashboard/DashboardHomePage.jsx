import { useEffect, useMemo, useState } from 'react'
import {
  AlertCircle,
  FolderKanban,
  HandCoins,
  HeartHandshake,
  TrendingUp,
  CalendarDays,
  ArrowUpRight,
  ShieldCheck,
  UserCheck,
  UserCog,
  Search,
} from 'lucide-react'

import api from '../../api/axios'
import endpoints from '../../api/endpoints'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
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
  return donation?.project?.title || donation?.project_title || 'Project Donation'
}

function getDonationDate(donation) {
  return donation?.donated_at || donation?.created_at || donation?.date || null
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

function DashboardHomePage() {
  const currentUser = getUser()
  const isAdmin = String(currentUser?.role || '').toLowerCase() === 'admin'
  const [projects, setProjects] = useState([])
  const [donations, setDonations] = useState([])
  const [beneficiaries, setBeneficiaries] = useState([])
  const [updates, setUpdates] = useState([])
  const [users, setUsers] = useState([])

  const [projectsCount, setProjectsCount] = useState(0)
  const [donationsCount, setDonationsCount] = useState(0)
  const [beneficiariesCount, setBeneficiariesCount] = useState(0)
  const [updatesCount, setUpdatesCount] = useState(0)
  const [usersCount, setUsersCount] = useState(0)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [adminActionError, setAdminActionError] = useState('')
  const [adminActionSuccess, setAdminActionSuccess] = useState('')
  const [updatingUserId, setUpdatingUserId] = useState(null)
  const [userSearch, setUserSearch] = useState('')

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
        }

        const [projectsRes, donationsRes, beneficiariesRes, updatesRes, usersRes] =
          await Promise.allSettled([
            ...requests,
          ])

        if (!active) return

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
        if (active) {
          setLoading(false)
        }
      }
    }

    loadDashboard()

    return () => {
      active = false
    }
  }, [isAdmin])

  const totalDonationAmount = useMemo(() => {
    return donations.reduce((sum, item) => sum + Number(item?.amount || 0), 0)
  }, [donations])

  const activeProjectsCount = useMemo(() => {
    return projects.filter(
      (project) => String(project?.status || '').toLowerCase() === 'active'
    ).length
  }, [projects])

  const recentDonations = useMemo(() => {
    return [...donations]
      .sort(
        (a, b) =>
          new Date(getDonationDate(b) || 0) - new Date(getDonationDate(a) || 0)
      )
      .slice(0, 6)
  }, [donations])

  const topFundedProjects = useMemo(() => {
    return [...projects]
      .sort(
        (a, b) =>
          Number(b?.total_donated || 0) - Number(a?.total_donated || 0)
      )
      .slice(0, 5)
  }, [projects])

  const pendingStaff = useMemo(() => {
    return users.filter(
      (user) => String(user?.role || '').toLowerCase() === 'staff' && !user?.is_active
    )
  }, [users])

  const filteredUsers = useMemo(() => {
    const query = userSearch.trim().toLowerCase()
    const items = [...users]

    if (!query) {
      return items.slice(0, 8)
    }

    return items
      .filter((user) => {
        const name = getDisplayName(user).toLowerCase()
        const email = String(user?.email || '').toLowerCase()
        const username = String(user?.username || '').toLowerCase()
        const role = String(user?.role || '').toLowerCase()

        return (
          name.includes(query) ||
          email.includes(query) ||
          username.includes(query) ||
          role.includes(query)
        )
      })
      .slice(0, 8)
  }, [users, userSearch])

  async function refreshUsers() {
    if (!isAdmin) return
    const response = await api.get(endpoints.users)
    const list = normalizeListResponse(response.data)
    setUsers(list)
    setUsersCount(getCountFromResponse(response.data, list))
  }

  async function handleUserStatusUpdate(user, isActive) {
    try {
      setUpdatingUserId(user.id)
      setAdminActionError('')
      setAdminActionSuccess('')
      await api.patch(endpoints.userDetails(user.id), {
        is_active: isActive,
      })
      await refreshUsers()
      setAdminActionSuccess(
        isActive
          ? `${getDisplayName(user)} approved successfully.`
          : `${getDisplayName(user)} updated successfully.`
      )
    } catch (err) {
      setAdminActionError(
        err?.response?.data?.message ||
          err?.response?.data?.detail ||
          'Failed to update user account.'
      )
    } finally {
      setUpdatingUserId(null)
    }
  }

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

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1.5 text-sm text-gray-600">
            Welcome to the management area. Monitor projects, donations, beneficiaries, and recent activity.
          </p>
        </div>

        <div className="inline-flex items-center rounded-2xl bg-green-50 px-3.5 py-2 text-xs font-semibold text-green-800">
          <TrendingUp size={16} className="mr-2" />
          Active Projects: {activeProjectsCount}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="rounded-[24px] p-4">
          <div className="flex items-start justify-between">
            <div className="rounded-2xl bg-green-100 p-3 text-green-800">
              <FolderKanban size={20} />
            </div>
            <span className="text-xs font-medium text-gray-400">Projects</span>
          </div>
          <p className="mt-4 text-sm text-gray-500">Total Projects</p>
          <p className="mt-2 text-[1.7rem] font-bold text-gray-900">{projectsCount}</p>
        </Card>

        <Card className="rounded-[24px] p-4">
          <div className="flex items-start justify-between">
            <div className="rounded-2xl bg-emerald-100 p-3 text-green-800">
              <HandCoins size={20} />
            </div>
            <span className="text-xs font-medium text-gray-400">Donations</span>
          </div>
          <p className="mt-4 text-sm text-gray-500">Total Donations</p>
          <p className="mt-2 text-[1.7rem] font-bold text-gray-900">{donationsCount}</p>
          <p className="mt-2 text-sm font-medium text-green-800">
            {formatCurrency(totalDonationAmount)}
          </p>
        </Card>

        <Card className="rounded-[24px] p-4">
          <div className="flex items-start justify-between">
            <div className="rounded-2xl bg-lime-100 p-3 text-green-800">
              <HeartHandshake size={20} />
            </div>
            <span className="text-xs font-medium text-gray-400">Impact</span>
          </div>
          <p className="mt-4 text-sm text-gray-500">Beneficiaries</p>
          <p className="mt-2 text-[1.7rem] font-bold text-gray-900">{beneficiariesCount}</p>
        </Card>

        <Card className="rounded-[24px] p-4">
          <div className="flex items-start justify-between">
            <div className="rounded-2xl bg-green-100 p-3 text-green-800">
              <CalendarDays size={20} />
            </div>
            <span className="text-xs font-medium text-gray-400">Updates</span>
          </div>
          <p className="mt-4 text-sm text-gray-500">Project Updates</p>
          <p className="mt-2 text-[1.7rem] font-bold text-gray-900">{updatesCount}</p>
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="rounded-[24px] p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Recent Donations</h2>
              <p className="mt-1 text-sm text-gray-500">
                Latest contribution activity visible to your role.
              </p>
            </div>
          </div>

          {recentDonations.length === 0 ? (
            <div className="mt-5 rounded-2xl bg-[#F8F8F6] p-5 text-sm text-gray-600">
              No donation activity available yet.
            </div>
          ) : (
            <div className="mt-5 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="text-left">
                    <th className="pb-3 text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">
                      Project
                    </th>
                    <th className="pb-3 text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">
                      Amount
                    </th>
                    <th className="pb-3 text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">
                      Payment
                    </th>
                    <th className="pb-3 text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">
                      Date
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {recentDonations.map((donation) => (
                    <tr key={donation.id}>
                      <td className="py-4 pr-4">
                        <p className="text-sm font-semibold text-gray-900">
                          {getProjectName(donation)}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          {donation?.donor_name || donation?.donor?.username || 'Donor'}
                        </p>
                      </td>
                      <td className="py-4 pr-4 text-sm font-semibold text-green-800">
                        {formatCurrency(donation?.amount)}
                      </td>
                      <td className="py-4 pr-4">
                        <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-semibold capitalize text-green-800">
                          {donation?.payment_method || 'N/A'}
                        </span>
                      </td>
                      <td className="py-4 text-sm text-gray-600">
                        {formatDate(getDonationDate(donation))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card className="rounded-[24px] p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Top Funded Projects</h2>
              <p className="mt-1 text-sm text-gray-500">
                Projects with the highest visible funding progress.
              </p>
            </div>
          </div>

          {topFundedProjects.length === 0 ? (
            <div className="mt-5 rounded-2xl bg-[#F8F8F6] p-5 text-sm text-gray-600">
              No project funding data available yet.
            </div>
          ) : (
            <div className="mt-5 space-y-3.5">
              {topFundedProjects.map((project) => (
                <div
                  key={project.id}
                  className="rounded-2xl border border-gray-200 bg-[#FCFCFB] p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {project?.title || 'Untitled project'}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        {project?.location || 'Location not specified'}
                      </p>
                    </div>

                    <div className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">
                      <ArrowUpRight size={14} className="mr-1" />
                      {Number(project?.funding_percentage || 0).toFixed(0)}%
                    </div>
                  </div>

                  <div className="mt-4 h-2.5 rounded-full bg-gray-200">
                    <div
                      className="h-2.5 rounded-full bg-green-800"
                      style={{
                        width: `${Math.min(Number(project?.funding_percentage || 0), 100)}%`,
                      }}
                    />
                  </div>

                  <div className="mt-4 flex items-center justify-between text-sm">
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

      {isAdmin && (
        <div className="space-y-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Admin User Management</h2>
              <p className="mt-1 text-sm text-gray-500">
                Review pending staff applications and account status across the platform.
              </p>
            </div>

            <div className="inline-flex items-center rounded-2xl bg-green-50 px-3.5 py-2 text-xs font-semibold text-green-800">
              <UserCog size={16} className="mr-2" />
              Total Users: {usersCount}
            </div>
          </div>

          {(adminActionError || adminActionSuccess) && (
            <Card className={`p-4 ${adminActionError ? 'border-red-200' : 'border-green-200'}`}>
              <div
                className={`flex items-start gap-3 text-sm ${
                  adminActionError ? 'text-red-700' : 'text-green-700'
                }`}
              >
                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                <span>{adminActionError || adminActionSuccess}</span>
              </div>
            </Card>
          )}

          <div className="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
            <Card className="rounded-[24px] p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-gray-900">Pending Staff Approval</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Staff applicants waiting for admin action.
                  </p>
                </div>

                <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-green-100 text-green-800">
                  <UserCheck size={18} />
                </div>
              </div>

              <div className="mt-5 rounded-2xl bg-[#F8F8F6] p-4">
                <p className="text-xs text-gray-500">Pending Accounts</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{pendingStaff.length}</p>
              </div>

              {pendingStaff.length === 0 ? (
                <div className="mt-4 rounded-2xl bg-[#F8F8F6] p-4 text-sm text-gray-600">
                  No staff applications are pending right now.
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  {pendingStaff.slice(0, 6).map((user) => (
                    <div
                      key={user.id}
                      className="rounded-2xl border border-gray-200 bg-[#FCFCFB] p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-gray-900">
                            {getDisplayName(user)}
                          </p>
                          <p className="mt-1 truncate text-xs text-gray-500">
                            {user?.email || user?.username || 'No email'}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleUserStatusUpdate(user, true)}
                          disabled={updatingUserId === user.id}
                          className="inline-flex items-center gap-1.5 rounded-full bg-green-800 px-3 py-1.5 text-[11px] font-semibold text-white transition hover:bg-[#0f4d27] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <ShieldCheck size={12} />
                          {updatingUserId === user.id ? 'Approving...' : 'Approve'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card className="rounded-[24px] p-5">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <h3 className="text-base font-bold text-gray-900">User Directory</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Search platform users and manage account activation.
                  </p>
                </div>

                <div className="relative xl:w-[300px]">
                  <Search
                    size={16}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Search users"
                    className="h-10 w-full rounded-xl border border-gray-300 bg-white pl-10 pr-3 text-sm outline-none transition focus:border-[#166534] focus:ring-4 focus:ring-green-100"
                  />
                </div>
              </div>

              {filteredUsers.length === 0 ? (
                <div className="mt-5 rounded-2xl bg-[#F8F8F6] p-4 text-sm text-gray-600">
                  No matching users found.
                </div>
              ) : (
                <div className="mt-5 overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr className="text-left">
                        <th className="pb-2.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-500">
                          User
                        </th>
                        <th className="pb-2.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-500">
                          Role
                        </th>
                        <th className="pb-2.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-500">
                          Status
                        </th>
                        <th className="pb-2.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-500">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredUsers.map((user) => (
                        <tr key={user.id}>
                          <td className="py-3 pr-4">
                            <p className="text-[13px] font-semibold text-gray-900">
                              {getDisplayName(user)}
                            </p>
                            <p className="mt-1 text-[11px] text-gray-500">
                              {user?.email || user?.username || 'No email'}
                            </p>
                          </td>
                          <td className="py-3 pr-4">
                            <span className="inline-flex rounded-full bg-[#F3F5F0] px-2.5 py-1 text-[11px] font-semibold capitalize text-gray-700">
                              {user?.role || 'user'}
                            </span>
                          </td>
                          <td className="py-3 pr-4 text-[13px] text-gray-600">
                            {user?.is_active ? 'Active' : 'Pending / Inactive'}
                          </td>
                          <td className="py-3">
                            {String(user?.role || '').toLowerCase() === 'staff' ? (
                              <button
                                type="button"
                                onClick={() => handleUserStatusUpdate(user, !user?.is_active)}
                                disabled={updatingUserId === user.id}
                                className={`rounded-full px-3 py-1.5 text-[11px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                                  user?.is_active
                                    ? 'bg-[#F3F5F0] text-gray-700 hover:bg-gray-200'
                                    : 'bg-green-800 text-white hover:bg-[#0f4d27]'
                                }`}
                              >
                                {updatingUserId === user.id
                                  ? 'Saving...'
                                  : user?.is_active
                                  ? 'Set Inactive'
                                  : 'Approve'}
                              </button>
                            ) : (
                              <span className="text-[11px] text-gray-400">No action</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}

export default DashboardHomePage
