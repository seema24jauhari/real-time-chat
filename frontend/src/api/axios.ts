import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
})

// attach access token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// catch 401 and refresh automatically
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // skip refresh for auth routes — these 401s are legitimate failures
    const isAuthRoute = originalRequest.url?.includes('/auth/login') ||
                        originalRequest.url?.includes('/auth/register') ||
                        originalRequest.url?.includes('/auth/refresh')

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthRoute  // add this check
    ) {
      const token = localStorage.getItem('token')
      if (!token) return Promise.reject(error)

      originalRequest._retry = true

      try {
        const res = await axios.post('/api/auth/refresh', {}, {
          withCredentials: true
        })

        const newToken = res.data.access_token
        localStorage.setItem('token', newToken)
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return api(originalRequest)

      } catch (refreshError) {
        localStorage.removeItem('token')
        window.location.href = '/'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)
export default api