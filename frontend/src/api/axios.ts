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
  (response) => response, // success — just return
  async (error) => {
    const originalRequest = error.config

    // if 401 and haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true // mark so we don't retry forever

      try {
        // call refresh endpoint
        const res = await axios.post('/api/auth/refresh', {}, {
          withCredentials: true // refresh token is in cookie
        })

        const newToken = res.data.access_token
        localStorage.setItem('token', newToken)

        // update the failed request with new token and retry
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return api(originalRequest)

      } catch (refreshError) {
        // refresh also failed — token fully expired, logout
        localStorage.removeItem('token')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default api