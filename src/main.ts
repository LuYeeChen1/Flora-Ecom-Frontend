import { createPinia } from 'pinia'; // 1. 引入 Pinia
import { createApp } from 'vue';
import App from './App.vue';
import router from './presentation/router';
import './style.css';

const app = createApp(App)

// 2. 创建并注册 Pinia (这一步非常关键！没有它就会白屏)
app.use(createPinia()) 

// 3. 注册路由
app.use(router)

// 4. 最后才挂载
app.mount('#app')