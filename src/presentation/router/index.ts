import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../store/authStore'
import AddressBookView from '../views/AddressBookView.vue'
import ApplySellerView from '../views/ApplySellerView.vue'
import CartView from '../views/CartView.vue'
import CatalogView from '../views/CatalogView.vue'
import FlowerDetailView from '../views/FlowerDetailView.vue'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import NotFound from '../views/NotFound.vue'
import OrderHistoryView from '../views/OrderHistoryView.vue'
import ProfileView from '../views/ProfileView.vue'
import RegisterSuccessView from '../views/RegisterSuccessView.vue'
import SellerDashboardView from '../views/SellerDashboardView.vue'
import SellerOrderDetailView from '../views/SellerOrderDetailView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/login', name: 'login', component: LoginView },
    { path: '/profile', name: 'profile', component: ProfileView },
    { path: '/register-success', name: 'register-success', component: RegisterSuccessView },
    { path: '/apply-seller', name: 'apply-seller', component: ApplySellerView },
    { path: '/catalog', name: 'catalog', component: CatalogView },
    { path: '/flowers/:id', name: 'flower-detail', component: FlowerDetailView, props: true },
    { path: '/cart', name: 'cart', component: CartView, meta: { requiresAuth: true } },
    { path: '/orders', name: 'orders', component: OrderHistoryView, meta: { requiresAuth: true } },
    { path: '/address-book', name: 'address-book', component: AddressBookView, meta: { requiresAuth: true } },

    // 卖家仪表盘
    {
      path: '/seller/dashboard',
      name: 'seller-dashboard',
      component: SellerDashboardView,
      meta: { requiresSeller: true }
    },
    
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
// 修复：将 'from' 改为 '_from'，告诉 TS 忽略这个未使用的变量
router.beforeEach(async (to, _from, next) => {
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