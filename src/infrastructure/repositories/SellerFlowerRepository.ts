import apiClient from '../api/apiClient';

export interface FlowerData {
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  imageUrl: string;
}

export class SellerFlowerRepository {
  
  // 1. 获取上传链接
  async getUploadUrl(fileType: string, fileName: string) {
    // 自动带上 Token，无需手动传
    const response = await apiClient.get('/seller/flowers/upload-url', {
      params: { contentType: fileType, fileName: fileName }
    });
    return response.data; 
  }

  // 2. 上传图片到 S3 (这个特殊，不走 apiClient，因为它不是发给后端的)
  async uploadToS3(uploadUrl: string, file: File) {
    await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: { 'Content-Type': file.type }
    });
  }

  // 3. 保存鲜花数据
  async createFlower(flower: FlowerData) {
    await apiClient.post('/seller/flowers', flower);
  }

  // 🔥 [新增] 获取我的库存 (从 SellerDashboardView 抽取出来的)
  async getMyInventory() {
    const response = await apiClient.get('/seller/flowers');
    return response.data;
  }
}