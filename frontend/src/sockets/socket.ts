import { io } from 'socket.io-client'

const socket = io('/', {  // not http://localhost:3000
  auth: {
    token: localStorage.getItem('token')
  },
  autoConnect: false,
  path: '/socket.io'
})

export default socket