// src/infrastructure/repositories/SellerProfileRepository.ts

import apiClient from '../api/apiClient';

export class SellerProfileRepository {
  
  /**
   * 獲取賣家申請狀態
   * Endpoint: GET /api/seller/status
   */
  async getStatus() {
    try {
      const response = await apiClient.get('/seller/status');
      // 返回狀態字串: "NONE", "PENDING", "ACTIVE", "REJECTED"
      return response.data; 
    } catch (error) {
      // 首次訪問可能沒有狀態，視業務邏輯決定是否拋出
      throw error;
    }
  }

  /**
   * 提交賣家申請資料
   * Endpoint: POST /api/seller/apply
   */
  async submitApplication(payload: any) {
    try {
      const response = await apiClient.post('/seller/apply', payload);
      return response.data;
    } catch (error) {
      console.error('[Repository] Submit application failed:', error);
      throw error;
    }
  }
}