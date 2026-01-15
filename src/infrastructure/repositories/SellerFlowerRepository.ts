import axios from 'axios';

// 对应后端的 FlowerDTORequest
export interface FlowerData {
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  imageUrl: string; // 这里存的是 S3 Key
}

export class SellerFlowerRepository {
  private baseUrl = 'http://localhost:8080/api/seller/flowers';

  /**
   * 1. 向后端申请 "上传通行证" (Presigned URL)
   */
  async getUploadUrl(token: string, fileType: string, fileName: string) {
    const response = await axios.get(`${this.baseUrl}/upload-url`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { 
        contentType: fileType, 
        fileName: fileName 
      }
    });
    // 后端返回: { uploadUrl: "https://s3...", key: "flowers/..." }
    return response.data; 
  }

  /**
   * 2. 前端直传 AWS S3 (PUT)
   * 注意：不带 Authorization 头，因为权限签名已经在 URL 里了
   */
  async uploadToS3(uploadUrl: string, file: File) {
    await axios.put(uploadUrl, file, {
      headers: { 'Content-Type': file.type }
    });
  }

  /**
   * 3. 上传成功后，通知后端保存鲜花档案
   */
  async createFlower(token: string, flower: FlowerData) {
    await axios.post(this.baseUrl, flower, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }
}