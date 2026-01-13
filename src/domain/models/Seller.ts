// src/domain/models/Seller.ts

// 对应后端的 SellerApplyDTORequest
export interface SellerApplication {
  realName: string;
  idCardNumber: string;
  phoneNumber: string;
  businessAddress: string;
}

// 对应后端的 SellerProfile 状态
export type SellerStatus = 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED' | 'NONE';