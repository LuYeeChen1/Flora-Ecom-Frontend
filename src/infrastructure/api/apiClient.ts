import axios from 'axios';
import { useAuthStore } from '../../presentation/store/authStore';

// 1. 決定 API 基礎網址
// 🔥 核彈級修復：直接寫死生產環境網址，不再依賴不穩定的環境變數
// const BASE_URL = import.meta.env.VITE_CORE_API || 'http://localhost:8080'; 
const BASE_URL = 'https://api.flora-shops.com';

// 打印日誌確認 (這次你一定會看到正確的網址)
console.log(`[API Client] Force initialized with: ${BASE_URL}/api`);

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