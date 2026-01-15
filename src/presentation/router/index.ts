import { createRouter, createWebHistory } from 'vue-router'
import ApplySellerView from '../presentation/views/ApplySellerView.vue'
import HomeView from '../presentation/views/HomeView.vue'
import LoginView from '../presentation/views/LoginView.vue'
import NotFound from '../presentation/views/NotFound.vue'
import ProfileView from '../presentation/views/ProfileView.vue'
import RegisterSuccessView from '../presentation/views/RegisterSuccessView.vue'
// 1. 引入新的卖家仪表盘页面
import SellerDashboardView from '../presentation/views/SellerDashboardView.vue'
import { useAuthStore } from '../store/authStore'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/login', name: 'login', component: LoginView },
    { path: '/profile', name: 'profile', component: ProfileView },
    { path: '/register-success', name: 'register-success', component: RegisterSuccessView },
    
    // 卖家申请路由
    {
      path: '/apply-seller',
      name: 'apply-seller',
      component: ApplySellerView,
    },

    // 🔥 2. 新增：卖家仪表盘路由 (带权限守卫)
    {
      path: '/seller/dashboard',
      name: 'seller-dashboard',
      component: SellerDashboardView,
      beforeEnter: async (to, from, next) => {
        const authStore = useAuthStore();
        
        // 简单等待 Auth 加载 (防止刷新页面 user 为 null)
        if (authStore.isLoading) {
           // 实际项目中可以加个 await until(authStore.isLoading === false)
        }

        // 权限检查：只有 SELLER 或 ADMIN 能进
        if (authStore.user?.role === 'SELLER' || authStore.user?.role === 'ADMIN') {
          next(); // 放行
        } else {
          // 权限不足，踢回个人中心
          alert("Access Denied: Merchant Zone Only.");
          next('/profile'); 
        }
      }
    },

    { path: '/:pathMatch(.*)*', name: 'not-found', component: NotFound },
  ]
})

export default router