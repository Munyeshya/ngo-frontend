import { Outlet } from 'react-router-dom'
import DashboardSidebar from '../components/layout/DashboardSidebar'

function DashboardLayout() {
  return (
    <div className="min-h-screen bg-[#F6F8F4]">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <aside className="hidden w-[290px] shrink-0 bg-[#0F172A] lg:block">
          <DashboardSidebar />
        </aside>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/85 backdrop-blur">
            <div className="px-5 py-4 sm:px-6 lg:px-8">
              <h1 className="text-lg font-bold text-gray-900">Management Portal</h1>
              <p className="text-sm text-gray-500">
                Monitor projects, donations, beneficiaries, and platform activity.
              </p>
            </div>
          </header>

          <main className="px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}

export default DashboardLayout