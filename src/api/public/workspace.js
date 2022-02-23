import request from '@/utils/request'

export const queryWorkspaceList = params => request.get('/public/workspace/list', { params: params })

export const queryWorkspaceAll = params => request.get('/public/workspace/all', { params: params })

export const createWorkspace = data => request.post('/public/workspace', data)

export const modifyWorkspace = data => request.put('/public/workspace', data)

export const deleteWorkspace = data => request.delete('/public/workspace', { data: data })

export const queryWorkspaceUserAll = params => request.get('/public/workspace/user/all', { params: params })

export const modifyWorkspaceUser = data => request.put('/public/workspace/user', data)
