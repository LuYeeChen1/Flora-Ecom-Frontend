import apiClient from '../api/apiClient';

// 對應後端的 CartItemDTOResponse
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
  
  // 1. 獲取我的購物車
  async getMyCart(): Promise<CartItem[]> {
    // Token 由 apiClient 攔截器自動注入
    const response = await apiClient.get('/cart');
    return response.data;
  }

  // 2. 添加商品
  async addToCart(flowerId: number | string, quantity: number = 1) {
    const response = await apiClient.post('/cart', {
      flowerId: Number(flowerId),
      quantity: quantity
    });
    return response.data;
  }

  // 3. 更新數量
  async updateQuantity(cartId: number, quantity: number) {
    const response = await apiClient.patch(`/cart/${cartId}`, { quantity });
    return response.data;
  }

  // 4. 移除商品
  async removeFromCart(cartId: number) {
    await apiClient.delete(`/cart/${cartId}`);
  }
}