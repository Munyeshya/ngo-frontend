import {
  LayoutDashboard,
  FolderKanban,
  Users,
  HandCoins,
  Bell,
  BriefcaseBusiness,
  LogOut,
  ArrowLeft,
} from 'lucide-react'
import { Link, NavLink, useNavigate } from 'react-router-dom'

import api from '../../api/axios'
import endpoints from '../../api/endpoints'
import { clearAuth, getUser } from '../../utils/storage'

const items = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Projects', href: '/dashboard/projects', icon: FolderKanban },
  { name: 'Beneficiaries', href: '/dashboard/beneficiaries', icon: Users },
  { name: 'Donations', href: '/dashboard/donations', icon: HandCoins },
  { name: 'Updates', href: '/dashboard/updates', icon: Bell },
]

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

function DashboardSidebar() {
  const navigate = useNavigate()
  const user = getUser()

  const displayName = getDisplayName(user)
  const initials = getInitials(displayName)
  const role = user?.role || 'staff'

  async function handleLogout() {
    try {
      const refresh = localStorage.getItem('ngo_refresh_token')

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
    <aside className="flex h-full w-[272px] flex-col bg-[#166534] text-white">
      <div className="border-b border-white/10 px-5 py-5">
        <Link to="/" className="inline-flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/12 text-white ring-1 ring-white/15">
            <BriefcaseBusiness size={18} />
          </div>

          <div>
            <p className="text-sm font-semibold text-white">NGO Platform</p>
            <p className="text-[11px] uppercase tracking-[0.16em] text-white/75">Admin / Staff Portal</p>
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
              <p className="truncate text-[11px] capitalize tracking-[0.08em] text-white/75">{role}</p>
            </div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 pb-3">
        <p className="px-3.5 pb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/75">
          Navigation
        </p>
        <div className="space-y-1">
          {items.map((item) => {
            const Icon = item.icon

            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm font-semibold transition-colors duration-200 ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-900 ring-1 ring-emerald-100 shadow-[0_10px_24px_rgba(15,23,42,0.22)]'
                      : 'text-white hover:bg-[#0f4d27] hover:text-white focus-visible:bg-[#0f4d27] focus-visible:text-white'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon size={17} className="shrink-0" />
                    <span
                      className={`tracking-[0.01em] ${
                        isActive ? 'text-emerald-900' : 'text-white'
                      }`}
                    >
                      {item.name}
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
            className="flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#0f4d27] hover:text-white"
          >
            <ArrowLeft size={17} />
            <span className="text-white">Back to Public Site</span>
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
    </aside>
  )
}

export default DashboardSidebar
