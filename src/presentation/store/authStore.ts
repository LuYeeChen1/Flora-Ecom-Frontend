// src/presentation/store/authStore.ts

// === 1. 引入依赖 ===
// Pinia: Vue 的状态管理库 (类似仓库，存数据的地方)
import { defineStore } from 'pinia';
// ref: Vue 的响应式变量 (数据变了，界面会自动更新)
import { ref } from 'vue';
// axios: 一个 HTTP 客户端，用来给 Spring Boot 后端发请求
import axios from 'axios';
// Amplify: AWS 提供的工具，用来管理当前的登录会话
import { fetchAuthSession } from 'aws-amplify/auth';
// Repository: 我们自己封装的类，专门处理 AWS Cognito 那些复杂的脏活累活
import { CognitoAuthRepository } from '../../infrastructure/api/CognitoAuthRepository';

// === 2. 定义数据接口 ===
// 这里的字段必须和后端 Java 的 UserDTOResponse 以及 MySQL 数据库完全一致
// 因为我们最终要展示的是存在自己数据库里的信息
export interface UserProfile {
  id: string;       // 用户的唯一 ID (对应 Cognito 的 sub)
  email: string;    // 邮箱
  username: string; // 用户名
  role: string;     // 角色 (CUSTOMER, SELLER, ADMIN) -> 这是业务逻辑最看重的！
}

export const useAuthStore = defineStore('auth', () => {
  // 初始化仓库 (专门负责跟 AWS 打交道)
  const authRepo = new CognitoAuthRepository();

  // === 3. State (状态：仓库里存什么？) ===

  // user: 存放从 MySQL 拿回来的完整用户资料
  // 初始化为 null，表示 "现在没人登录"
  const user = ref<UserProfile | null>(null);

  // token: 存放 AWS 颁发的 "通行证" (JWT ID Token)
  // 以后我们要去请求后端接口 (比如 "申请开店")，必须把这个由 AWS 签名的通行证亮出来，后端才会理我们
  const token = ref<string>('');

  // isAuthenticated: 一个开关，告诉界面 "用户登录了吗？" (用于控制显示 "登录" 按钮还是 "头像")
  const isAuthenticated = ref(false);

  // isLoading: 加载中状态 (用来控制转圈圈动画)
  const isLoading = ref(false);
  
  // error: 存放错误信息 (如果登录失败，这里会有字)
  const error = ref<string | null>(null);

  // ==========================================================
  // 🚀 核心流程链条 (按照执行顺序排列)
  // 流程：用户点击登录 -> 1. login() -> 2. checkAuth() -> 3. syncUserWithBackend()
  // ==========================================================

  // --- 第一步：登录 (开门) ---
  // 这是用户点击 "Login" 按钮触发的第一个动作
  async function login(email: string, password: string) {
    isLoading.value = true;
    error.value = null;
    try {
      // 1. 委托 authRepo 去找 AWS Cognito 验证账号密码
      // 这一步只负责 "验证身份"，AWS 会返回一个结果对象
      const result = await authRepo.login(email, password);
      
      // 2. 如果 AWS 说 "验证通过" (result.user 存在)
      // 我们不能就此结束，因为我们还需要拿到 Token 并去自己的后端数据库 "报到"
      if (result.user) {
        // -> 进入下一步：检查授权并获取 Token
        await checkAuth(); 
      }
      return result;
    } catch (err: any) {
      error.value = err.message || '登录失败';
      throw err; // 把错误抛出去，让登录页面知道报错了
    } finally {
      isLoading.value = false;
    }
  }

  // --- 第二步：检查授权 & 获取 Token (拿通行证) ---
  // 这个方法在 "刚登录成功" 或者 "刷新页面" 时都会调用
  async function checkAuth() {
    isLoading.value = true;
    try {
      // 1. 问一下 AWS Amplify SDK: "现在的浏览器缓存里有有效的会话吗？"
      const session = await fetchAuthSession();
      
      console.log('🔍 [CheckAuth] 检测会话:', session);

      // 2. 提取 ID Token (这是关键！)
      // 为什么要 idToken？因为 access token 里没有 email 字段。
      // 我们的后端同步接口需要 email 来写入数据库，所以必须用 idToken。
      if (session.tokens?.idToken) {
        // 把 Token 变成字符串，存到状态里
        token.value = session.tokens.idToken.toString();
        
        // -> 进入第三步：去后端同步数据
        await syncUserWithBackend();
      } else {
        // 如果没有 Token，说明没登录 (或者过期了)
        clearState();
      }
    } catch (err) {
      console.log('⚠️ [CheckAuth] 未检测到登录状态');
      clearState();
    } finally {
      isLoading.value = false;
    }
  }

  // --- 第三步：同步后端 (去数据库报到) ---
  // 这是连接 前端(Vue) 和 后端(Spring Boot) 的桥梁
  async function syncUserWithBackend() {
    // 安全检查：手里没有通行证，就别去骚扰后端了
    if (!token.value) return;

    try {
      console.log('🔄 [Sync] 正在连接 Spring Boot...');
      
      // 发送 HTTP GET 请求
      // 目标: http://localhost:8080/api/users/me
      // 重点: 在请求头 (Header) 里带上 "Authorization: Bearer <token>"
      // 只有带上这个头，后端的 SecurityConfig 才会放行
      const response = await axios.get<UserProfile>('http://localhost:8080/api/users/me', {
        headers: {
          'Authorization': `Bearer ${token.value}`
        }
      });

      // ✅ 成功了！
      // response.data 是后端从 MySQL 查出来给我们的最新数据 (包含 Role)
      user.value = response.data;
      isAuthenticated.value = true;
      console.log('✅ [Sync] 同步成功，当前用户:', user.value);

    } catch (err) {
      console.error('❌ [Sync] 同步失败 (可能是 Token 过期或后端没开):', err);
      // 同步失败视为未登录
      clearState();
    }
  }

  // ==========================================================
  // 🛠 辅助功能 (注册、验证码、登出)
  // ==========================================================

  async function register(email: string, password: string) {
    isLoading.value = true;
    error.value = null;
    try {
      // 直接调用 Repo 的注册方法
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
      // 1. 通知 AWS 登出 (清理云端会话)
      await authRepo.logout();
    } catch (err: any) {
      console.error('登出异常', err);
    } finally {
      // 2. 无论 AWS 那边怎么样，我们必须清理自己前端的数据
      clearState();
      isLoading.value = false;
    }
  }

  // 一个内部的小工具，用来重置所有状态
  function clearState() {
    user.value = null;
    token.value = '';
    isAuthenticated.value = false;
  }

  // === 4. 导出 ===
  // 只有导出去了，Vue 组件才能用这些东西
  return {
    // 变量
    user,             // 谁登录了？
    token,            // 通行证 (JWT)
    isAuthenticated,  // 登录了吗？
    isLoading,        // 在转圈吗？
    error,            // 有报错吗？
    // 方法
    login,            // 登录 (触发全流程)
    checkAuth,        // 刷新状态
    register,         // 注册
    verifyCode,       // 验证码
    logout,           // 登出
    syncUserWithBackend // 手动同步 (备用)
  };
});