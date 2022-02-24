import request from '@/utils/request'

export const encryptionFactor = (params) => request.get('/usercenter/encryption/factor', { params: params })

export const login = (data) => request.post('/usercenter/user/login', data)

export const logout = (data) => request.post('/usercenter/user/logout', data)

export const register = (data) => request.post('/usercenter/user/register', data)

export const resetPassword = (data) => request.patch('/usercenter/user/password/reset', data)

export const queryInfo = () => request.get('/usercenter/user/info')

export const queryUserList = (params) => request.get('/usercenter/user/list', { params: params })

export const queryUserAll = () => request.get('/usercenter/user/all')

export const modifyUser = (data) => request.put('/usercenter/user/info', data)

export const modifyUserState = (data) => request.patch('/usercenter/user/state', data)

export const deleteUser = (data) => request.delete('/usercenter/user', { data: data })

export const queryPermissionList = (params) => request.get('/usercenter/permission/list', { params: params })

export const queryPermissionAll = () => request.get('/usercenter/permission/all')

export const createPermission = (data) => request.post('/usercenter/permission', data)

export const modifyPermission = (data) => request.put('/usercenter/permission', data)

export const modifyPermissionState = (data) => request.patch('/usercenter/permission/state', data)

export const deletePermission = (data) => request.delete('/usercenter/permission', { data: data })

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
