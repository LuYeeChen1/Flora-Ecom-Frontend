import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

// 路由懒加载：只有访问该页面时才加载代码，提升首屏速度
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/HomeView.vue')
  },
  {
    path: '/:pathMatch(.*)*', // 匹配所有未定义的路由
    name: 'NotFound',
    component: () => import('../views/NotFound.vue')
  }
]

const router = createRouter({
  // 使用 HTML5 History 模式 (不带 # 号)
  history: createWebHistory(),
  routes
})

export default router