import { useAuthStore } from '../../presentation/store/authStore';
import apiClient from '../api/apiClient';

// === 数据接口定义 (对应后端实体) ===
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
  status: string; // PAID, PENDING, SHIPPED...
  createdAt: string; // 后端返回的时间字符串
  shippingAddress: string;
  //  新增：后端现在会返回这些详细信息
  receiverName?: string;
  receiverPhone?: string;
  receiverEmail?: string;
  items: OrderItem[];
}

//  核心更新：下单请求体包含完整联系人信息
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
  
  private getHeaders() {
    const authStore = useAuthStore();
    return { 
      Authorization: `Bearer ${authStore.token}` 
    };
  }

  // 1. 下单
  async checkout(request: CheckoutRequest): Promise<CheckoutResponse> {
    const response = await apiClient.post('/orders/checkout', request, {
      headers: this.getHeaders()
    });
    return response.data;
  }

  // 2. 获取我的订单列表
  async getMyOrders(): Promise<Order[]> {
    const response = await apiClient.get('/orders', {
      headers: this.getHeaders()
    });
    return response.data;
  }
}