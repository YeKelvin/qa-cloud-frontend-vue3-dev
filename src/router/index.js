import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/layout'

/**
 * 所有权限通用路由表
 * 如首页和登录页和一些不用权限的公用页面
 */
export const constantRoutes = [
  {
    path: '/redirect',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '/redirect/:path(.*)',
        component: () => import('@/views/redirect')
      }
    ]
  },

  {
    path: '/login',
    component: () => import('@/views/login/Login.vue'),
    hidden: true
  },

  {
    path: '/401',
    component: () => import('@/views/error-page/401.vue'),
    hidden: true
  },

  {
    path: '/404',
    component: () => import('@/views/error-page/404.vue'),
    hidden: true
  },

  {
    path: '/',
    name: 'Index',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard'),
        meta: { title: '首页', icon: 'sidebar-home' }
      }
    ]
  },

  {
    path: '/script',
    name: 'Script',
    alwaysShow: true,
    component: Layout,
    redirect: 'noRedirect',
    meta: { title: '接口测试', icon: 'sidebar-apitest' },
    children: [
      {
        path: 'editor',
        name: 'PyMeterEditor',
        component: () => import('@/pymeter/index.vue'),
        meta: { title: '脚本编辑', icon: 'sidebar-editor' }
      },
      // {
      //   path: 'testplan',
      //   name: 'TestplanManager',
      //   component: () => import('@/views/script/testplan/manager.vue'),
      //   meta: { title: '计划管理', icon: 'sidebar-testplan' }
      // },
      // {
      //   path: 'testplan/editor',
      //   name: 'TestplanEditor',
      //   hidden: true,
      //   component: () => import('@/views/script/testplan/editor.vue'),
      //   meta: { title: '测试计划', activeMenu: '/script/testplan' }
      // },
      // {
      //   path: 'testplan/execution/details',
      //   name: 'ExecutionDetails',
      //   hidden: true,
      //   component: () => import('@/views/script/testplan/execution-details.vue'),
      //   meta: { title: '计划详情', activeMenu: '/script/testplan' }
      // },
      // {
      //   path: 'report',
      //   name: 'TestReport',
      //   hidden: true,
      //   component: () => import('@/views/script/report/index.vue'),
      //   meta: { title: '测试报告', activeMenu: '/script/testplan' }
      // }
    ]
  }

  // 注意!!!不要把 404 放在这里，因为 asyncRoutes 中的路由是接在这后面的
]

/**
 * 异步路由
 * 需要根据用户角色动态加载的路由
 */
export const asyncRoutes = [
  {
    path: '/system',
    name: 'System',
    alwaysShow: true,
    component: Layout,
    redirect: 'noRedirect',
    meta: { title: '系统管理', icon: 'sidebar-setting', roles: ['ADMIN'] },
    children: [
      {
        path: 'user',
        // name: 'User',
        component: () => import('@/views/system/user/User.vue'),
        meta: { title: '用户管理', icon: 'sidebar-user' }
      },
      {
        path: 'role',
        name: 'Role',
        component: () => import('@/views/system/role/Role.vue'),
        meta: { title: '角色管理', icon: 'sidebar-role' }
      },
      {
        path: 'permission',
        name: 'Permission',
        component: () => import('@/views/system/permission/Permission.vue'),
        meta: { title: '权限管理', icon: 'sidebar-permission' }
      },
      {
        path: 'role/permissions',
        name: 'RolePermissions',
        hidden: true,
        component: () => import('@/views/system/role/RolePermissions.vue'),
        meta: { title: '角色权限', activeMenu: '/system/role' }
      },
      {
        path: 'workspace',
        name: 'Workspace',
        component: () => import('@/views/system/workspace/Workspace.vue'),
        meta: { title: '空间管理', icon: 'sidebar-workspace' }
      },
      {
        path: 'action/log',
        name: 'ActionLog',
        component: () => import('@/views/system/action-log/ActionLog'),
        meta: { title: '操作日志', icon: 'sidebar-log' }
      }
    ]
  },

  // 404 page must be placed at the end !!!
  { path: '/:pathMatch(.*)', redirect: '/404', hidden: true }
]

const createVueRouter = () =>
  createRouter({
    history: createWebHistory(),
    scrollBehavior: () => ({ top: 0 }),
    routes: constantRoutes
  })

const router = createVueRouter()

export default router
