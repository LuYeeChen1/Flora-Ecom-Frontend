import { useAuthStore } from '../../presentation/store/authStore'; // 1. 引入 Store
import apiClient from '../api/apiClient';

// 对应后端的 CartItemDTOResponse
export interface CartItem {
  id: number;
  flowerId: number;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
  subtotal: number;
}

export class CartRepository {
  
  // 🛠️ 辅助方法：手动获取 Token Header
  // 这样即便全局拦截器失效，这里也能强制带上 Token
  private getHeaders() {
    const authStore = useAuthStore();
    if (!authStore.token) return {};
    return { 
      Authorization: `Bearer ${authStore.token}` 
    };
  }

  // 1. 获取我的购物车
  async getMyCart(): Promise<CartItem[]> {
    const response = await apiClient.get('/cart', {
      headers: this.getHeaders() // ✅ 显式传递 Header
    });
    return response.data;
  }

  // 2. 添加商品
  async addToCart(flowerId: number | string, quantity: number = 1) {
    // 注意：post 的第三个参数才是 config (headers)
    const response = await apiClient.post('/cart', 
      {
        flowerId: Number(flowerId),
        quantity: quantity
      }, 
      {
        headers: this.getHeaders() // ✅ 显式传递 Header
      }
    );
    return response.data;
  }

  // 3. 移除商品
  async removeFromCart(cartId: number) {
    await apiClient.delete(`/cart/${cartId}`, {
      headers: this.getHeaders() // ✅ 显式传递 Header
    });
  }
}