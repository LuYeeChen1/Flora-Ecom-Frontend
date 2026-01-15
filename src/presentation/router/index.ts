import { createRouter, createWebHistory } from 'vue-router'
// ✅ 修正路径：从 ../presentation/views 改为 ../views
import ApplySellerView from '../views/ApplySellerView.vue'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import NotFound from '../views/NotFound.vue'
import ProfileView from '../views/ProfileView.vue'
import RegisterSuccessView from '../views/RegisterSuccessView.vue'
import SellerDashboardView from '../views/SellerDashboardView.vue'

// ✅ 修正路径：从 ../presentation/store 改为 ../store
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

    // 卖家仪表盘 (带权限守卫)
    {
      path: '/seller/dashboard',
      name: 'seller-dashboard',
      component: SellerDashboardView,
      beforeEnter: async (to, from, next) => {
        const authStore = useAuthStore();
        
        // 简单等待 Auth 加载
        if (authStore.isLoading) {
           // 可选：添加等待逻辑
        }

        // 权限检查
        if (authStore.user?.role === 'SELLER' || authStore.user?.role === 'ADMIN') {
          next(); 
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