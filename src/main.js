import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

// 导入Element Plus
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

import App from './App.vue'
import router from './router'

const app = createApp(App)

// 注册所有图标
for (const [key, component] of Object.entries(
  ElementPlusIconsVue
)) {
  app.component(key, component)
}

app.use(createPinia())
app.use(router)
// 使用Element Plus，并配置中文
app.use(ElementPlus, {
  locale: zhCn
})

app.mount('#app')
