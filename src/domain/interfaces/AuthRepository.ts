// 这里建议加上 type，因为 User 在这里只是作为类型使用
import type { User } from '../models/User';

export type AuthResult = {
  user?: User;
  nextStep: 'DONE' | 'CONFIRM_SIGN_UP' | 'BEYOND_SCOPE';
};

export interface AuthRepository {
  login(email: string, password: string): Promise<AuthResult>;
  register(email: string, password: string): Promise<AuthResult>;
  verifyCode(email: string, code: string): Promise<boolean>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<User | null>;
}