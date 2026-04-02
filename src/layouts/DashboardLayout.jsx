import { Outlet } from 'react-router-dom'
import DashboardSidebar from '../components/layout/DashboardSidebar'

function DashboardLayout() {
  return (
    <div className="dashboard-app bg-[#F6F8F4]">
      <div className="mx-auto flex h-screen max-w-[1600px] overflow-hidden">
        <aside className="hidden h-screen w-[272px] shrink-0 bg-[#0F172A] lg:block">
          <DashboardSidebar />
        </aside>

        <div className="dashboard-content min-w-0 flex-1">
          <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/90 backdrop-blur">
            <div className="px-4 py-3 sm:px-5 lg:px-6">
              <h1 className="text-base font-bold text-gray-900">Management Portal</h1>
              <p className="text-xs text-gray-500 sm:text-sm">
                Monitor projects, donations, beneficiaries, and platform activity.
              </p>
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
