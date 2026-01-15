import apiClient from '../api/apiClient';

// 对应后端的 CartItemDTOResponse
export interface CartItem {
  id: number;          // 购物车条目 ID
  flowerId: number;    // 鲜花 ID
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
  subtotal: number;
}

export class CartRepository {
  
  // 1. 获取我的购物车
  async getMyCart(): Promise<CartItem[]> {
    const response = await apiClient.get('/cart');
    return response.data;
  }

  // 2. 添加商品
  async addToCart(flowerId: number | string, quantity: number = 1) {
    await apiClient.post('/cart', {
      flowerId: Number(flowerId),
      quantity: quantity
    });
  }

  // 3. 移除商品
  async removeFromCart(cartId: number) {
    await apiClient.delete(`/cart/${cartId}`);
  }
}