import { confirmSignUp, fetchUserAttributes, getCurrentUser, signIn, signOut, signUp } from 'aws-amplify/auth';
import { User } from '../../core/entities/User';
import type { AuthRepository, AuthResult } from '../../core/interfaces/AuthRepository';

export class CognitoAuthRepository implements AuthRepository {
  
async login(email: string, password: string): Promise<AuthResult> {
    // 🔍 调试日志：如果你在控制台没看到这句话，说明代码没更新！
    console.log('🔵 [AuthRepository] 正在尝试登录:', email);

    try {
      const { isSignedIn, nextStep } = await signIn({ username: email, password });
      
      if (isSignedIn) {
        return { user: new User(email), nextStep: 'DONE' };
      }
      
      if (nextStep.signInStep === 'CONFIRM_SIGN_UP') {
        return { nextStep: 'CONFIRM_SIGN_UP' };
      }

      return { nextStep: 'BEYOND_SCOPE' };

    } catch (error: any) {
      // 🔍 调试日志：看看报错到底长什么样
      console.log('🔴 [AuthRepository] 登录捕获异常:', error.name, error);

      // 🛠️ 增强判断逻辑
      const isSessionError = 
        error.name === 'UserAlreadyAuthenticatedException' || 
        error.code === 'UserAlreadyAuthenticatedException' ||
        error.message?.includes('already a signed in user'); // 多加一层保险

      if (isSessionError) {
        console.warn('🔄 检测到残留会话，正在清理并重试...');
        await signOut(); 
        return this.login(email, password); // 递归重试
      }

      // 其他错误继续抛出
      throw error;
    }
  }

  async register(email: string, password: string): Promise<AuthResult> {
    try {
      const { nextStep } = await signUp({
        username: email,
        password,
        options: { userAttributes: { email } }
      });
      return {
        nextStep: nextStep.signUpStep === 'CONFIRM_SIGN_UP' ? 'CONFIRM_SIGN_UP' : 'DONE'
      };
    } catch (error) {
      throw error;
    }
  }

  async verifyCode(email: string, code: string): Promise<boolean> {
    try {
      const { isSignUpComplete } = await confirmSignUp({
        username: email,
        confirmationCode: code
      });
      return isSignUpComplete;
    } catch (error) {
      throw error;
    }
  }

  async logout(): Promise<void> {
    await signOut();
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      // 1. 获取 Session
      const { userId } = await getCurrentUser();
      
      // 2. 获取属性 (这里可能会报 400 错误)
      const attributes = await fetchUserAttributes();
      
      const displayEmail = attributes.email || 'Unknown User';
      const isVerified = attributes.email_verified === 'true'; 

      return new User(displayEmail, userId, isVerified);

    } catch (error: any) {
      // 🛠️ 修复图3：如果 Token 失效导致 400 错误，主动清理状态
      // 这样下次刷新页面时，就是一个干净的未登录状态
      if (error.name === 'NotAuthorizedException' || error.message?.includes('400')) {
        await signOut();
      }
      return null;
    }
  }
}