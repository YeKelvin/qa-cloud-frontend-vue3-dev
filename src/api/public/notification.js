import request from '@/utils/request'

export const queryNotificationRobotList = (params) => request.get('/public/notification/robot/list', { params: params })

export const queryNotificationRobotAll = (params) => request.get('/public/notification/robot/all', { params: params })

export const queryNotificationRobot = (params) => request.get('/public/notification/robot', { params: params })

export const createNotificationRobot = (data) => request.post('/public/notification/robot', data)

export const modifyNotificationRobot = (data) => request.put('/public/notification/robot', data)

export const modifyNotificationRobotState = (data) => request.patch('/public/notification/robot/state', data)

export const removeNotificationRobot = (data) => request.delete('/public/notification/robot', { data: data })
