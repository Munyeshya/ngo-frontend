import axios from 'axios'
import {
  getToken,
  getRefreshToken,
  setToken,
  setRefreshToken,
  clearAuth,
} from '../utils/storage'

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use(
  (config) => {
    const token = getToken()

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    const refreshToken = getRefreshToken()
    const status = error?.response?.status

    const isLoginRequest = originalRequest?.url?.includes('/users/login/')
    const isRefreshRequest = originalRequest?.url?.includes('/users/token/refresh/')

    if (
      status === 401 &&
      !originalRequest?._retry &&
      refreshToken &&
      !isLoginRequest &&
      !isRefreshRequest
    ) {
      originalRequest._retry = true

      try {
        const refreshResponse = await axios.post(
          'http://127.0.0.1:8000/api/users/token/refresh/',
          {
            refresh: refreshToken,
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        )

        const newAccess = refreshResponse?.data?.access
        const newRefresh = refreshResponse?.data?.refresh

        if (!newAccess) {
          throw new Error('No access token returned from refresh endpoint.')
        }

        setToken(newAccess)

        if (newRefresh) {
          setRefreshToken(newRefresh)
        }

        api.defaults.headers.common.Authorization = `Bearer ${newAccess}`
        originalRequest.headers.Authorization = `Bearer ${newAccess}`

        return api(originalRequest)
      } catch (refreshError) {
        clearAuth()
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default api