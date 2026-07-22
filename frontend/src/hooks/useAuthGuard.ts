import { useEffect, useRef } from 'react'
import { jwtDecode } from 'jwt-decode'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'

export const useAuthGuard = () => {
  const navigate = useNavigate()
  const checking = useRef(false);

  const verifyToken = async () => {
    if (checking.current) return;

    checking.current = true;

    const token = localStorage.getItem('token')

    // no token
    if (!token || token === 'undefined') {
      navigate('/')
      return
    }

    // fake/corrupted token
    try {
      jwtDecode(token)
    } catch {
      localStorage.removeItem('token')
      navigate('/')
      return
    }

    // decode and check expiry
    try {
      const decoded: { exp: number } = jwtDecode(token)
      const now = Date.now() / 1000

      // token still valid — no need to call API
      if (decoded.exp > now) return

      // token expired — call verify-token
      // axios interceptor will auto-refresh and retry
      await api.get('/auth/verify-token')

    } catch {
      // refresh also failed
      localStorage.removeItem('token')
      navigate('/')
    }
    finally{
      checking.current = false;
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