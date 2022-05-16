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
    component: () => import('@/views/error/401.vue'),
    hidden: true
  },

  {
    path: '/404',
    component: () => import('@/views/error/404.vue'),
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
    meta: { title: '接口测试', icon: 'sidebar-api' },
    children: [
      {
        path: 'editor',
        name: 'PyMeterEditor',
        component: () => import('@/pymeter/index.vue'),
        meta: { title: '脚本编辑', icon: 'sidebar-editor' }
      },
      {
        path: 'testplan',
        name: 'TestplanManager',
        component: () => import('@/views/script/testplan/Testplan.vue'),
        meta: { title: '计划管理', icon: 'sidebar-testplan' }
      },
      {
        path: 'testplan/editor',
        name: 'TestplanEditor',
        hidden: true,
        component: () => import('@/views/script/testplan/TestplanEditor.vue'),
        meta: { title: '测试计划', activeMenu: '/script/testplan' }
      },
      {
        path: 'testplan/execution/details',
        name: 'ExecutionDetails',
        hidden: true,
        component: () => import('@/views/script/testplan/TestplanExecutionDetails.vue'),
        meta: { title: '计划详情', activeMenu: '/script/testplan' }
      },
      {
        path: 'report',
        name: 'TestReport',
        hidden: true,
        component: () => import('@/views/script/report/Report.vue'),
        meta: { title: '测试报告', activeMenu: '/script/testplan' }
      }
    ]
  },

  {
    path: '/schedule',
    name: 'Schedule',
    alwaysShow: true,
    component: Layout,
    redirect: 'noRedirect',
    meta: { title: '定时任务', icon: 'sidebar-schedule' },
    children: [
      {
        path: 'task',
        name: 'Task',
        component: () => import('@/views/schedule/task/Task.vue'),
        meta: { title: '任务管理', icon: 'sidebar-schedule-task' }
      }
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
    meta: { title: '系统管理', icon: 'sidebar-setting' },
    children: [
      {
        path: 'user',
        // name: 'User',
        component: () => import('@/views/system/user/User.vue'),
        meta: { title: '用户管理', icon: 'sidebar-user', roles: ['ADMIN'] }
      },
      {
        path: 'group',
        name: 'Group',
        component: () => import('@/views/system/group/Group.vue'),
        meta: { title: '分组管理', icon: 'sidebar-group', roles: ['ADMIN'] }
      },
      {
        path: 'role',
        name: 'Role',
        component: () => import('@/views/system/role/Role.vue'),
        meta: { title: '角色管理', icon: 'sidebar-role', roles: ['ADMIN'] }
      },
      {
        path: 'permission',
        name: 'Permission',
        component: () => import('@/views/system/permission/Permission.vue'),
        meta: { title: '权限管理', icon: 'sidebar-permission', roles: ['ADMIN'] }
      },
      {
        path: 'role/permissions',
        name: 'RolePermissions',
        hidden: true,
        component: () => import('@/views/system/role/RolePermissions.vue'),
        meta: { title: '角色权限', activeMenu: '/system/role', roles: ['ADMIN'] }
      },
      {
        path: 'workspace',
        name: 'Workspace',
        component: () => import('@/views/system/workspace/Workspace.vue'),
        meta: { title: '空间管理', icon: 'sidebar-workspace', roles: ['ADMIN'] }
      },
      {
        path: 'workspace/restrictions',
        name: 'WorkspaceRestrictions',
        hidden: true,
        component: () => import('@/views/system/workspace/WorkspaceRestrictions.vue'),
        meta: { title: '空间管理', activeMenu: '/system/workspace', roles: ['ADMIN'] }
      },
      {
        path: 'notification/robot',
        name: 'NotificationRobot',
        component: () => import('@/views/system/notification/NotificationRobot.vue'),
        meta: { title: '通知管理', icon: 'sidebar-notification' }
      },
      {
        path: 'operation/log',
        name: 'OperationLog',
        component: () => import('@/views/system/operation-log/OperationLog.vue'),
        meta: { title: '操作日志', icon: 'sidebar-log', roles: ['ADMIN'] }
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
