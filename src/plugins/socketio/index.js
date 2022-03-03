import { io } from 'socket.io-client'

/**
 * 默认 socket 连接地址
 */
const DEFAULT_URL = import.meta.env.VITE_APP_BASE_SOCKET

/**
 * 默认 socket 配置
 */
const DEFAULT_OPTIONS = {
  autoConnect: false,
  transports: import.meta.env.VITE_APP_ENV === 'production' ? ['websocket', 'polling'] : ['polling']
}

/**
 * 插件安装
 */
export default {
  install: (app, connection = DEFAULT_URL, options = DEFAULT_OPTIONS) => {
    const socket = io(connection, options)
    app.config.globalProperties.$socket = socket
    app.provide('socket', socket)
  }
}
