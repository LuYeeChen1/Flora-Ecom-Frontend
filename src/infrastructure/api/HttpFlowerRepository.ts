import axios from 'axios';
import type { Flower } from '../../core/entities/Flower';
import type { FlowerRepository } from '../../core/interfaces/FlowerRepository';

export class HttpFlowerRepository implements FlowerRepository {
  // 定义后端基础路径 (根据你的 Spring Boot 端口)
  private baseUrl = 'http://localhost:8080/api/public/flowers';

  async getFlowers(): Promise<Flower[]> {
    try {
      // 1. 发起真实的 HTTP GET 请求
      const response = await axios.get<Flower[]>(this.baseUrl);
      
      // 2. 返回后端给的数据 (Axios 会自动解析 JSON)
      return response.data;
    } catch (error) {
      console.error('Failed to fetch flowers from API:', error);
      // 如果请求失败，返回空数组或抛出错误，不要静默失败
      throw error;
    }
  }

  async getFlowerById(id: string): Promise<Flower | null> {
    try {
      const response = await axios.get<Flower>(`${this.baseUrl}/${id}`);
      return response.data;
    } catch (error) {
      return null;
    }
  }
}