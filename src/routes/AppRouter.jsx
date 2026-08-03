import { BrowserRouter, Routes, Route } from 'react-router-dom'
import PublicLayout from '../layouts/PublicLayout'
import AuthLayout from '../layouts/AuthLayout'
import DonorLayout from '../layouts/DonorLayout'
import DashboardLayout from '../layouts/DashboardLayout'
import ProtectedRoute from './ProtectedRoute'

import HomePage from '../pages/public/HomePage'
import ProjectsPage from '../pages/public/ProjectsPage'
import AboutPage from '../pages/public/AboutPage'
import ContactPage from '../pages/public/ContactPage'
import ApiGuidePage from '../pages/public/ApiGuidePage'
import LoginPage from '../pages/auth/LoginPage'
import RegisterPage from '../pages/auth/RegisterPage'
import ClaimDonorAccountPage from '../pages/auth/ClaimDonorAccountPage'
import StaffGuidePage from '../pages/auth/StaffGuidePage'
import DonorProfilePage from '../pages/donor/DonorProfilePage'
import DonorDashboardPage from '../pages/donor/DonorDashboardPage'
import DonorDonationHistoryPage from '../pages/donor/DonorDonationHistoryPage'
import DonorSubscriptionsPage from '../pages/donor/DonorSubscriptionsPage'

import DashboardHomePage from '../pages/dashboard/DashboardHomePage'
import DashboardProjectsPage from '../pages/dashboard/DashboardProjectsPage'
import DashboardProjectWorkspacePage from '../pages/dashboard/DashboardProjectWorkspacePage'
import StaffProfilePage from '../pages/dashboard/StaffProfilePage'
import StaffSettingsPage from '../pages/dashboard/StaffSettingsPage'
import AdminUsersPage from '../pages/dashboard/AdminUsersPage'
import AdminUserApplicationDetailsPage from '../pages/dashboard/AdminUserApplicationDetailsPage'
import AdminPartnersPage from '../pages/dashboard/AdminPartnersPage'
import AdminReportsPage from '../pages/dashboard/AdminReportsPage'
import AdminReportDetailsPage from '../pages/dashboard/AdminReportDetailsPage'
import AdminProjectReviewsPage from '../pages/dashboard/AdminProjectReviewsPage'
import CashoutRequestsPage from '../pages/dashboard/CashoutRequestsPage'

import UnauthorizedPage from '../pages/shared/UnauthorizedPage'
import NotFoundPage from '../pages/shared/NotFoundPage'
import ProjectDetailsPage from '../pages/public/ProjectDetailsPage'
import DonatePage from '../pages/public/DonatePage'
import ProjectTransparencyReportPage from '../pages/public/ProjectTransparencyReportPage'

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/projects/:projectId/transparency-report" element={<ProjectTransparencyReportPage />} />
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/frontend-guide" element={<ApiGuidePage />} />
          <Route path="/projects/:projectId" element={<ProjectDetailsPage />} />
          <Route path="/donate/:projectId" element={<DonatePage />} />
        </Route>

        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/claim-donor-account" element={<ClaimDonorAccountPage />} />
          <Route
            path="/claim-donor-account/verify"
            element={<ClaimDonorAccountPage />}
          />
          <Route path="/staff-guide" element={<StaffGuidePage />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['donor']} />}>
          <Route element={<DonorLayout />}>
            <Route path="/donor/dashboard" element={<DonorDashboardPage />} />
            <Route path="/donor/donations" element={<DonorDonationHistoryPage />} />
            <Route path="/donor/subscriptions" element={<DonorSubscriptionsPage />} />
            <Route path="/donor/profile" element={<DonorProfilePage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['admin', 'staff']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardHomePage />} />
            <Route path="/dashboard/profile" element={<StaffProfilePage />} />
            <Route path="/dashboard/cashouts" element={<CashoutRequestsPage />} />
            <Route element={<ProtectedRoute allowedRoles={['staff']} />}>
              <Route path="/dashboard/settings" element={<StaffSettingsPage />} />
              <Route path="/dashboard/projects" element={<DashboardProjectsPage />} />
              <Route
                path="/dashboard/projects/:projectId"
                element={<DashboardProjectWorkspacePage />}
              />
            </Route>
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="/dashboard/project-reviews" element={<AdminProjectReviewsPage />} />
              <Route path="/dashboard/users" element={<AdminUsersPage />} />
              <Route
                path="/dashboard/users/applications/:applicationId"
                element={<AdminUserApplicationDetailsPage />}
              />
              <Route path="/dashboard/reports" element={<AdminReportsPage />} />
              <Route path="/dashboard/reports/:projectId" element={<AdminReportDetailsPage />} />
              <Route path="/dashboard/partners" element={<AdminPartnersPage />} />
            </Route>
          </Route>
        </Route>

        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRouter
