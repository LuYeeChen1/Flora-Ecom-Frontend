import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { CartRepository, type CartItem } from '../../infrastructure/repositories/CartRepository';
import { useAuthStore } from './authStore';

export const useCartStore = defineStore('cart', () => {
  const repo = new CartRepository();
  const authStore = useAuthStore();

  // --- State (状态) ---
  const items = ref<CartItem[]>([]);
  const isLoading = ref(false);
  const isCartOpen = ref(false); // 控制购物车侧边栏/弹窗的开关 (虽然现在改用了独立页面，保留此状态可用于未来扩展)

  // --- Getters (自动计算) ---
  
  // 1. 购物车里的商品总件数
  const totalItems = computed(() => {
    return items.value.reduce((sum, item) => sum + item.quantity, 0);
  });

  // 2. 购物车总金额
  const totalPrice = computed(() => {
    return items.value.reduce((sum, item) => sum + item.subtotal, 0);
  });

  // --- Actions (动作) ---

  // 1. 刷新/获取购物车数据
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

  // 2. 添加商品到购物车
  async function addItem(flowerId: number | string, quantity: number = 1) {
    if (!authStore.token) {
      alert("请先登录再购物");
      return false;
    }
    
    isLoading.value = true;
    try {
      await repo.addToCart(flowerId, quantity);
      await fetchCart(); // 重新拉取最新数据
      return true;
    } catch (err) {
      console.error("Add to cart failed", err);
      alert("添加失败，请重试");
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  // 3. 核心新增：直接修改商品数量 (用于 + / - 按钮)
  async function changeQuantity(cartId: number, currentQty: number, delta: number) {
    const newQty = currentQty + delta;
    
    // 如果数量减到 0，则触发删除逻辑
    if (newQty <= 0) {
      await removeItem(cartId);
      return;
    }

    try {
      // 1. 乐观更新：先在 UI 上修改，提升用户体验
      const item = items.value.find(i => i.id === cartId);
      if (item) {
        item.quantity = newQty;
        item.subtotal = item.price * newQty;
      }

      // 2. 后端同步
      await repo.updateQuantity(cartId, newQty);
    } catch (err) {
      console.error("Update quantity failed, rolling back...", err);
      // 如果后端更新失败，重新抓取数据以纠正本地 UI
      await fetchCart();
    }
  }

  // 4. 移除商品
  async function removeItem(cartId: number) {
    try {
      await repo.removeFromCart(cartId);
      // 乐观更新：直接从本地数组删掉
      items.value = items.value.filter(item => item.id !== cartId);
    } catch (err) {
      console.error("Remove item failed", err);
      await fetchCart();
    }
  }

  // 5. 切换购物车显示/隐藏 (若有侧边栏需求可用)
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
    changeQuantity, // ✅ 记得导出新方法
    removeItem,
    toggleCart
  };
});