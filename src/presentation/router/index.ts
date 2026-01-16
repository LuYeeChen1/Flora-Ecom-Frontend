import { createRouter, createWebHistory } from 'vue-router'
import ApplySellerView from '../views/ApplySellerView.vue'
import CartView from '../views/CartView.vue'
import FlowerDetailView from '../views/FlowerDetailView.vue'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import NotFound from '../views/NotFound.vue'
import ProfileView from '../views/ProfileView.vue'
import RegisterSuccessView from '../views/RegisterSuccessView.vue'
import SellerDashboardView from '../views/SellerDashboardView.vue'
// 1. 引入新页面
import OrderListView from '../views/OrderListView.vue'

import { useAuthStore } from '../store/authStore'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/login', name: 'login', component: LoginView },
    { path: '/profile', name: 'profile', component: ProfileView },
    { path: '/register-success', name: 'register-success', component: RegisterSuccessView },
    
    // 卖家申请
    {
      path: '/apply-seller',
      name: 'apply-seller',
      component: ApplySellerView,
    },

    // 鲜花详情
    {
      path: '/flowers/:id',
      name: 'flower-detail',
      component: FlowerDetailView,
      props: true 
    },

    // 购物车
    {
      path: '/cart',
      name: 'cart',
      component: CartView,
      meta: { requiresAuth: true } 
    },

    // ✅ 2. 注册订单列表路由
    {
      path: '/orders',
      name: 'orders',
      component: OrderListView,
      meta: { requiresAuth: true }
    },

    // 卖家仪表盘
    {
      path: '/seller/dashboard',
      name: 'seller-dashboard',
      component: SellerDashboardView,
      beforeEnter: async (to, from, next) => {
        const authStore = useAuthStore();
        if (authStore.isLoading) {
           // wait logic could be added here
        }
        if (authStore.user?.role === 'SELLER' || authStore.user?.role === 'ADMIN') {
          next(); 
        } else {
          alert("Access Denied: Merchant Zone Only.");
          next('/profile'); 
        }
      }
    },

    { path: '/:pathMatch(.*)*', name: 'not-found', component: NotFound },
  ]
})

export default router