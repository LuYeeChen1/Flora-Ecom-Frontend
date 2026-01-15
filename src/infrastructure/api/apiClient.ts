import axios from 'axios';
import { useAuthStore } from '../../presentation/store/authStore';

// 1. 创建 Axios 实例
const apiClient = axios.create({
  baseURL: 'http://localhost:8080/api', // 后端基础路径
  timeout: 10000,
});

// 2. 请求拦截器：自动附加 Token
apiClient.interceptors.request.use((config) => {
  const authStore = useAuthStore();
  if (authStore.token) {
    config.headers.Authorization = `Bearer ${authStore.token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default apiClient;