import axios from 'axios';
import { useAuthStore } from '../../presentation/store/authStore';

// 1. 创建实例
const apiClient = axios.create({
  baseURL: 'http://localhost:8080/api',
  timeout: 10000,
});

// 2. 🔥 关键修复：请求拦截器
apiClient.interceptors.request.use((config) => {
  const authStore = useAuthStore();
  
  // 打印日志调试：看看 Token 到底有没有拿到
  console.log("Interceptor checking token:", authStore.token ? "Present" : "Missing");

  if (authStore.token) {
    // 确保格式是 "Bearer " + token (中间有空格)
    config.headers.Authorization = `Bearer ${authStore.token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default apiClient;