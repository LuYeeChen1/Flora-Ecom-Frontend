import apiClient from '../api/apiClient';

export interface FlowerData {
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  imageUrl?: string;
}

export class SellerFlowerRepository {
  
  // --- 1. 图片上传 ---
  async getUploadUrl(fileType: string, fileName: string) {
    const response = await apiClient.get('/seller/flowers/upload-url', {
      params: { contentType: fileType, fileName: fileName }
    });
    return response.data; 
  }

  async uploadToS3(uploadUrl: string, file: File) {
    await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: { 'Content-Type': file.type }
    });
  }

  // --- 2. 商品管理 (Inventory CRUD) ---
  
  async createFlower(flower: FlowerData) {
    await apiClient.post('/seller/flowers', flower);
  }

  async getMyInventory() {
    const response = await apiClient.get('/seller/flowers');
    return response.data;
  }

  async updateFlower(id: number, flower: FlowerData) {
    await apiClient.put(`/seller/flowers/${id}`, flower);
  }

  async deleteFlower(id: number) {
    await apiClient.delete(`/seller/flowers/${id}`);
  }

  // --- 3. 订单管理 (Order Operations) ---

  // 获取该卖家的所有关联订单（混合视图）
  async getIncomingOrders() {
    const response = await apiClient.get('/seller/orders'); 
    return response.data;
  }

  // [Action A] 发货：只发货属于当前卖家的商品 (支持混合订单)
  // 对应后端 SellerController.shipOrder (PATCH /api/seller/orders/{id}/ship)
  async shipOrder(orderId: number) {
    await apiClient.patch(`/seller/orders/${orderId}/ship`);
  }

  // [Action B] 全单流转：SHIPPED -> DELIVERED
  // 对应后端 OrderController.updateStatus (PATCH /api/orders/{id}/status)
  async updateOrderStatus(orderId: number, status: string) {
    await apiClient.patch(`/api/orders/${orderId}/status`, { status });
  }
}

// 导出单例，供 Store 使用
export const sellerFlowerRepository = new SellerFlowerRepository();