import {
  LayoutDashboard,
  FolderKanban,
  BriefcaseBusiness,
  ArrowLeft,
  Users,
  Handshake,
  ShieldAlert,
  CircleDollarSign,
} from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'
import { getUser } from '../../utils/storage'

function DashboardSidebar() {
  const user = getUser()
  const isAdmin = String(user?.role || '').toLowerCase() === 'admin'
  const portalLabel = isAdmin ? 'Admin Portal' : 'Staff Workspace'
  const items = isAdmin
    ? [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Project Reviews', href: '/dashboard/project-reviews', icon: FolderKanban },
        { name: 'Reports', href: '/dashboard/reports', icon: ShieldAlert },
        { name: 'Cashout Requests', href: '/dashboard/cashouts', icon: CircleDollarSign },
        { name: 'User Management', href: '/dashboard/users', icon: Users },
        { name: 'Partners', href: '/dashboard/partners', icon: Handshake },
      ]
    : [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Projects', href: '/dashboard/projects', icon: FolderKanban },
        { name: 'Cashout Requests', href: '/dashboard/cashouts', icon: CircleDollarSign },
      ]

  return (
    <aside className="flex h-full w-[272px] flex-col bg-[#166534] text-white">
      <div className="border-b border-white/10 px-5 py-5">
        <Link to="/" className="inline-flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/12 text-white ring-1 ring-white/15">
            <BriefcaseBusiness size={18} />
          </div>

          <div>
            <p className="text-sm font-semibold text-white">NGO Transparency</p>
            <p className="text-[11px] uppercase tracking-[0.16em] text-white/75">{portalLabel}</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 px-3 py-4">
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
                end={item.href === '/dashboard'}
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
    </aside>
  )
}

export default DashboardSidebar
