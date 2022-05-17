import request from '@/utils/request'
import qs from 'qs'

export const queryTestplanList = (params) => request.get('/script/testplan/list', { params: params })

export const queryTestplanAll = (params) =>
  request.get('/script/testplan/all', {
    params: params,
    paramsSerializer: (params) => qs.stringify(params, { indices: false })
  })

export const queryTestplan = (params) => request.get('/script/testplan', { params: params })

export const createTestplan = (data) => request.post('/script/testplan', data)

export const modifyTestplan = (data) => request.put('/script/testplan', data)

export const modifyTestplanState = (data) => request.patch('/script/testplan/state', data)

export const modifyTestplanTestphase = (data) => request.patch('/script/testplan/testphase', data)

export const queryTestplanExecutionAll = (params) => request.get('/script/testplan/execution/all', { params: params })

export const queryTestplanExecutionDetails = (params) =>
  request.get('/script/testplan/execution/details', { params: params })
