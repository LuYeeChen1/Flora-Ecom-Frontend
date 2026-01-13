// src/presentation/store/authStore.ts
import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { User } from '../../core/entities/User';
// ✅ 核心依赖：Store 依赖 Repository，而不是直接依赖 aws-amplify
import { CognitoAuthRepository } from '../../infrastructure/api/CognitoAuthRepository';

export const useAuthStore = defineStore('auth', () => {
  // 1. 初始化 Repository
  const authRepo = new CognitoAuthRepository();

  const user = ref<User | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // === Action: 登录 ===
  // 这里调用 repo.login，它会自动处理 "UserAlreadyAuthenticated" 错误
  async function login(email: string, password: string) {
    isLoading.value = true;
    error.value = null;
    try {
      const result = await authRepo.login(email, password);
      
      // 如果登录成功拿到 User 对象，更新状态
      if (result.user) {
        user.value = result.user;
      }
      return result;
    } catch (err: any) {
      error.value = err.message || 'Login failed';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  // === Action: 注册 ===
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

  // === Action: 验证码 ===
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

  // === Action: 检查状态 (刷新页面用) ===
  async function checkAuth() {
    isLoading.value = true;
    try {
      const currentUser = await authRepo.getCurrentUser();
      user.value = currentUser;
    } catch (err) {
      user.value = null;
    } finally {
      isLoading.value = false;
    }
  }

  // === Action: 登出 ===
  async function logout() {
    isLoading.value = true;
    try {
      await authRepo.logout();
      user.value = null;
    } catch (err: any) {
      console.error('Logout failed', err);
    } finally {
      isLoading.value = false;
    }
  }

  return {
    user,
    isLoading,
    error,
    login,
    register,
    verifyCode,
    checkAuth,
    logout
  };
});