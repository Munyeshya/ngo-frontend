import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, FileBadge2, Search, UserCog } from 'lucide-react'

import api from '../../api/axios'
import endpoints from '../../api/endpoints'
import { useToast } from '../../components/feedback/ToastProvider'
import Card from '../../components/ui/Card'

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

function getDisplayName(user) {
  return (
    user?.full_name ||
    [user?.first_name, user?.last_name].filter(Boolean).join(' ').trim() ||
    user?.username ||
    user?.email ||
    'User'
  )
}

function getStatusTone(status) {
  if (status === 'approved') return 'bg-green-100 text-green-800'
  if (status === 'changes_requested') return 'bg-amber-100 text-amber-800'
  if (status === 'rejected') return 'bg-red-100 text-red-700'
  if (status === 'under_review') return 'bg-sky-100 text-sky-700'
  return 'bg-[#F3F5F0] text-gray-700'
}

function countApplicationComplaints(application) {
  if (!application) return 0

  const rejectedStatuses = [
    application.individual_id_status,
    application.group_legal_document_status,
    application.representative_id_status,
  ].filter((value) => value === 'rejected').length

  const reasons = [
    application.individual_id_reason,
    application.group_legal_document_reason,
    application.representative_id_reason,
  ].filter(Boolean).length

  return rejectedStatuses + reasons
}

