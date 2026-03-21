import { Navigate, Outlet } from 'react-router-dom'
import { getToken, getUser } from '../utils/storage'

function ProtectedRoute({ allowedRoles = [] }) {
  const token = getToken()
  const user = getUser()

  if (!token) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />
  }

  return <Outlet />
}

export default ProtectedRoute