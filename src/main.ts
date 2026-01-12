import { createPinia } from 'pinia'; // 引入 Pinia
import { createApp } from 'vue'
import App from './App.vue'
import './style.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia) // 注册
app.mount('#app')