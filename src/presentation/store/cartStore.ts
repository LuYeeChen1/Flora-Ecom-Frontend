import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { CartRepository, type CartItem } from '../../infrastructure/repositories/CartRepository';
import { useAuthStore } from './authStore';

// 1. 引入 OrderRepository
import { OrderRepository } from '../../infrastructure/repositories/OrderRepository';

export const useCartStore = defineStore('cart', () => {
  const repo = new CartRepository();
  const orderRepo = new OrderRepository(); // 初始化

  const authStore = useAuthStore();

  // --- State (状态) ---
  const items = ref<CartItem[]>([]);
  const isLoading = ref(false);
  const isCartOpen = ref(false); 

  // --- Getters (自动计算) ---
  
  const totalItems = computed(() => {
    return items.value.reduce((sum, item) => sum + item.quantity, 0);
  });

  const totalPrice = computed(() => {
    return items.value.reduce((sum, item) => sum + item.subtotal, 0);
  });

  // --- Actions (动作) ---

  async function fetchCart() {
    if (!authStore.token) {
      items.value = [];
      return;
    }
    
    isLoading.value = true;
    try {
      const data = await repo.getMyCart();
      items.value = data;
    } catch (err) {
      console.error("Fetch cart failed", err);
    } finally {
      isLoading.value = false;
    }
  }

  async function addItem(flowerId: number | string, quantity: number = 1) {
    if (!authStore.token) {
      alert("请先登录再购物");
      return false;
    }
    
    isLoading.value = true;
    try {
      await repo.addToCart(flowerId, quantity);
      await fetchCart(); 
      return true;
    } catch (err) {
      console.error("Add to cart failed", err);
      alert("添加失败，请重试");
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  async function changeQuantity(cartId: number, currentQty: number, delta: number) {
    const newQty = currentQty + delta;
    
    if (newQty <= 0) {
      await removeItem(cartId);
      return;
    }

    try {
      const item = items.value.find(i => i.id === cartId);
      if (item) {
        item.quantity = newQty;
        item.subtotal = item.price * newQty;
      }

      await repo.updateQuantity(cartId, newQty);
    } catch (err) {
      console.error("Update quantity failed, rolling back...", err);
      await fetchCart();
    }
  }

  async function removeItem(cartId: number) {
    try {
      await repo.removeFromCart(cartId);
      items.value = items.value.filter(item => item.id !== cartId);
    } catch (err) {
      console.error("Remove item failed", err);
      await fetchCart();
    }
  }

  // 修复：checkout 接收完整参数 (地址、姓名、电话)
  async function checkout(shippingAddress: string, receiverName: string, receiverPhone: string) {
    if (!authStore.token) {
      alert("Please login to checkout");
      return { success: false };
    }

    isLoading.value = true;
    try {
      // 1. 调用 API 下单，传入完整参数
      const result = await orderRepo.checkout({ 
        shippingAddress,
        receiverName, 
        receiverPhone 
      });
      
      items.value = []; 
      
      return { success: true, orderId: result.orderId };
    } catch (err: any) {
      console.error("Checkout failed", err);
      const errorMsg = err.response?.data?.error || "Checkout failed. Please try again.";
      return { success: false, error: errorMsg };
    } finally {
      isLoading.value = false;
    }
  }

  function toggleCart() {
    isCartOpen.value = !isCartOpen.value;
  }

  return {
    items,
    isLoading,
    isCartOpen,
    totalItems,
    totalPrice,
    fetchCart,
    addItem,
    changeQuantity,
    removeItem,
    toggleCart,
    checkout
  };
});