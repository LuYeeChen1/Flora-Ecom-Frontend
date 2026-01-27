import type { FlowerRepository } from '../../domain/interfaces/FlowerRepository';
import type { Flower } from '../../domain/models/Flower';
import apiClient from '../api/apiClient'; // ✅ 使用统一的 apiClient

export class HttpFlowerRepository implements FlowerRepository {
  // ❌ 删除: private baseUrl = '...'; 
  // ✅ apiClient 已经配置了 baseURL: 'http://localhost:8080/api'

  // ✅ [修复] 支持传入 params (limit, offset, category, search)
  // 返回类型改为 Promise<any> 以支持 { list: Flower[], total: number } 结构
  async getFlowers(params: any = {}): Promise<any> {
    try {
      // 这里的路径是相对于 apiClient 的 baseURL 的
      // 最终请求: http://localhost:8080/api/public/flowers
      const response = await apiClient.get('/public/flowers', { params });
      
      return response.data;
    } catch (error) {
      console.error('Failed to fetch flowers from API:', error);
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