import router from './router'
import store from './store'
import { ElMessage } from 'element-plus'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style
import { getToken } from '@/utils/auth' // get token from cookie
import getPageTitle from '@/utils/get-page-title'

NProgress.configure({ showSpinner: false }) // NProgress Configuration

const WHITE_LIST = ['/login', '/404', '/401'] // no redirect whitelist

// 全局前置导航守卫
router.beforeEach(async (to, from, next) => {
  // 进度条开始
  NProgress.start()

  // set page title
  document.title = getPageTitle(to.meta.title)

  // 确定用户是否已登录
  const hasToken = getToken()

  if (hasToken) {
    if (to.path === '/login') {
      // 如果已经登录，则重定向到主页
      next({ path: '/' })
      NProgress.done()
    } else {
      // 确定用户是否已获取其角色
      const hasRoles = store.getters.roles && store.getters.roles.length > 0
      if (hasRoles) {
        next()
      } else {
        try {
          // 获取用户信息
          // note: roles must be a object array! such as: ['admin'] or ,['developer','editor']
          const { roles } = await store.dispatch('user/queryInfo')
          checkRoles(roles)

          // 基于角色生成可访问路由图
          const accessRoutes = await store.dispatch('permission/generateRoutes', roles)

          // 动态添加可访问路由
          accessRoutes.forEach((route) => {
            router.addRoute(route)
          })

          // hack method to ensure that addRoutes is complete
          next({ ...to, replace: true }) // replace: true 的作用是不留下历史记录
        } catch (error) {
          // 移除 token 并重定向到登录页
          ElMessage.error(error.toString() || 'Error')
          await store.dispatch('user/resetToken')
          next({ path: '/login', query: { redirect: to.path, ...to.query } })
          NProgress.done()
        }
      }
    }
  } else {
    /* has no token */
    if (WHITE_LIST.indexOf(to.path) !== -1) {
      // in the free login whitelist, go directly
      next()
    } else {
      // other pages that do not have permission to access are redirected to the login page.
      next({ path: '/login', query: { redirect: to.path, ...to.query } })
      NProgress.done()
    }
  }
})

// 全局后置导航守卫
router.afterEach(() => {
  // 进度条完成
  NProgress.done()
})

function checkRoles(roles) {
  if (!roles || roles.length <= 0) {
    throw new Error('用户角色列表不允许为空')
  }
}
