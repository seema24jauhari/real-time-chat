import { io } from 'socket.io-client'

const socket = io('/', {
  auth: (cb) => {
    cb({ token: localStorage.getItem('token') })
  },
  autoConnect: false,
  path: '/socket.io'
})

export default socket