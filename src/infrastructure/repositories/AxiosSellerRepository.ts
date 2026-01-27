// src/infrastructure/repositories/AxiosSellerRepository.ts

import axios from 'axios';

// 1. 引入 Model (相对路径)
import type { SellerApplication, SellerStatus } from '../../domain/models/Seller';
// 2. 引入 Interface (相对路径)
import type { SellerRepository } from '../../domain/interfaces/SellerRepository';
// 3. 引入 Store (相对路径，修复之前的路径错误)
import { useAuthStore } from '../../presentation/store/authStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// 实现接口
export class AxiosSellerRepository implements SellerRepository {
  
  async apply(application: SellerApplication): Promise<void> {
    const authStore = useAuthStore();
    
    // 4. 修复 Token 获取：authStore.token 是属性，不是方法
    const token = authStore.token; 

    if (!token) {
      throw new Error("Unauthorized: Please login first.");
    }

    // 发送请求
    await axios.post(`${API_URL}/seller/apply`, application, {
      headers: {
        'Authorization': `Bearer ${token}`, // 核心：携带 Token
        'Content-Type': 'application/json'
      }
    });
  }

  // 这里的 _userId 加下划线表示暂时未使用的参数
  async getStatus(_userId: string): Promise<SellerStatus> {
    // 预留接口实现
    return 'NONE';
  }
}

// 导出单例，供 Store 使用
export const sellerRepository = new AxiosSellerRepository();