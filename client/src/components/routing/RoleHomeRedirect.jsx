import { Navigate } from 'react-router-dom'
import { getDefaultRouteByRole, getStoredUser, isAuthenticated } from '../../utils/auth'

function RoleHomeRedirect() {
  const user = getStoredUser()

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />
  }

  return <Navigate to={getDefaultRouteByRole(user?.role)} replace />
}

export default RoleHomeRedirect
