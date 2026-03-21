import { Outlet } from 'react-router-dom'
import DashboardSidebar from '../components/layout/DashboardSidebar'

function DashboardLayout() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar />
      <main className="flex-1 p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  )
}

export default DashboardLayout