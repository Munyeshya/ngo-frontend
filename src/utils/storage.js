const TOKEN_KEY = 'ngo_access_token'
const REFRESH_TOKEN_KEY = 'ngo_refresh_token'
const USER_KEY = 'ngo_user'

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function removeToken() {
  localStorage.removeItem(TOKEN_KEY)
}

export function setRefreshToken(token) {
  localStorage.setItem(REFRESH_TOKEN_KEY, token)
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

export function removeRefreshToken() {
  localStorage.removeItem(REFRESH_TOKEN_KEY)
}

export function setUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function getUser() {
  try {
    const rawUser = localStorage.getItem(USER_KEY)
    return rawUser ? JSON.parse(rawUser) : null
  } catch {
    return null
  }
}

export function removeUser() {
  localStorage.removeItem(USER_KEY)
}

export function setAuth({ access, refresh, user }) {
  if (access) setToken(access)
  if (refresh) setRefreshToken(refresh)
  if (user) setUser(user)
}

export function clearAuth() {
  removeToken()
  removeRefreshToken()
  removeUser()
}