// src/presentation/store/authStore.ts

// 1. 引入必要工具
import { fetchAuthSession } from 'aws-amplify/auth'; // Amplify: 用于获取当前的 Cognito 会话信息
import axios from 'axios'; // axios: 用于发送 HTTP 请求 (调用 Spring Boot 接口)
import { defineStore } from 'pinia'; // Pinia: Vue 的状态管理库 (类似 Vuex)
import { ref } from 'vue'; // ref: 用于定义响应式数据
import { CognitoAuthRepository } from '../../infrastructure/api/CognitoAuthRepository'; // 我们之前封装好的 Cognito 认证仓库

// 2. 定义用户档案接口
// ⚠️ 重要：这里的字段必须和后端 Java 的 'UserDTOResponse' 以及 MySQL 'users' 表结构一致！
export interface UserProfile {
  id: string;       // 对应 Cognito 的 'sub' (用户唯一标识)
  email: string;    // 用户邮箱
  username: string; // 用户名
  role: string;     // 角色 (CUSTOMER, SELLER, ADMIN) - 这是业务逻辑的核心字段
}

export const useAuthStore = defineStore('auth', () => {
  // 3. 初始化 Cognito 仓库
  // 我们依然使用它来处理复杂的登录/注册/验证码逻辑，不重复造轮子
  const authRepo = new CognitoAuthRepository();

  // === State (状态定义) ===
  
  // user: 存放从 MySQL 同步回来的完整用户数据 (包含角色信息)
  // 初始化为 null，表示未登录
  const user = ref<UserProfile | null>(null);

  // token: 存放 AWS Cognito 颁发的 JWT (Access Token)
  // 后续所有调用 Spring Boot 接口的操作（如下单、申请开店）都需要把这个 token 放在请求头里
  const token = ref<string>('');

  // isAuthenticated: 一个简单的布尔值，方便前端判断 "用户是否登录"
  const isAuthenticated = ref(false);

  // isLoading / error: 用于控制页面上的加载转圈圈和错误提示
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // === Action: 同步用户数据 (Vue -> Spring Boot -> MySQL) ===
  // 🚀 这是连接前端与后端的桥梁！
  async function syncUserWithBackend() {
    // 如果没有 Token，说明没登录，直接不执行
    if (!token.value) return;

    try {
      console.log('🔄 正在与 Spring Boot 后端同步用户信息...');
      
      // 发送 GET 请求给后端的 /api/users/me 接口
      // 关键点：在 Header 中带上 "Authorization: Bearer <token>"
      // 后端的 JwtFilter 会拦截这个请求，验证 Token 是否合法
      const response = await axios.get<UserProfile>('http://localhost:8080/api/users/me', {
        headers: {
          'Authorization': `Bearer ${token.value}`
        }
      });

      // ✅ 同步成功！
      // response.data 就是后端从 MySQL 'users' 表里查出来的最新数据
      // 我们把它存入 Pinia 的 user 状态中
      user.value = response.data;
      isAuthenticated.value = true;
      console.log('✅ 用户数据同步成功:', user.value);

    } catch (err) {
      console.error('❌ 与后端同步失败:', err);
      // 如果同步失败 (比如 Token 过期了，或者后端挂了)，为了安全，我们重置登录状态
      user.value = null;
      isAuthenticated.value = false;
      token.value = '';
    }
  }

  // === Action: 检查登录状态 (核心鉴权流程) ===
  // 这个方法通常在 "页面刷新" 或者 "刚打开 App" 时调用
  async function checkAuth() {
    isLoading.value = true;
    try {
      // 1. 询问 AWS Amplify: "我现在有合法的会话吗？"
      const session = await fetchAuthSession();

      console.log('🔍 检测到活动会话:', session);
      
      // 2. 如果有 idToken，说明用户已登录
      // 🔴 关键修复：改用 idToken。
      // 原因：Access Token 不包含 email 字段，会导致后端同步 MySQL 时报错 "Column 'email' cannot be null"。
      // ID Token 包含了完整的 User Profile (email, username, role/groups)，正是我们需要的。
      if (session.tokens?.idToken) {
        token.value = session.tokens.idToken.toString();
        
        // 3. 🚀 拿到 Token 后，立即触发后端同步
        await syncUserWithBackend();
      } else if (session.tokens?.accessToken) {
        //以此防备某些极端情况只有 AT 的时候（虽然 Amplify 一般都有 ID Token）
         console.warn("Only Access Token found, User Profile sync might fail missing email.");
         token.value = session.tokens.accessToken.toString();
         await syncUserWithBackend();
      } else {
        // 无会话
        user.value = null;
        isAuthenticated.value = false;
        token.value = '';
      }
    } catch (err) {
      console.log('未检测到活动会话 (用户未登录)');
      user.value = null;
      isAuthenticated.value = false;
      token.value = '';
    } finally {
      isLoading.value = false;
    }
  }

  // === Action: 登录 ===
  async function login(email: string, password: string) {
    isLoading.value = true;
    error.value = null;
    try {
      // 1. 调用 Repository 进行 Cognito 登录
      const result = await authRepo.login(email, password);
      

    // 2. 登录成功后，立即执行 checkAuth
      // 为什么？因为 authRepo.login 只返回了 AWS 的对象，
      // 我们需要通过 checkAuth -> syncUserWithBackend 这一套连招，
      // 把数据从 MySQL 拉取下来并更新到 user 状态里。
      if (result.user) {
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

  // === Action: 注册 ===
  // 注册逻辑比较简单，直接透传给 authRepo 即可
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

  // === Action: 验证邮箱验证码 ===
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

  // === Action: 登出 ===
  async function logout() {
    isLoading.value = true;
    try {
      // 1. 通知 AWS Cognito 登出
      await authRepo.logout();
    } catch (err: any) {
      console.error('登出时发生错误', err);
    } finally {
      // 2. 无论 AWS 登出是否成功，都必须清理本地的前端状态
      // 否则用户看着还像登录状态，这很危险
      user.value = null;
      token.value = '';
      isAuthenticated.value = false;
      isLoading.value = false;
    }
  }

  // === 导出 ===
  // 把这些状态和方法暴露给 Vue 组件使用
  return {
    user,             // 组件可以通过 authStore.user 拿到用户信息
    token,            // 组件可以通过 authStore.token 拿到 JWT
    isAuthenticated,  // 组件用于判断显隐 (比如 "登录" 按钮变 "头像")
    isLoading,
    error,
    login,
    register,
    verifyCode,
    checkAuth,
    logout,
    syncUserWithBackend // 导出这个方法，特殊情况下组件也可以手动触发同步
  };
});