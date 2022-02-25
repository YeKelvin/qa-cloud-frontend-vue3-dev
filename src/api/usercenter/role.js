import request from '@/utils/request'

export const queryRoleList = (params) => request.get('/usercenter/role/list', { params: params })

export const queryRoleAll = () => request.get('/usercenter/role/all')

export const queryRoleInfo = (params) => request.get('/usercenter/role/info', { params: params })

export const createRole = (data) => request.post('/usercenter/role', data)

export const modifyRole = (data) => request.put('/usercenter/role', data)

export const modifyRoleState = (data) => request.patch('/usercenter/role/state', data)

export const deleteRole = (data) => request.delete('/usercenter/role', { data: data })

export const queryUserRoleList = (params) => request.get('/usercenter/user/role/list', { params: params })

export const queryUserRoleAll = (params) => request.get('/usercenter/user/role/all', { params: params })

export const queryRolePermissionList = (params) => request.get('/usercenter/role/permission/list', { params: params })

export const queryRolePermissionUnboundList = (params) =>
  request.get('/usercenter/role/permission/unbound/list', { params: params })

export const createRolePermissions = (data) => request.post('/usercenter/role/permissions', data)

export const deleteRolePermission = (data) => request.delete('/usercenter/role/permission', { data: data })

export const deleteRolePermissions = (data) => request.delete('/usercenter/role/permissions', { data: data })
