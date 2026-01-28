// src/presentation/store/authStore.ts

import { fetchAuthSession, signOut } from 'aws-amplify/auth';
import axios from 'axios';
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { CognitoAuthRepository } from '../../infrastructure/repositories/CognitoAuthRepository';

export interface UserProfile {
  id: string;       
  email: string;    
  username: string; 
  avatarUrl?: string;
  role: string;     
}

export const useAuthStore = defineStore('auth', () => {
  const authRepo = new CognitoAuthRepository();

  const user = ref<UserProfile | null>(null);
  const token = ref<string>('');
  const isAuthenticated = ref(false);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // --- 1. 登錄 ---
  async function login(email: string, password: string) {
    isLoading.value = true;
    error.value = null;
    try {
      const result = await authRepo.login(email, password);
      if (result.user) {
        await checkAuth(); 
      }
      return result;
    } catch (err: any) {
      error.value = err.message || 'Login failed';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  // --- 2. 檢查授權 ---
  async function checkAuth(forceRefresh = false) {
    isLoading.value = true;
    try {
      const session = await fetchAuthSession({ forceRefresh: forceRefresh });
      console.log('🔍 [CheckAuth] Session detected, refresh:', forceRefresh);

      if (session.tokens?.idToken) {
        token.value = session.tokens.idToken.toString();
        await syncUserWithBackend();
      } else {
        clearState();
      }
    } catch (err) {
      console.log('⚠️ [CheckAuth] No session or refresh failed');
      clearState();
    } finally {
      isLoading.value = false;
    }
  }

  // --- 🔥 強制刷新 (用於權限升級) ---
  async function refreshUserSession() {
    console.log("🔄 [AuthStore] Force refreshing token for role update...");
    await checkAuth(true);
  }

  // --- 3. 同步後端 ---
  async function syncUserWithBackend() {
    if (!token.value) return;

    // ✅ 確保這裡讀取環境變數
    const API_HOST = import.meta.env.VITE_CORE_API || 'http://localhost:8080';

    try {
      // 這裡直接用 axios 避免循環依賴，但必須確保 URL 正確
      const response = await axios.get<UserProfile>(`${API_HOST}/api/users/me`, {
        headers: {
          'Authorization': `Bearer ${token.value}`
        }
      });

      user.value = response.data;
      isAuthenticated.value = true;
      console.log('✅ [Sync] Success, Role:', user.value?.role);

    } catch (err) {
      console.error('❌ [Sync] Failed:', err);
    }
  }

  async function register(email: string, password: string) {
    isLoading.value = true;
    error.value = null;
    try {
      return await authRepo.register(email, password);
    } catch (err: any) {
      error.value = err.message || 'Registration failed';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function verifyCode(email: string, code: string) {
    isLoading.value = true;
    error.value = null;
    try {
      return await authRepo.verifyCode(email, code);
    } catch (err: any) {
      error.value = err.message || 'Verification failed';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function logout() {
    isLoading.value = true;
    try {
      await signOut(); // 使用 Amplify 的 signOut
    } catch (err: any) {
      console.error('Logout error', err);
    } finally {
      clearState();
      isLoading.value = false;
    }
  }

  function clearState() {
    user.value = null;
    token.value = '';
    isAuthenticated.value = false;
  }

  return {
    user,             
    token,            
    isAuthenticated,  
    isLoading,        
    error,            
    login,            
    checkAuth,        
    refreshUserSession, 
    register,         
    verifyCode,       
    logout,           
    syncUserWithBackend 
  };
});