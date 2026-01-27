import axios from 'axios';
import { useAuthStore } from '../../presentation/store/authStore';

// 讀取環境變數 (如果讀不到就用 localhost 做後備)
// 注意：Vercel 設定的值是 http://98.92.26.56:8080 (沒有 /api)
const BASE_URL = import.meta.env.VITE_CORE_API || 'http://localhost:8080';

// 1. 創建实例
const apiClient = axios.create({
  // 這裡要把 /api 接上去
  baseURL: `${BASE_URL}/api`,
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