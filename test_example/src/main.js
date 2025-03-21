import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import Terminal from './components/Terminal.vue'

const app = createApp(App)
app.use(ElementPlus)
app.component('WebTerminal', Terminal)
app.mount('#app') 