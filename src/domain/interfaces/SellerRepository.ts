// src/domain/interfaces/SellerRepository.ts

import type { SellerApplication, SellerStatus } from '../models/Seller';

// 接口定义独立于文件
export interface SellerRepository {
  apply(application: SellerApplication): Promise<void>;
  getStatus(userId: string): Promise<SellerStatus>;
}