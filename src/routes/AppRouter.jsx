import { BrowserRouter, Routes, Route } from 'react-router-dom'
import PublicLayout from '../layouts/PublicLayout'
import AuthLayout from '../layouts/AuthLayout'
import DonorLayout from '../layouts/DonorLayout'
import DashboardLayout from '../layouts/DashboardLayout'
import ProtectedRoute from './ProtectedRoute'

import HomePage from '../pages/public/HomePage'
import ProjectsPage from '../pages/public/ProjectsPage'
import LoginPage from '../pages/auth/LoginPage'
import DonorProfilePage from '../pages/donor/DonorProfilePage'
import DashboardHomePage from '../pages/dashboard/DashboardHomePage'
import UnauthorizedPage from '../pages/shared/UnauthorizedPage'
import NotFoundPage from '../pages/shared/NotFoundPage'

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/projects" element={<ProjectsPage />} />
        </Route>

        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['donor']} />}>
          <Route element={<DonorLayout />}>
            <Route path="/donor/profile" element={<DonorProfilePage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['admin', 'staff']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardHomePage />} />
          </Route>
        </Route>

        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRouter