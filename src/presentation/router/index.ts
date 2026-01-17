import { createRouter, createWebHistory } from 'vue-router'
import AddressBookView from '../views/AddressBookView.vue'
import ApplySellerView from '../views/ApplySellerView.vue'
import CartView from '../views/CartView.vue'
import FlowerDetailView from '../views/FlowerDetailView.vue'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import NotFound from '../views/NotFound.vue'
import ProfileView from '../views/ProfileView.vue'
import RegisterSuccessView from '../views/RegisterSuccessView.vue'
import SellerDashboardView from '../views/SellerDashboardView.vue'
// ✅ 引入新详情页
import SellerOrderDetailView from '../views/SellerOrderDetailView.vue'
// ✅ 统一使用 OrderHistoryView
import OrderHistoryView from '../views/OrderHistoryView.vue'

import { useAuthStore } from '../store/authStore'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/login', name: 'login', component: LoginView },
    { path: '/profile', name: 'profile', component: ProfileView },
    { path: '/register-success', name: 'register-success', component: RegisterSuccessView },
    { path: '/apply-seller', name: 'apply-seller', component: ApplySellerView },
    { path: '/flowers/:id', name: 'flower-detail', component: FlowerDetailView, props: true },
    { path: '/cart', name: 'cart', component: CartView, meta: { requiresAuth: true } },
    
    // ✅ 统一订单历史入口
    { path: '/orders', name: 'orders', component: OrderHistoryView, meta: { requiresAuth: true } },
    { path: '/address-book', name: 'address-book', component: AddressBookView, meta: { requiresAuth: true } },

    // 卖家仪表盘
    {
      path: '/seller/dashboard',
      name: 'seller-dashboard',
      component: SellerDashboardView,
      meta: { requiresSeller: true } // 简化的 meta 标记，逻辑在下面 guard
    },
    
    // ✅ [新增] 卖家订单详情页
    {
      path: '/seller/orders/:id',
      name: 'seller-order-detail',
      component: SellerOrderDetailView,
      meta: { requiresSeller: true },
      props: true
    },

    { path: '/:pathMatch(.*)*', name: 'not-found', component: NotFound },
  ]
})

// 路由守卫
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  
  if (to.meta.requiresAuth && !authStore.token) {
    return next('/login');
  }

  if (to.meta.requiresSeller) {
    if (authStore.user?.role === 'SELLER' || authStore.user?.role === 'ADMIN') {
      return next();
    } else {
      alert("Access Denied: Merchant Zone Only.");
      return next('/profile');
    }
  }
  next();
});

export default router