import { useEffect, useRef } from 'react'
import { jwtDecode } from 'jwt-decode'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

export const useAuthGuard = () => {
  const navigate = useNavigate()
  const checking = useRef(false)

  const verifyToken = async () => {
    if (checking.current) return
    checking.current = true

    try {
      const token = localStorage.getItem('token')

      // no token
      if (!token || token === 'undefined') {
        navigate('/')
        return
      }

      // fake/corrupted token
      let decoded: { exp: number }
      try {
        decoded = jwtDecode(token)
      } catch {
        localStorage.removeItem('token')
        navigate('/')
        return
      }

      const now = Date.now() / 1000

      // token still valid — nothing to do
      if (decoded.exp > now) return

      // token expired — refresh directly (don't call a guard-protected
      // endpoint, since it can only fail for an already-expired token)
      const res = await axios.post(
        '/api/auth/refresh',
        {},
        { withCredentials: true },
      )
      localStorage.setItem('token', res.data.access_token)

    } catch {
      // refresh failed too — force re-login
      localStorage.removeItem('token')
      navigate('/')
    } finally {
      checking.current = false
    }
  }

  useEffect(() => {
    // check on mount
    verifyToken()

    // check when user comes back to tab
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        verifyToken()
      }
    }

    // check when window gets focus
    const handleFocus = () => verifyToken()

    document.addEventListener('visibilitychange', handleVisibility)
    window.addEventListener('focus', handleFocus)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility)
      window.removeEventListener('focus', handleFocus)
    }
  }, [])
}