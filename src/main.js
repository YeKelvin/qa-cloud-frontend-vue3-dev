import { createApp } from 'vue'
import App from './App'

// 全局样式
import '@/styles/index.scss'

// vue-store
import Store from './store'

// vue-router
import Router from './router'
// 导航守卫
import './permission'

// element-ui
import ElementPlus from 'element-plus'
import zh_cn from 'element-plus/es/locale/lang/zh-cn'
import 'element-plus/dist/index.css'

// svg-icon
import 'virtual:svg-icons-register'
import SvgIcon from '@/components/svg-icon/SvgIcon.vue'

// directive
import PermissionDirective from '@/directive/permission'

// 工具库
import DayJs from 'dayjs'
import Lodash from 'lodash-es'

// socket-io
import SocketIO from '@/plugins/socketio'

// 创建 vue 实例
const app = createApp(App)
// 全局注册插件
app.use(Store)
app.use(SocketIO)
app.use(Router)
app.use(ElementPlus, { size: 'default', locale: zh_cn })
// 全局注册组件
app.component('SvgIcon', SvgIcon)
// 全局注册指令
app.directive('permission', PermissionDirective)
// 全局属性
app.config.globalProperties.$dayjs = DayJs
app.config.globalProperties.$_ = Lodash
// 全局异常处理
app.config.errorHandler = (err, vm, info) => {
  console.error(err)
  ElementPlus.ElMessage.error(err.toString() || '服务开小差')
}

// 挂载实例
app.mount('#app')
