import apiClient from '../api/apiClient';

// === 數據接口定義 ===
export interface OrderItem {
  id: number;
  flowerName: string;
  quantity: number;
  priceAtPurchase: number;
  imageUrl?: string;
}

export interface Order {
  id: number;
  totalPrice: number;
  status: string;
  createdAt: string;
  shippingAddress: string;
  receiverName?: string;
  receiverPhone?: string;
  receiverEmail?: string;
  items: OrderItem[];
}

export interface CheckoutRequest {
  receiverName: string;
  receiverPhone: string;
  shippingAddress: string;
}

export interface CheckoutResponse {
  message: string;
  orderId: number;
}

export class OrderRepository {
  
  // 1. 下單
  async checkout(request: CheckoutRequest): Promise<CheckoutResponse> {
    const response = await apiClient.post('/orders/checkout', request);
    return response.data;
  }

  // 2. 獲取我的訂單列表
  async getMyOrders(): Promise<Order[]> {
    const response = await apiClient.get('/orders');
    return response.data;
  }
}