import request from '@/utils/request'
import qs from 'qs'

export const queryElementList = (params) => request.get('/script/element/list', { params: params })

export const queryElementAll = (params) => request.get('/script/element/all', { params: params })

export const queryElementInfo = (params) => request.get('/script/element/info', { params: params })

export const queryElementChildren = (params) => request.get('/script/element/children', { params: params })

export const queryElementsChildren = (params) =>
  request.get('/script/elements/children', {
    params: params,
    paramsSerializer: (params) => qs.stringify(params, { arrayFormat: 'repeat' })
  })

export const createElement = (data) => request.post('/script/element', data)

export const createElementChildren = (data) => request.post('/script/element/children', data)

export const modifyElement = (data) => request.put('/script/element', data)

export const modifyElements = (data) => request.put('/script/elements', data)

export const removeElement = (data) => request.delete('/script/element', { data: data })

export const enableElement = (data) => request.patch('/script/element/enable', data)

export const disableElement = (data) => request.patch('/script/element/disable', data)

export const moveElement = (data) => request.post('/script/element/move', data)

export const duplicateElement = (data) => request.post('/script/element/duplicate', data)

export const queryHttpHeaderTemplateRefs = (params) =>
  request.get('/script/element/http/header/template/refs', { params: params })

export const createHttpHeaderTemplateByRefs = (data) => request.post('/script/element/http/header/template/refs', data)

export const modifyHttpHeaderTemplateByRefs = (data) => request.put('/script/element/http/header/template/refs', data)

export const queryElementBuiltins = (params) => request.get('/script/element/builtins', { params: params })

export const createElementBuiltins = (data) => request.post('/script/element/builtins', data)

export const modifyElementBuiltins = (data) => request.put('/script/element/builtins', data)

export const pasteElement = (data) => request.post('/script/element/paste', data)

export const copyElementToWorkspace = (data) => request.post('/script/element/collection/copy/to/workspace', data)

export const moveElementToWorkspace = (data) => request.post('/script/element/collection/move/to/workspace', data)
