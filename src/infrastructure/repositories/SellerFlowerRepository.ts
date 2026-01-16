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

  // --- 2. 商品管理 (CRUD) ---
  
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

  // --- 3. 订单管理 ---

  // 修正：去掉 /api 前缀，变为 /seller/orders
  async getIncomingOrders() {
    const response = await apiClient.get('/seller/orders'); 
    return response.data;
  }

  // 修正：去掉 /api 前缀
  async shipOrder(orderId: number) {
    await apiClient.patch(`/seller/orders/${orderId}/ship`);
  }
}