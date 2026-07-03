import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import ChatRoom from './pages/ChatRoom'
import PublicRoute from './routes/PublicRoute'
import ProtectedRoute from './routes/ProtectedRoute'

function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route element={<PublicRoute />}>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>
          <Route path='/chatroom' element={<ProtectedRoute><ChatRoom /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
