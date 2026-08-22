import { io } from 'socket.io-client'
import { getAccessToken } from '../api/axios'

const socket = io('/', {
  auth: (cb) => {
    cb({ token: getAccessToken() })
  },
  autoConnect: false,
  path: '/socket.io'
})

export default socket