import axios from 'axios';
import { useAuthStore } from '../../presentation/store/authStore';

// 1. 決定 API 基礎網址
// 優先順序：Vercel 環境變數 -> 本地開發環境變數 -> 預設 localhost
const ENV_API_URL = import.meta.env.VITE_CORE_API;
const BASE_URL = ENV_API_URL || 'http://localhost:8080';

// 打印日誌幫助除錯 (請在瀏覽器 Console 確認這一行輸出的網址是否為 https://api.flora-shops.com)
console.log(`[API Client] Initializing with Base URL: ${BASE_URL}/api`);

// 2. 創建 Axios 實例
const apiClient = axios.create({
  baseURL: `${BASE_URL}/api`,
  timeout: 20000, // 延長超時時間以免冷啟動失敗
  headers: {
    'Content-Type': 'application/json',
  },
});

// 3. 請求攔截器：自動附加 Token
apiClient.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore();
    
    // 如果 Store 中有 Token，則附加到 Header
    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 4. 響應攔截器：統一處理錯誤
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // 可以在這裡處理 401 Token 過期自動登出等邏輯
    if (error.response && error.response.status === 401) {
      console.warn('[API] Token expired or unauthorized');
    }
    return Promise.reject(error);
  }
);

export default apiClient;