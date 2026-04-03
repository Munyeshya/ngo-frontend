import { useEffect, useMemo, useState } from 'react'
import { AlertCircle, Search, ShieldCheck, UserCheck, UserCog } from 'lucide-react'

import api from '../../api/axios'
import endpoints from '../../api/endpoints'
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

function AdminUsersPage() {
  const [users, setUsers] = useState([])
  const [usersCount, setUsersCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [adminActionError, setAdminActionError] = useState('')
  const [adminActionSuccess, setAdminActionSuccess] = useState('')
  const [updatingUserId, setUpdatingUserId] = useState(null)
  const [userSearch, setUserSearch] = useState('')

  async function loadUsers() {
    const response = await api.get(endpoints.users)
    const list = normalizeListResponse(response.data)
    setUsers(list)
    setUsersCount(getCountFromResponse(response.data, list))
  }

  useEffect(() => {
    let active = true

    async function initialize() {
      try {
        setLoading(true)
        setError('')
        const response = await api.get(endpoints.users)
        if (!active) return
        const list = normalizeListResponse(response.data)
        setUsers(list)
        setUsersCount(getCountFromResponse(response.data, list))
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
    return users.filter(
      (user) => String(user?.role || '').toLowerCase() === 'staff' && !user?.is_active
    )
  }, [users])

  const filteredUsers = useMemo(() => {
    const query = userSearch.trim().toLowerCase()

    if (!query) {
      return users.slice(0, 10)
    }

    return users
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
      .slice(0, 10)
  }, [users, userSearch])

  async function handleUserStatusUpdate(user, isActive) {
    try {
      setUpdatingUserId(user.id)
      setAdminActionError('')
      setAdminActionSuccess('')
      await api.patch(endpoints.userDetails(user.id), { is_active: isActive })
      await loadUsers()
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

      {(adminActionError || adminActionSuccess) && (
        <Card className={`p-4 ${adminActionError ? 'border-red-200' : 'border-green-200'}`}>
          <div
            className={`flex items-start gap-3 text-sm ${
              adminActionError ? 'text-red-700' : 'text-green-700'
            }`}
          >
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <span>{adminActionError || adminActionSuccess}</span>
          </div>
        </Card>
      )}

      <div className="grid gap-4 xl:grid-cols-[0.78fr_1.22fr]">
        <Card className="rounded-[22px] p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-gray-900">Pending Staff Approval</h2>
              <p className="mt-1 text-xs text-gray-500">
                Staff accounts waiting for admin action.
              </p>
            </div>

            <div className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-green-100 text-green-800">
              <UserCheck size={16} />
            </div>
          </div>

          <div className="mt-4 rounded-2xl bg-[#F8F8F6] p-4">
            <p className="text-[11px] text-gray-500">Pending Accounts</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{pendingStaff.length}</p>
          </div>

          {pendingStaff.length === 0 ? (
            <div className="mt-4 rounded-2xl bg-[#F8F8F6] p-4 text-xs text-gray-600">
              No staff applications are pending right now.
            </div>
          ) : (
            <div className="mt-4 space-y-2.5">
              {pendingStaff.slice(0, 6).map((user) => (
                <div
                  key={user.id}
                  className="rounded-2xl border border-gray-200 bg-[#FCFCFB] p-3.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-gray-900">
                        {getDisplayName(user)}
                      </p>
                      <p className="mt-1 truncate text-[11px] text-gray-500">
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

        <Card className="rounded-[22px] p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-sm font-bold text-gray-900">User Directory</h2>
              <p className="mt-1 text-xs text-gray-500">
                Search users and manage staff account activation.
              </p>
            </div>

            <div className="relative lg:w-[280px]">
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
          </div>

          {filteredUsers.length === 0 ? (
            <div className="mt-4 rounded-2xl bg-[#F8F8F6] p-4 text-xs text-gray-600">
              No matching users found.
            </div>
          ) : (
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
  )
}

export default AdminUsersPage
