import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { getToken, getUser } from '../utils/storage'

function ProtectedRoute({ allowedRoles = [] }) {
  const location = useLocation()
  const token = getToken()
  const user = getUser()

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />
  }

  return <Outlet />
}

export default ProtectedRoute