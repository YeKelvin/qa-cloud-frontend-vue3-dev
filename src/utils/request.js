import axios from 'axios'
import _ from 'lodash-es'
import store from '@/store'

import { ElMessageBox, ElMessage, ElLoading } from 'element-plus'
import { getToken } from '@/utils/auth'

/**
 * TODO: 优化axios，参考以下网址
 *
 * https://segmentfault.com/a/1190000027078266
 * https://blog.csdn.net/lhjuejiang/article/details/81515839
 */

// loading对象
let loading

// 当前正在请求的数量
let needLoadingRequestCount = 0

// 初始化axios
const service = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_URL, // 请求的 base url
  timeout: 5000, // 超时时长
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': import.meta.env.VITE_APP_BASE_URL
  }
})

// 显示loading
function showLoading() {
  // 后面这个判断很重要，因为关闭时加了抖动，此时 loading 对象可能还存在，
  // 但 needLoadingRequestCount 已经变成0，避免这种情况下会重新创建个 loading
  if (needLoadingRequestCount === 0 && !loading) {
    loading = ElLoading.service({
      lock: true,
      text: 'Loading',
      background: 'rgba(0, 0, 0, 0.5)'
    })
  }
  needLoadingRequestCount++
}

// 隐藏loading
function hideLoading() {
  needLoadingRequestCount--
  needLoadingRequestCount = Math.max(needLoadingRequestCount, 0) // 做个保护
  if (needLoadingRequestCount === 0) {
    // 关闭loading
    toHideLoading()
  }
}

// 防抖：将 300ms 间隔内的关闭 loading 便合并为一次。防止连续请求时 loading 闪烁的问题。
const toHideLoading = _.debounce(() => {
  loading && loading.close()
  loading = null
}, 300)

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    if (store.getters.token) {
      config.headers['Authorization'] = `Bearer ${getToken()}`
    }
    // 判断当前请求是否设置了不显示Loading
    if (config.method !== 'get') {
      showLoading()
    }
    return config
  },
  (error) => {
    // 判断当前请求是否设置了不显示Loading
    if (error.config.method !== 'get') {
      hideLoading()
    }
    ElMessage.error({ message: error.message, duration: 2 * 1000 })
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  (response) => {
    const { data } = response
    // 判断当前请求是否设置了不显示 Loading（不显示自然无需隐藏）
    if (response.config.method !== 'get') {
      hideLoading()
    }
    if (response.status !== 200) {
      const message = response.statusText || '网络异常'
      ElMessage.error({ message: message, duration: 2 * 1000 })
      return Promise.reject(new Error(message))
    } else {
      // 判断用户 token 是否有效，无效或失效则转跳至登录页
      if (!data.success && data.errorCode === 'E401001') {
        ElMessageBox.confirm('登录失效，请重新登录', '警告', {
          confirmButtonText: '重新登录',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          store.dispatch('user/resetToken').then(() => {
            // 刷新页面
            location.reload()
          })
        })
        return data
      }
      if (!data.success || data.errorCode) {
        const message = data.errorMsg || '服务开小差'
        ElMessage.error({ message: message, duration: 2 * 1000 })
        return Promise.reject(new Error(message))
      }
      return data
    }
  },
  (error) => {
    // 判断当前请求是否设置了不显示 Loading（不显示自然无需隐藏）
    if (error.config.method !== 'get') {
      hideLoading()
    }
    ElMessage.error({ message: error.message, duration: 2 * 1000 })
    return Promise.reject(error)
  }
)

export default service

// TODO: 页面转跳时取消所有未返回的请求
