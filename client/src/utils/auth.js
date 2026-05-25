export const getStoredUser = () => {
  try {
    const rawUser = localStorage.getItem('user')
    return rawUser ? JSON.parse(rawUser) : null
  } catch {
    return null
  }
}

export const getAccessToken = () => localStorage.getItem('accessToken')

export const isAuthenticated = () => Boolean(getAccessToken() && getStoredUser())

export const clearAuthStorage = () => {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('user')
}

export const getDefaultRouteByRole = (role) => {
  if (role === 'provider') {
    return '/provider'
  }

  return '/home'
}
