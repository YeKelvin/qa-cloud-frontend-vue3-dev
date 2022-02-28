import SocketIO from 'socket.io-client'

const options = {
  autoConnect: false,
  transports: process.env.NODE_ENV === 'production' ? ['websocket', 'polling'] : ['polling']
}

export const sio = SocketIO(process.env.VUE_APP_BASE_SOCKET, options)

/*
$connect: [ƒ]
$connect_error: [ƒ]
$connect_timeout: [ƒ]
$connecting: [ƒ]
$disconnect: [ƒ]
$error: [ƒ]
$reconnect: [ƒ]
$reconnect_attempt: [ƒ]
$reconnect_error: [ƒ]
$reconnect_failed: [ƒ]
$reconnecting: [ƒ]
*/
