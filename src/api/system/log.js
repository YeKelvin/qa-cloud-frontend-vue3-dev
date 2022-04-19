import request from '@/utils/request'

export const queryOperationLogList = (params) => request.get('/system/operation/log/list', { params: params })
