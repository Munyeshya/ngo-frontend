import { LayoutDashboard, FolderKanban, Users, HandCoins } from 'lucide-react'
import { Link } from 'react-router-dom'

const items = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Projects', href: '/dashboard/projects', icon: FolderKanban },
  { name: 'Beneficiaries', href: '/dashboard/beneficiaries', icon: Users },
  { name: 'Donations', href: '/dashboard/donations', icon: HandCoins },
]

function DashboardSidebar() {
  return (
    <aside className="hidden w-72 border-r border-gray-200 bg-white lg:block">
      <div className="p-6">
        <p className="text-lg font-bold text-green-800">Admin / Staff</p>
      </div>

      <nav className="space-y-2 px-4 pb-6">
        {items.map((item) => {
          const Icon = item.icon

          return (
            <Link
              key={item.name}
              to={item.href}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-green-50 hover:text-green-800"
            >
              <Icon size={18} />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}

export default DashboardSidebar