import { createApp } from 'vue'
import App from './App'

// 全局样式
import '@/styles/index.scss'

// vue-store
import store from './store'

// element-ui
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/es/locale/lang/zh-cn'

// svg-icon
import 'virtual:svg-icons-register'
import SvgIcon from '@/components/svg-icon/SvgIcon.vue'

// directive
import directive from '@/directive'

// 第三方库依赖
import DayJs from 'dayjs'
import Lodash from 'lodash-es'

// vue-router
import router from './router'
import './permission'

const app = createApp(App)
app.use(store)
app.use(ElementPlus, { size: 'mini', locale: zhCn })
app.component('SvgIcon', SvgIcon)
directive(app)
app.config.globalProperties.$dayjs = DayJs
app.config.globalProperties.$_ = Lodash

app.use(router).mount('#app')
