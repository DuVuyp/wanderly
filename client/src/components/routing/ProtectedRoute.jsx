import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { getDefaultRouteByRole, getStoredUser, isAuthenticated } from '../../utils/auth'

function ProtectedRoute({ allowedRoles }) {
  const location = useLocation()
  const user = getStoredUser()

  if (!isAuthenticated()) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location,
          authRequired: true,
          message: 'Please sign in to continue.',
        }}
      />
    )
  }

  if (allowedRoles?.length && !allowedRoles.includes(user?.role)) {
    return <Navigate to={getDefaultRouteByRole(user?.role)} replace />
  }

  return <Outlet />
}

export default ProtectedRoute
