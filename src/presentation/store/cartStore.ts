import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { CartRepository, type CartItem } from '../../infrastructure/repositories/CartRepository';
import { useAuthStore } from './authStore';

export const useCartStore = defineStore('cart', () => {
  const repo = new CartRepository();
  const authStore = useAuthStore();

  // --- State ---
  const items = ref<CartItem[]>([]);
  const isLoading = ref(false);
  const isCartOpen = ref(false); // 控制购物车侧边栏/弹窗的开关

  // --- Getters (自动计算) ---
  
  // 1. 购物车里的总件数 (例如：买了2朵红玫瑰，3朵百合，总数是 5)
  const totalItems = computed(() => {
    return items.value.reduce((sum, item) => sum + item.quantity, 0);
  });

  // 2. 购物车总金额
  const totalPrice = computed(() => {
    return items.value.reduce((sum, item) => sum + item.subtotal, 0);
  });

  // --- Actions ---

  // 刷新购物车数据
  async function fetchCart() {
    if (!authStore.token) {
      items.value = [];
      return;
    }
    
    try {
      // 不要在后台静默加载时显示全屏 loading，体验不好
      // 可以在 UI 层单独处理 loading 状态
      const data = await repo.getMyCart();
      items.value = data;
    } catch (err) {
      console.error("Fetch cart failed", err);
    }
  }

  // 添加商品 (加完后自动刷新列表，并打开购物车让用户看到)
  async function addItem(flowerId: number | string, quantity: number = 1) {
    if (!authStore.token) {
      alert("请先登录再购物");
      return false;
    }
    
    isLoading.value = true;
    try {
      await repo.addToCart(flowerId, quantity);
      await fetchCart(); // 重新拉取最新数据
      isCartOpen.value = true; //以此打开购物车 UI
      return true;
    } catch (err) {
      console.error("Add to cart failed", err);
      alert("添加失败，请重试");
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  // 移除商品
  async function removeItem(cartId: number) {
    try {
      await repo.removeFromCart(cartId);
      // 乐观更新：先从本地数组删掉，让界面反应更快
      items.value = items.value.filter(item => item.id !== cartId);
      // 也可以选择 await fetchCart() 确保数据绝对同步
    } catch (err) {
      console.error("Remove item failed", err);
    }
  }

  // 切换购物车显示/隐藏
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
    removeItem,
    toggleCart
  };
});