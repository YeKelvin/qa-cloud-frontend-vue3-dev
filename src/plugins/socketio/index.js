import { io } from 'socket.io-client'

const DEFAULT_OPTIONS = {
  autoConnect: false,
  transports: import.meta.env.VITE_APP_ENV === 'production' ? ['websocket', 'polling'] : ['polling']
}

export default {
  install: (app, { connection = import.meta.env.VITE_APP_BASE_SOCKET, options = DEFAULT_OPTIONS }) => {
    const socket = io(connection, options)
    app.config.globalProperties.$socket = socket
    app.provide('socket', socket)
  }
}
