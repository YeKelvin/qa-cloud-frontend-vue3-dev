import request from '@/utils/request'

export const login = (data) => request.post('/usercenter/user/login', data)

export const logout = (data) => request.post('/usercenter/user/logout', data)

export const register = (data) => request.post('/usercenter/user/register', data)

export const resetPassword = (data) => request.patch('/usercenter/user/password/reset', data)

export const queryInfo = () => request.get('/usercenter/user/info')

export const queryUserList = (params) => request.get('/usercenter/user/list', { params: params })

export const queryUserAll = () => request.get('/usercenter/user/all')

export const modifyUser = (data) => request.put('/usercenter/user', data)

export const modifyUserState = (data) => request.patch('/usercenter/user/state', data)

export const deleteUser = (data) => request.delete('/usercenter/user', { data: data })
