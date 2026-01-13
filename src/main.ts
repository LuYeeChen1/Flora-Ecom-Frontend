import { Amplify } from 'aws-amplify'; // 1. 引入 Amplify
import { createPinia } from 'pinia';
import { createApp } from 'vue';
import App from './App.vue';
import router from './presentation/router'; // 你的路由路径
import './style.css';

// 2. 配置 Cognito (请填入你刚才在 AWS 控制台复制的 ID)
Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: 'us-east-1_l1oRj3RCH', // 替换为你的 User Pool ID
      userPoolClientId: '4b5hfsqt5amn5bv4gfvkfr7l1g', // 替换为你的 Client ID
      loginWith: { 
        email: true,
      },
      signUpVerificationMethod: "code"
    }
  }
});

const app = createApp(App);

// 3. 注册 Pinia 和 Router
app.use(createPinia());
app.use(router);

// 4. 挂载
app.mount('#app');