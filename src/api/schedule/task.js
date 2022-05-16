import request from '@/utils/request'

export const queryTaskList = (params) => request.get('/schedule/task/list', { params: params })

export const queryTaskInfo = (params) => request.get('/schedule/task/info', { params: params })

export const createTask = (data) => request.post('/schedule/task', data)

export const modifyTask = (data) => request.put('/schedule/task', data)

export const pauseTask = (data) => request.patch('/schedule/task/pause', data)

export const resumeTask = (data) => request.patch('/schedule/task/resume', data)

export const removeTask = (data) => request.patch('/schedule/task/remove', data)
