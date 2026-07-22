import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import ChatRoom from './pages/ChatRoom'
import PublicRoute from './routes/PublicRoute'
import ProtectedRoute from './routes/ProtectedRoute'
import ForgetPassword from './pages/ForgetPassword'
import ResetPassword from './pages/ResetPassword'

function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route element={<PublicRoute />}>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forget-password" element={<ForgetPassword />} />
            <Route path='/reset-password' element={<ResetPassword />} />
          </Route>
          <Route element={<ProtectedRoute />}>
             <Route path='/chatroom' element={<ChatRoom />} />
         </Route>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
