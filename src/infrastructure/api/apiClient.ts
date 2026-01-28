import axios from 'axios';
import { useAuthStore } from '../../presentation/store/authStore';

// 1. 決定 API 基礎網址
// 優先讀取 Vercel 設定的環境變數，讀不到就回退到 localhost
const ENV_API_URL = import.meta.env.VITE_CORE_API;
const BASE_URL = ENV_API_URL || 'http://localhost:8080';

// 打印日誌：這行能讓你在 F12 清楚看到現在是用哪一套環境
console.log(`[API Client] Initializing... Detected ENV: ${ENV_API_URL || 'None'}, Using Base URL: ${BASE_URL}/api`);

// 2. 創建 Axios 實例
const apiClient = axios.create({
  baseURL: `${BASE_URL}/api`,
  timeout: 20000, 
  headers: {
    'Content-Type': 'application/json',
  },
});

// 3. 請求攔截器
apiClient.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore();
    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 4. 響應攔截器
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn('[API] Token expired or unauthorized');
    }
    return Promise.reject(error);
  }
);

export default apiClient;