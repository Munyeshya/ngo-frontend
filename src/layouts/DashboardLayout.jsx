import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, Outlet, useNavigate } from 'react-router-dom'
import { ChevronDown, LogOut, Settings, UserCircle2 } from 'lucide-react'

import api from '../api/axios'
import endpoints from '../api/endpoints'
import DashboardSidebar from '../components/layout/DashboardSidebar'
import { clearAuth, getRefreshToken, getUser } from '../utils/storage'

function getDisplayName(user) {
  if (!user) return 'Staff User'

  return (
    user.full_name ||
    [user.first_name, user.last_name].filter(Boolean).join(' ').trim() ||
    user.username ||
    user.email ||
    'Staff User'
  )
}

function getInitials(name) {
  if (!name) return 'S'
  const parts = String(name).trim().split(/\s+/).filter(Boolean)
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase()
  return `${parts[0][0] || ''}${parts[1][0] || ''}`.toUpperCase()
}

function DashboardLayout() {
  const navigate = useNavigate()
  const accountRef = useRef(null)
  const [accountOpen, setAccountOpen] = useState(false)
  const user = getUser()

  const displayName = useMemo(() => getDisplayName(user), [user])
  const initials = useMemo(() => getInitials(displayName), [displayName])
  const role = String(user?.role || 'staff')

  useEffect(() => {
    function handleClickOutside(event) {
      if (accountRef.current && !accountRef.current.contains(event.target)) {
        setAccountOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  async function handleLogout() {
    try {
      const refresh = getRefreshToken()

      if (refresh) {
        await api.post(endpoints.logout, { refresh })
      }
    } catch {
    } finally {
      clearAuth()
      navigate('/login', { replace: true })
    }
  }

  return (
    <div className="dashboard-app bg-[#F6F8F4]">
      <div className="mx-auto flex h-screen max-w-[1600px] overflow-hidden">
        <aside className="hidden h-screen w-[272px] shrink-0 bg-[#166534] lg:block">
          <DashboardSidebar />
        </aside>

        <div className="dashboard-content min-w-0 flex-1">
          <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/90 backdrop-blur">
            <div className="flex items-center justify-between px-4 py-3 sm:px-5 lg:px-6">
              <div>
                <h1 className="text-base font-bold text-gray-900">Management Portal</h1>
                <p className="text-xs text-gray-500 sm:text-sm">
                  Monitor projects, donations, beneficiaries, and platform activity.
                </p>
              </div>

              <div className="relative" ref={accountRef}>
                <button
                  type="button"
                  onClick={() => setAccountOpen((prev) => !prev)}
                  className="inline-flex h-11 items-center gap-3 rounded-2xl border border-gray-200 bg-white px-3 text-gray-900 shadow-sm transition hover:border-green-200 hover:bg-green-50"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#166534] text-xs font-bold text-white">
                    {initials}
                  </div>
                  <div className="hidden text-right sm:block">
                    <p className="max-w-[140px] truncate text-sm font-semibold">
                      {displayName}
                    </p>
                    <p className="text-[11px] uppercase tracking-[0.12em] text-gray-500">
                      {role}
                    </p>
                  </div>
                  <ChevronDown size={16} className="text-gray-500" />
                </button>

                {accountOpen && (
                  <div className="absolute right-0 mt-3 w-64 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_20px_60px_rgba(16,24,40,0.12)]">
                    <div className="border-b border-gray-100 px-4 py-4">
                      <p className="truncate text-sm font-semibold text-gray-900">{displayName}</p>
                      <p className="truncate text-xs text-gray-500">
                        {user?.email || user?.username || 'No email available'}
                      </p>
                    </div>

                    <div className="p-2">
                      <div className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-gray-700">
                        <Settings size={18} />
                        <span className="capitalize">{role} account</span>
                      </div>

                      <Link
                        to="/"
                        onClick={() => setAccountOpen(false)}
                        className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-gray-700 transition hover:bg-green-50 hover:text-green-800"
                      >
                        <UserCircle2 size={18} />
                        Public site
                      </Link>

                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
                      >
                        <LogOut size={18} />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>

          <main className="px-4 py-4 sm:px-5 lg:px-6 lg:py-5">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}

export default DashboardLayout
