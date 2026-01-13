// src/core/interfaces/FlowerRepository.ts
import type { Flower } from '../entities/Flower';

export interface FlowerRepository {
  /**
   * 获取所有鲜花列表 (用于首页展示)
   */
  getFlowers(): Promise<Flower[]>;
  
  /**
   * 根据ID获取鲜花详情
   */
  getFlowerById(id: string): Promise<Flower | null>;
}