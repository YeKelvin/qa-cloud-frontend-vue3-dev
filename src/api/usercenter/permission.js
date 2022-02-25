import request from '@/utils/request'

export const queryPermissionList = (params) => request.get('/usercenter/permission/list', { params: params })

export const queryPermissionAll = () => request.get('/usercenter/permission/all')

export const createPermission = (data) => request.post('/usercenter/permission', data)

export const modifyPermission = (data) => request.put('/usercenter/permission', data)

export const modifyPermissionState = (data) => request.patch('/usercenter/permission/state', data)

export const deletePermission = (data) => request.delete('/usercenter/permission', { data: data })
