import { useEffect, useMemo, useRef } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  HandCoins,
  Bell,
  UserCircle2,
  LogOut,
  ArrowLeft,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react'
import { useState } from 'react'

import api from '../api/axios'
import endpoints from '../api/endpoints'
import { clearAuth, getRefreshToken, getUser } from '../utils/storage'

function getInitials(name) {
  if (!name) return 'U'

  const parts = String(name).trim().split(/\s+/).filter(Boolean)
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase()

  return `${parts[0][0] || ''}${parts[1][0] || ''}`.toUpperCase()
}

function buildDisplayName(user) {
  if (!user) return 'Donor'

  const fullName =
    user.full_name ||
    [user.first_name, user.last_name].filter(Boolean).join(' ').trim() ||
    user.name ||
    user.username ||
    'Donor'

  return fullName
}

function DonorLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const accountRef = useRef(null)

  const user = useMemo(() => getUser(), [location.pathname, accountOpen])
  const displayName = buildDisplayName(user)
  const email = user?.email || 'No email available'
  const initials = getInitials(displayName)

  const navItems = [
    {
      label: 'Dashboard',
      to: '/donor/dashboard',
      icon: LayoutDashboard,
    },
    {
      label: 'My Donations',
      to: '/donor/donations',
      icon: HandCoins,
    },
    {
      label: 'Subscriptions',
      to: '/donor/subscriptions',
      icon: Bell,
    },
  ]

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
    const refresh = getRefreshToken()

    try {
      if (refresh) {
        await api.post(endpoints.logout, { refresh })
      }
    } catch {
    } finally {
      clearAuth()
      navigate('/login', { replace: true })
    }
  }

  function SidebarContent() {
    return (
      <div className="flex h-full flex-col">
        <div className="border-b border-white/10 px-5 py-5">
          <Link to="/" className="inline-flex items-center gap-2 text-white">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/12 text-base font-bold text-white ring-1 ring-white/15">
              N
            </div>
            <div>
              <p className="text-sm font-semibold text-white">NGO Platform</p>
              <p className="text-[11px] uppercase tracking-[0.16em] text-white/75">Donor Portal</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-3 py-4">
          <p className="px-3.5 pb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/75">
            Navigation
          </p>
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm font-semibold transition-colors duration-200 ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-900 ring-1 ring-emerald-100 shadow-[0_10px_24px_rgba(15,23,42,0.22)]'
                        : 'text-white hover:bg-[#0f4d27] hover:text-white'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        size={17}
                        className={`shrink-0 ${
                          isActive ? 'text-emerald-900' : 'text-white'
                        }`}
                      />
                      <span
                        className={`tracking-[0.01em] ${
                          isActive ? 'text-emerald-900' : 'text-white'
                        }`}
                      >
                        {item.label}
                      </span>
                    </>
                  )}
                </NavLink>
              )
            })}
          </div>

          <div className="mt-5 border-t border-white/10 pt-5">
            <Link
              to="/projects"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#0f4d27] hover:text-white"
            >
              <ArrowLeft size={17} className="text-white" />
              <span className="text-white">Browse Projects</span>
            </Link>
          </div>
        </nav>
      </div>
    )
  }

  return (
    <div className="donor-app bg-[#F6F8F4]">
      <div className="lg:hidden">
        <div className="sticky top-0 z-40 border-b border-gray-200 bg-white/90 backdrop-blur">
          <div className="flex items-center justify-between px-4 py-3.5">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#166534] text-sm font-bold text-white">
                N
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">NGO Platform</p>
                <p className="text-xs text-gray-500">Donor Portal</p>
              </div>
            </Link>

            <button
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-700"
            >
              {mobileOpen ? <X size={19} /> : <Menu size={19} />}
            </button>
          </div>

          {mobileOpen && (
            <div className="border-t border-gray-200 bg-[#166534]">
              <SidebarContent />
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto flex h-screen max-w-[1600px] overflow-hidden">
        <aside className="hidden h-screen w-[272px] shrink-0 bg-[#166534] lg:block">
          <SidebarContent />
        </aside>

        <div className="donor-content min-w-0 flex-1">
          <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/90 backdrop-blur">
            <div className="flex items-center justify-between px-4 py-3 sm:px-5 lg:px-6">
              <div>
                <h1 className="text-base font-bold text-gray-900">Donor Portal</h1>
                <p className="text-xs text-gray-500 sm:text-sm">
                  Track your donations, interests, and project engagement.
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
                      Donor
                    </p>
                  </div>
                  <ChevronDown size={16} className="text-gray-500" />
                </button>

                {accountOpen && (
                  <div className="absolute right-0 mt-3 w-64 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_20px_60px_rgba(16,24,40,0.12)]">
                    <div className="border-b border-gray-100 px-4 py-4">
                      <p className="truncate text-sm font-semibold text-gray-900">{displayName}</p>
                      <p className="truncate text-xs text-gray-500">{email}</p>
                    </div>

                    <div className="p-2">
                      <Link
                        to="/donor/profile"
                        onClick={() => setAccountOpen(false)}
                        className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-gray-700 transition hover:bg-green-50 hover:text-green-800"
                      >
                        <UserCircle2 size={18} />
                        Profile
                      </Link>

                      <Link
                        to="/projects"
                        onClick={() => setAccountOpen(false)}
                        className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-gray-700 transition hover:bg-green-50 hover:text-green-800"
                      >
                        <ArrowLeft size={18} />
                        Browse projects
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

export default DonorLayout
