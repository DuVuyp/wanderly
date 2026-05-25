import { Navigate, Outlet } from 'react-router-dom'
import { getDefaultRouteByRole, getStoredUser, isAuthenticated } from '../../utils/auth'

function PublicOnlyRoute() {
  const user = getStoredUser()

  if (isAuthenticated()) {
    return <Navigate to={getDefaultRouteByRole(user?.role)} replace />
  }

  return <Outlet />
}

export default PublicOnlyRoute