function AdminUsersPage() {
  const { showToast } = useToast()
  const STAFF_APPLICATIONS_PER_PAGE = 6
  const USER_DIRECTORY_PER_PAGE = 8
  const [activeTab, setActiveTab] = useState('applications')
  const [users, setUsers] = useState([])
  const [staffApplications, setStaffApplications] = useState([])
  const [usersCount, setUsersCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatingUserId, setUpdatingUserId] = useState(null)
  const [userSearch, setUserSearch] = useState('')
  const [userRoleFilter, setUserRoleFilter] = useState('all')
  const [applicationPage, setApplicationPage] = useState(1)
  const [directoryPage, setDirectoryPage] = useState(1)

  async function loadUsers() {
    const [usersResponse, applicationsResponse] = await Promise.all([
      api.get(endpoints.users),
      api.get(endpoints.staffApplications),
    ])
    const userList = normalizeListResponse(usersResponse.data)
    const applicationList = normalizeListResponse(applicationsResponse.data)
    setUsers(userList)
    setUsersCount(getCountFromResponse(usersResponse.data, userList))
    setStaffApplications(applicationList)
  }

  useEffect(() => {
    let active = true

    async function initialize() {
      try {
        setLoading(true)
        setError('')
        const [usersResponse, applicationsResponse] = await Promise.all([
          api.get(endpoints.users),
          api.get(endpoints.staffApplications),
        ])
        if (!active) return
        const userList = normalizeListResponse(usersResponse.data)
        const applicationList = normalizeListResponse(applicationsResponse.data)
        setUsers(userList)
        setUsersCount(getCountFromResponse(usersResponse.data, userList))
        setStaffApplications(applicationList)
      } catch (err) {
        if (!active) return
        setError(
          err?.response?.data?.detail ||
            err?.response?.data?.message ||
            err?.message ||
            'Failed to load users.'
        )
      } finally {
        if (active) setLoading(false)
      }
    }

    initialize()

    return () => {
      active = false
    }
  }, [])

  const pendingStaff = useMemo(() => {
    return staffApplications
      .filter((application) =>
        ['under_review', 'changes_requested', 'draft'].includes(
          String(application?.status || '').toLowerCase()
        )
      )
      .sort((left, right) => {
        const complaintGap = countApplicationComplaints(right) - countApplicationComplaints(left)
        if (complaintGap !== 0) return complaintGap

        const rightTime = new Date(right?.updated_at || right?.submitted_at || 0).getTime()
        const leftTime = new Date(left?.updated_at || left?.submitted_at || 0).getTime()
        return rightTime - leftTime
      })
  }, [staffApplications])

  const filteredUsers = useMemo(() => {
    const query = userSearch.trim().toLowerCase()

    return users.filter((user) => {
      const role = String(user?.role || '').toLowerCase()

      if (userRoleFilter !== 'all' && role !== userRoleFilter) {
        return false
      }

      if (!query) {
        return true
      }

      const name = getDisplayName(user).toLowerCase()
      const email = String(user?.email || '').toLowerCase()
      const username = String(user?.username || '').toLowerCase()

      return (
        name.includes(query) ||
        email.includes(query) ||
        username.includes(query) ||
        role.includes(query)
      )
    })
  }, [users, userSearch, userRoleFilter])

  const applicationPageCount = Math.max(1, Math.ceil(pendingStaff.length / STAFF_APPLICATIONS_PER_PAGE))
  const directoryPageCount = Math.max(1, Math.ceil(filteredUsers.length / USER_DIRECTORY_PER_PAGE))

  const paginatedApplications = useMemo(() => {
    const safePage = Math.min(applicationPage, applicationPageCount)
    const startIndex = (safePage - 1) * STAFF_APPLICATIONS_PER_PAGE
    return pendingStaff.slice(startIndex, startIndex + STAFF_APPLICATIONS_PER_PAGE)
  }, [pendingStaff, applicationPage, applicationPageCount])

  const paginatedUsers = useMemo(() => {
    const safePage = Math.min(directoryPage, directoryPageCount)
    const startIndex = (safePage - 1) * USER_DIRECTORY_PER_PAGE
    return filteredUsers.slice(startIndex, startIndex + USER_DIRECTORY_PER_PAGE)
  }, [filteredUsers, directoryPage, directoryPageCount])

  const tabs = [
    { key: 'applications', label: 'Staff Applications', count: pendingStaff.length },
    { key: 'directory', label: 'User Directory', count: usersCount },
  ]

  useEffect(() => {
    setApplicationPage(1)
  }, [staffApplications])

  useEffect(() => {
    setDirectoryPage(1)
  }, [userSearch, userRoleFilter])

  async function handleUserStatusUpdate(user, isActive) {
    try {
      setUpdatingUserId(user.id)
      await api.patch(endpoints.userDetails(user.id), { is_active: isActive })
      await loadUsers()
      showToast({
        type: 'success',
        message: isActive
          ? `${getDisplayName(user)} updated successfully.`
          : `${getDisplayName(user)} updated successfully.`,
      })
    } catch (err) {
      showToast({
        type: 'error',
        message:
          err?.response?.data?.message ||
          err?.response?.data?.detail ||
          'Failed to update user account.',
      })
    } finally {
      setUpdatingUserId(null)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">User Management</h1>
          <p className="mt-1 text-sm text-gray-600">Loading platform accounts...</p>
        </div>

        <div className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
          {Array.from({ length: 2 }).map((_, index) => (
            <Card key={index} className="p-4">
              <div className="h-4 w-28 animate-pulse rounded bg-gray-200" />
              <div className="mt-4 h-16 animate-pulse rounded-2xl bg-gray-100" />
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">User Management</h1>
          <p className="mt-1 text-sm text-gray-600">Admin-only account oversight.</p>
        </div>

        <Card className="border border-red-200 p-4">
          <p className="text-sm font-semibold text-gray-900">Unable to load users</p>
          <p className="mt-2 text-sm leading-6 text-red-600">{error}</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">User Management</h1>
          <p className="mt-1 text-sm text-gray-600">
            Review staff applications and manage account access across the platform.
          </p>
        </div>

        <div className="inline-flex items-center rounded-2xl bg-green-50 px-3 py-2 text-[11px] font-semibold text-green-800">
          <UserCog size={15} className="mr-2" />
          Total Users: {usersCount}
        </div>
      </div>

      <div className="inline-flex rounded-2xl bg-[#F3F5F0] p-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-[14px] px-3 py-2 text-[11px] font-semibold transition ${
                isActive ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
              <span className="ml-1.5 text-[10px] text-gray-400">{tab.count}</span>
            </button>
          )
        })}
      </div>

      {activeTab === 'applications' ? (
        <Card className="rounded-[22px] p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-gray-900">Staff Applications</h2>
              <p className="mt-1 text-xs text-gray-500">
                Open an application to review documents, add complaints, and decide the outcome.
              </p>
            </div>

            <div className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-green-100 text-green-800">
              <FileBadge2 size={16} />
            </div>
          </div>

          <div className="mt-4 rounded-2xl bg-[#F8F8F6] p-4">
            <p className="text-[11px] text-gray-500">Applications Requiring Attention</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{pendingStaff.length}</p>
          </div>

          {pendingStaff.length === 0 ? (
            <div className="mt-4 rounded-2xl bg-[#F8F8F6] p-4 text-xs text-gray-600">
              No staff applications are pending right now.
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {paginatedApplications.map((application) => {
                const user = application.user
                const complaintCount = countApplicationComplaints(application)

                return (
                  <Link
                    key={application.id}
                    to={`/dashboard/users/applications/${application.id}`}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-[#FCFCFB] p-3.5 transition hover:border-green-200 hover:bg-green-50/40"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-semibold text-gray-900">
                          {getDisplayName(user)}
                        </p>
                        <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${getStatusTone(application.status)}`}>
                          {String(application.status || '').replace(/_/g, ' ')}
                        </span>
                        <span className="rounded-full bg-[#F3F5F0] px-2.5 py-1 text-[10px] font-semibold capitalize text-gray-700">
                          {application.applicant_type}
                        </span>
                        <span className="rounded-full bg-red-50 px-2.5 py-1 text-[10px] font-semibold text-red-700">
                          {complaintCount} complaint{complaintCount === 1 ? '' : 's'}
                        </span>
                      </div>
                      <p className="mt-1 truncate text-[11px] text-gray-500">
                        {user?.email || user?.username || 'No email'}
                      </p>
                      <p className="mt-1 text-[11px] text-gray-500">
                        {application.location || 'No location provided'}
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-2 text-[11px] font-semibold text-green-800">
                      Open review
                      <ChevronRight size={14} />
                    </div>
                  </Link>
                )
              })}

              <div className="flex flex-wrap items-center justify-between gap-3 px-1 pt-2">
                <p className="text-xs text-gray-500">
                  Page {Math.min(applicationPage, applicationPageCount)} of {applicationPageCount}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setApplicationPage((prev) => Math.max(1, prev - 1))}
                    disabled={applicationPage <= 1}
                    className="rounded-full bg-[#F3F5F0] px-3 py-1.5 text-[11px] font-semibold text-gray-700 transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Prev
                  </button>
                  <button
                    type="button"
                    onClick={() => setApplicationPage((prev) => Math.min(applicationPageCount, prev + 1))}
                    disabled={applicationPage >= applicationPageCount}
                    className="rounded-full bg-[#F3F5F0] px-3 py-1.5 text-[11px] font-semibold text-gray-700 transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </Card>
      ) : (
        <Card className="rounded-[22px] p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-sm font-bold text-gray-900">User Directory</h2>
              <p className="mt-1 text-xs text-gray-500">
                Search users and manage account access across the platform.
              </p>
            </div>

            <div className="grid gap-2 lg:w-[420px] lg:grid-cols-[1fr_140px]">
              <div className="relative">
                <Search
                  size={14}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search users"
                  className="h-9 w-full rounded-xl border border-gray-300 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-[#166534] focus:ring-4 focus:ring-green-100"
                />
              </div>

              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="h-9 rounded-xl border border-gray-300 bg-white px-3 text-sm outline-none transition focus:border-[#166534] focus:ring-4 focus:ring-green-100"
              >
                <option value="all">All roles</option>
                <option value="staff">Staff only</option>
                <option value="donor">Donors only</option>
              </select>
            </div>
          </div>

          {filteredUsers.length === 0 ? (
            <div className="mt-4 rounded-2xl bg-[#F8F8F6] p-4 text-xs text-gray-600">
              No matching users found.
            </div>
          ) : (
            <>
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr className="text-left">
                      <th className="pb-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-gray-500">
                        User
                      </th>
                      <th className="pb-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-gray-500">
                        Role
                      </th>
                      <th className="pb-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-gray-500">
                        Status
                      </th>
                      <th className="pb-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-gray-500">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paginatedUsers.map((user) => (
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
                        <td className="py-3 pr-4 text-[12px] text-gray-600">
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
                                ? 'Suspend'
                                : 'Reactivate'}
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
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 px-1">
                <p className="text-xs text-gray-500">
                  Page {Math.min(directoryPage, directoryPageCount)} of {directoryPageCount}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setDirectoryPage((prev) => Math.max(1, prev - 1))}
                    disabled={directoryPage <= 1}
                    className="rounded-full bg-[#F3F5F0] px-3 py-1.5 text-[11px] font-semibold text-gray-700 transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Prev
                  </button>
                  <button
                    type="button"
                    onClick={() => setDirectoryPage((prev) => Math.min(directoryPageCount, prev + 1))}
                    disabled={directoryPage >= directoryPageCount}
                    className="rounded-full bg-[#F3F5F0] px-3 py-1.5 text-[11px] font-semibold text-gray-700 transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </Card>
      )}
    </div>
  )
}

export default AdminUsersPage
