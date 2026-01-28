import type { FlowerRepository } from '../../domain/interfaces/FlowerRepository';
import type { Flower } from '../../domain/models/Flower';
import apiClient from '../api/apiClient';

export class HttpFlowerRepository implements FlowerRepository {
  
  /**
   * 獲取所有公開花卉
   * apiClient 會根據 VITE_CORE_API 自動處理生產環境或本地環境網址
   */
  async getFlowers(params: any = {}): Promise<any> {
    try {
      const response = await apiClient.get('/public/flowers', { params });
      return response.data;
    } catch (error) {
      console.error('生產環境 API 請求失敗:', error);
      throw error;
    }
  }

  async getFlowerById(id: string): Promise<Flower | null> {
    try {
      const response = await apiClient.get<Flower>(`/public/flowers/${id}`);
      return response.data;
    } catch (error) {
      return null;
    }
  }
}