import { useStore } from 'vuex'
import useSocket from './useSocket'

export default function useSocketIO() {
  const socket = useSocket()
  const store = useStore()

  /**
   * 设置请求头
   */
  const setAuthorization = () => {
    socket.io.opts['transportOptions'] = {
      polling: {
        extraHeaders: {
          Authorization: `Bearer ${store.state.user.token}`
        }
      }
    }
  }

  /**
   * 连接
   */
  const socketConnect = () => {
    setAuthorization()
    if (socket.disconnected) socket.open()
  }

  /**
   * 断开连接
   */
  const socketDisconnect = () => {
    if (socket.connected) socket.close()
  }

  /**
   * 连接并返回 sid
   */
  const getSID = (timeout = 2000) => {
    let timeoutId = null
    let intervalId = null

    return new Promise((resolve, reject) => {
      if (socket.id) resolve(socket.id)

      timeoutId = setTimeout(() => {
        clearInterval(intervalId)
        reject('get sid timeout')
      }, timeout)

      intervalId = setInterval(() => {
        if (socket.id) {
          clearInterval(intervalId)
          clearTimeout(timeoutId)
          resolve(socket.id)
        }
      }, 200)
    })
  }

  return {
    socketConnect,
    socketDisconnect,
    getSID
  }
}
