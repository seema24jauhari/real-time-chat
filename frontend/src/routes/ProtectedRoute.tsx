import { useEffect, useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { jwtDecode } from 'jwt-decode'
import api from '../api/axios'

const ProtectedRoute = () => {
  const [status, setStatus] = useState<'checking' | 'valid' | 'invalid'>('checking')

  useEffect(() => {
    const check = async () => {
      const token = localStorage.getItem('token')
    
      // no token
      if (!token || token === 'undefined') {
        localStorage.removeItem('token')
        setStatus('invalid')
        return
      }

      // fake token
      try {
        jwtDecode(token)
      } catch {
        localStorage.removeItem('token')
        setStatus('invalid')
        return
      }

      try {
        const decoded: { exp: number } = jwtDecode(token)
        const now = Date.now() / 1000

        // token valid and not expired
        if (decoded.exp > now) {
          setStatus('valid')
          return
        }

        // token expired — verify with backend
        // interceptor handles refresh automatically
        await api.get('/auth/verify-token')
        setStatus('valid')

      } catch {
        localStorage.removeItem('token')
        setStatus('invalid')
      }
    }

    check()
  }, [])

  if (status === 'checking') {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0d0d0d]">
        <div className="text-white text-[0.85rem]">Verifying session...</div>
      </div>
    )
  }

  return status === 'valid' ? <Outlet /> : <Navigate to="/" replace />
}

export default ProtectedRoute