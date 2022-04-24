import request from '@/utils/request'

export const queryWorkspaceList = params => request.get('/public/workspace/list', { params: params })

export const queryWorkspaceAll = params => request.get('/public/workspace/all', { params: params })

export const createWorkspace = data => request.post('/public/workspace', data)

export const modifyWorkspace = data => request.put('/public/workspace', data)

export const deleteWorkspace = data => request.delete('/public/workspace', { data: data })

export const queryWorkspaceUserAll = params => request.get('/public/workspace/user/all', { params: params })

export const modifyWorkspaceUser = data => request.put('/public/workspace/user', data)

export const queryWorkspaceRestrictionList = params => request.get('/public/workspace/restriction/list', { params: params })

export const queryWorkspaceRestrictionAll = params => request.get('/public/workspace/restriction/all', { params: params })

export const createWorkspaceRestriction = data => request.post('/public/workspace/restriction', data)

export const modifyWorkspaceRestriction = data => request.put('/public/workspace/restriction', data)

export const deleteWorkspaceRestriction = data => request.delete('/public/workspace/restriction', { data: data })

export const enableWorkspaceRestriction = data => request.patch('/public/workspace/restriction/enable', data)

export const disableWorkspaceRestriction = data => request.patch('/public/workspace/restriction/disable', data)
