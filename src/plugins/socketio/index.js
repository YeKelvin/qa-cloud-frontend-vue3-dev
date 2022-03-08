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
 * 默认调试模式
 */
const DEBUG = import.meta.env.VITE_APP_ENV === 'development'

/**
 * 插件安装
 */
export default {
  install: (app, connection = DEFAULT_URL, debug = DEBUG, options = DEFAULT_OPTIONS) => {
    const socket = io(connection, options)
    app.config.globalProperties.$socket = socket
    app.provide('socket', socket)

    if (debug) {
      socket.onAny((event, ...args) => {
        console.log(`event:[ ${event} ] args:[ ${args} ]`)
      })
    }

    /**
     * 在连接成功时触发
     */
    // socket.on('connect', () => {
    //   console.debug(`sid:[ ${socket.id} ] event:[ connect ]`)
    // })

    /**
     * 在连接错误时触发
     */
    // socket.on('connect_error', (error) => {
    //   console.error(`sid:[ ${socket.id} ] event:[ connect_error ] error:[ ${error} ]`)
    //   socket.close()
    // })

    /**
     * 在成功重新连接后触发
     */
    // socket.on('reconnect', (attempt) => {
    //   console.debug(`sid:[ ${socket.id} ] event:[ reconnect ] attempt:[ ${attempt} ]`)
    // })

    /**
     * 在尝试重新连接时触发
     */
    // socket.io.on('reconnect_attempt', (attempt) => {
    //   console.debug(`sid:[ ${socket.id} ] event:[ reconnect_attempt ] attempt:[ ${attempt} ]`)
    // })

    /**
     * 在重新连接尝试错误时触发
     */
    // socket.on('reconnect_error', (error) => {
    //   console.error(`sid:[ ${socket.id} ] event:[ reconnect_error ] error:[ ${error} ]`)
    //   socket.close()
    // })

    /**
     * 在重新连接尝试中无法重新连接时触发
     */
    // socket.io.on('reconnect_failed', () => {
    //   console.error(`sid:[ ${socket.id} ] event:[ reconnect_failed ]`)
    // })

    /**
     * 断开连接时触发
     */
    // socket.on('disconnect', () => {
    //   console.debug(`sid:[ ${socket.id} ] event:[ disconnect ]`)
    // })

    /**
     * 在连接错误时触发
     */
    // socket.on('error', (error) => {
    //   console.error(`sid:[ ${socket.id} ] event:[ error ] error:[ ${error} ]`)
    //   socket.close()
    // })
  }
}
