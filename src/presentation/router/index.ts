import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import NotFound from '../views/NotFound.vue'
import ProfileView from '../views/ProfileView.vue'
import RegisterSuccessView from '../views/RegisterSuccessView.vue'
// 1. 引入申请页面
import ApplySellerView from '../views/ApplySellerView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/login', name: 'login', component: LoginView },
    { path: '/profile', name: 'profile', component: ProfileView },
    { path: '/register-success', name: 'register-success', component: RegisterSuccessView },
    
    // 2. 添加卖家申请路由
    {
      path: '/apply-seller',
      name: 'apply-seller',
      component: ApplySellerView,
      // 建议添加 meta: { requiresAuth: true } 配合路由守卫使用
    },

    { path: '/:pathMatch(.*)*', name: 'not-found', component: NotFound },
  ]
})

export default router