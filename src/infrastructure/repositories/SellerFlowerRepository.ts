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
  
  // --- 1. 圖片上傳 ---
  async getUploadUrl(fileType: string, fileName: string) {
    const response = await apiClient.get('/seller/flowers/upload-url', {
      params: { contentType: fileType, fileName: fileName }
    });
    return response.data; 
  }

  async uploadToS3(uploadUrl: string, file: File) {
    // S3 上傳不走後端，直接用 fetch
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

  // --- 3. 訂單管理 (Order Operations) ---

  // 獲取該賣家的所有關聯訂單
  async getIncomingOrders() {
    const response = await apiClient.get('/seller/orders'); 
    return response.data;
  }

  // [Action A] 發貨
  async shipOrder(orderId: number) {
    await apiClient.patch(`/seller/orders/${orderId}/ship`);
  }

  // [Action B] 全單流轉
  async updateOrderStatus(orderId: number, status: string) {
    // ❌ 修復前: /api/orders/... (會變成 /api/api/orders/...)
    // ✅ 修復後: /orders/...
    await apiClient.patch(`/orders/${orderId}/status`, { status });
  }
}

export const sellerFlowerRepository = new SellerFlowerRepository();