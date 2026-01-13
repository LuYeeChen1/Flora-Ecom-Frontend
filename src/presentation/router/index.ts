import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import NotFound from '../views/NotFound.vue'
// 1. 引入新页面
import ProfileView from '../views/ProfileView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    // 2. 添加 Profile 路由
    {
      path: '/profile',
      name: 'profile',
      component: ProfileView,
      // (可选) 可以在这里加 meta 字段标记需要登录
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: NotFound
    }
  ]
})

export default router