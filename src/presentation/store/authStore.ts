// src/presentation/store/authStore.ts

// === 1. 引入依赖 ===
import axios from 'axios';
import { defineStore } from 'pinia';
import { ref } from 'vue';
// 引入 AWS Amplify 的 fetchAuthSession
import { fetchAuthSession } from 'aws-amplify/auth';
// 引入我们封装的 Repository
import { CognitoAuthRepository } from '../../infrastructure/repositories/CognitoAuthRepository';

// === 2. 定义数据接口 ===
export interface UserProfile {
  id: string;       
  email: string;    
  username: string; 
  avatarUrl?: string;
  role: string;     
}

export const useAuthStore = defineStore('auth', () => {
  // 初始化仓库
  const authRepo = new CognitoAuthRepository();

  // === 3. State (状态) ===
  const user = ref<UserProfile | null>(null);
  const token = ref<string>('');
  const isAuthenticated = ref(false);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // ==========================================================
  // 🚀 核心流程链条
  // ==========================================================

  // --- 第一步：登录 ---
  async function login(email: string, password: string) {
    isLoading.value = true;
    error.value = null;
    try {
      const result = await authRepo.login(email, password);
      
      if (result.user) {
        // 登录成功后，默认不需要强制刷新，使用普通检查
        await checkAuth(); 
      }
      return result;
    } catch (err: any) {
      error.value = err.message || '登录失败';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  // --- 第二步：检查授权 & 获取 Token (核心修复点) ---
  // 增加了 forceRefresh 参数，默认为 false
  async function checkAuth(forceRefresh = false) {
    isLoading.value = true;
    try {
      // 🔥 关键修改：传入 forceRefresh 参数
      // 如果 forceRefresh 为 true，Amplify 会去云端拉取最新的 Token
      const session = await fetchAuthSession({ forceRefresh: forceRefresh });
      
      console.log('🔍 [CheckAuth] 检测会话:', session, '强制刷新:', forceRefresh);

      if (session.tokens?.idToken) {
        token.value = session.tokens.idToken.toString();
        
        // 拿到 Token 后，去后端同步资料
        await syncUserWithBackend();
      } else {
        clearState();
      }
    } catch (err) {
      console.log('⚠️ [CheckAuth] 未检测到登录状态或刷新失败');
      clearState();
    } finally {
      isLoading.value = false;
    }
  }

  // --- 🔥 新增方法：强制刷新用户会话 🔥 ---
  // 专门给 ApplySellerView.vue 在申请成功后调用
  async function refreshUserSession() {
    console.log("🔄 [AuthStore] 正在强制刷新 Token 以获取最新权限...");
    // 强制刷新，确保拿到包含 'SELLER' Group 的新 Token
    await checkAuth(true);
  }

  // --- 第三步：同步后端 ---
  async function syncUserWithBackend() {
    if (!token.value) return;

    try {
      // console.log('🔄 [Sync] 正在连接 Spring Boot...');
      
      const response = await axios.get<UserProfile>('http://localhost:8080/api/users/me', {
        headers: {
          'Authorization': `Bearer ${token.value}`
        }
      });

      // ✅ 成功同步
      user.value = response.data;
      isAuthenticated.value = true;
      console.log('✅ [Sync] 同步成功，当前角色:', user.value?.role);

    } catch (err) {
      console.error('❌ [Sync] 同步失败:', err);
      // 注意：同步失败不一定代表 Token 失效（可能是后端挂了），
      // 但为了安全，如果 Token 真的失效了，Axios 拦截器通常会处理 401。
      // 这里我们可以选择暂不 clearState，防止网络波动导致掉线。
    }
  }

  // ==========================================================
  // 🛠 辅助功能
  // ==========================================================

  async function register(email: string, password: string) {
    isLoading.value = true;
    error.value = null;
    try {
      return await authRepo.register(email, password);
    } catch (err: any) {
      error.value = err.message || '注册失败';
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
      error.value = err.message || '验证失败';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function logout() {
    isLoading.value = true;
    try {
      await authRepo.logout();
    } catch (err: any) {
      console.error('登出异常', err);
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

  // === 4. 导出 ===
  return {
    user,             
    token,            
    isAuthenticated,  
    isLoading,        
    error,            
    
    login,            
    checkAuth,        
    refreshUserSession, // 👈 记得导出这个新方法
    register,         
    verifyCode,       
    logout,           
    syncUserWithBackend 
  };
});