import request from '@/utils/request'

export const queryHttpHeaderTemplateList = (params) =>
  request.get('/script/http/header/template/list', { params: params })

export const queryHttpHeaderTemplateAll = (params) =>
  request.get('/script/http/header/template/all', { params: params })

export const createHttpHeaderTemplate = (data) => request.post('/script/http/header/template', data)

export const modifyHttpHeaderTemplate = (data) => request.put('/script/http/header/template', data)

export const deleteHttpHeaderTemplate = (data) => request.delete('/script/http/header/template', { data: data })

export const createHttpHeader = (data) => request.post('/script/http/header', data)

export const modifyHttpHeader = (data) => request.put('/script/http/header', data)

export const deleteHttpHeader = (data) => request.delete('/script/http/header', { data: data })

export const enableHttpHeader = (data) => request.patch('/script/http/header/enable', data)

export const disableHttpHeader = (data) => request.patch('/script/http/header/disable', data)

export const queryHttpHeadersByTemplate = (params) =>
  request.get('/script/http/headers/by/template', { params: params })

export const queryHttpHeaders = (params) => request.get('/script/http/headers', { params: params })

export const createHttpHeaders = (data) => request.post('/script/http/headers', data)

export const modifyHttpHeaders = (data) => request.put('/script/http/headers', data)

export const deleteHttpHeaders = (data) => request.delete('/script/http/headers', { data: data })

export const duplicateHttpHeaderTemplate = (data) => request.post('/script/http/header/template/duplicate', data)

export const copyHttpHeaderTemplateToWorkspace = (data) =>
  request.post('/script/http/header/template/copy/to/workspace', data)

export const moveHttpHeaderTemplateToWorkspace = (data) =>
  request.post('/script/http/header/template/move/to/workspace', data)
