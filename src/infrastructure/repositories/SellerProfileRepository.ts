import apiClient from '../api/apiClient';

export class SellerProfileRepository {
  
  // 获取申请状态
  async getStatus() {
    const response = await apiClient.get('/seller/status');
    return response.data; // 返回 "NONE", "ACTIVE", "PENDING" 等
  }

  // 提交申请
  async submitApplication(payload: any) {
    const response = await apiClient.post('/seller/apply', payload);
    return response.data;
  }
}