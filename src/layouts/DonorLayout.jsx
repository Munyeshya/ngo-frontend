import { useMemo } from 'react'
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
} from 'lucide-react'
import { useState } from 'react'

import api from '../api/axios'
import endpoints from '../api/endpoints'

function getStoredUser() {
  try {
    const raw = localStorage.getItem('ngo_user')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

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

  const user = useMemo(() => getStoredUser(), [location.pathname])
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
    {
      label: 'Profile',
      to: '/donor/profile',
      icon: UserCircle2,
    },
  ]

  async function handleLogout() {
    const refresh = localStorage.getItem('ngo_refresh_token')

    try {
      if (refresh) {
        await api.post(endpoints.logout, { refresh })
      }
    } catch {
    } finally {
      localStorage.removeItem('ngo_access_token')
      localStorage.removeItem('ngo_refresh_token')
      localStorage.removeItem('ngo_user')
      delete api.defaults.headers.common.Authorization
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

        <div className="px-4 py-4">
          <div className="rounded-3xl border border-white/12 bg-[#14532d] p-3.5 ring-1 ring-white/6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/12 text-sm font-bold text-white ring-1 ring-white/15">
                {initials}
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">{displayName}</p>
                <p className="truncate text-[11px] text-white/75">{email}</p>
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 pb-3">
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
              <ArrowLeft size={17} />
              <span className="text-white">Browse Projects</span>
            </Link>
          </div>
        </nav>

        <div className="border-t border-white/10 p-4">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/12 bg-[#14532d] px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#0f4d27]"
          >
            <LogOut size={17} />
            Logout
          </button>
        </div>
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

              <div className="hidden items-center gap-3 sm:flex">
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{displayName}</p>
                  <p className="text-xs text-gray-500">{email}</p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#166534] text-sm font-bold text-white">
                  {initials}
                </div>
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
