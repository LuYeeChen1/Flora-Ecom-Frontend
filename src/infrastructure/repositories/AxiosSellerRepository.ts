// src/infrastructure/repositories/AxiosSellerRepository.ts

// 1. 引入統一的 apiClient (它已經配置好了 BaseURL 和 Token 攔截器)
import apiClient from '../api/apiClient';

// 2. 引入 Model 和 Interface
import type { SellerRepository } from '../../domain/interfaces/SellerRepository';
import type { SellerApplication, SellerStatus } from '../../domain/models/Seller';

// 實現接口
export class AxiosSellerRepository implements SellerRepository {
  
  async apply(application: SellerApplication): Promise<void> {
    try {
      // ✅ 使用 apiClient，自動處理 https://api.flora-shops.com 和 Token
      await apiClient.post('/seller/apply', application);
    } catch (error: any) {
      console.error('[SellerRepo] Apply failed:', error);
      throw error;
    }
  }

  async getStatus(_userId: string): Promise<SellerStatus> {
    try {
      const response = await apiClient.get('/seller/status');
      return response.data; // "NONE", "PENDING", "ACTIVE", "REJECTED"
    } catch (error) {
      // 預設返回 NONE 以免前端炸裂
      return 'NONE';
    }
  }
}

// 導出單例
export const sellerRepository = new AxiosSellerRepository();