import request from '@/utils/request'

export const executeCollection = (data) => request.post('/script/collection/execute', data)

export const executeGroup = (data) => request.post('/script/group/execute', data)

export const executeSampler = (data) => request.post('/script/sampler/execute', data)

export const executeSnippets = (data) => request.post('/script/snippets/execute', data)

export const executeTestPlan = (data) => request.post('/script/testplan/execute', data)

export const interruptTestplanExecution = (data) => request.post('/script/testplan/execution/interrupt', data)

export const queryCollectionJson = (params) => request.get('/script/collection/json', { params: params })

export const queryGroupJson = (params) => request.get('/script/group/json', { params: params })

export const querySnippetsJson = (params) => request.get('/script/snippets/json', { params: params })
