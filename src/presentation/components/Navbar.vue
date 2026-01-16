<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';

const authStore = useAuthStore();
const cartStore = useCartStore();
const router = useRouter();

const isProfileOpen = ref(false);

const handleLogout = async () => {
  await authStore.logout();
  isProfileOpen.value = false;
  router.push('/login');
};

// 挂载时拉取购物车数据，确保角标数字准确
onMounted(() => {
  if (authStore.user) {
    cartStore.fetchCart();
  }
});
</script>

<template>
  <nav class="sticky top-0 z-50 w-full border-b border-white/5 bg-slate-900/90 backdrop-blur-md">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="flex h-20 items-center justify-between">
        
        <div class="flex-shrink-0">
          <RouterLink to="/" class="flex items-center gap-3 group">
            <div class="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-emerald-600 p-[1px]">
              <div class="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-violet-200 font-serif italic text-sm border border-white/10">V</div>
            </div>
            <span class="text-2xl font-serif font-medium tracking-widest text-violet-100 group-hover:text-white transition-colors">FlowerShop</span>
          </RouterLink>
        </div>

        <div class="hidden md:block">
          <div class="ml-10 flex items-baseline space-x-10">
            <RouterLink to="/" class="text-slate-300 hover:text-violet-300 font-serif text-base tracking-wide transition-colors duration-300">首页</RouterLink>
            <RouterLink to="/catalog" class="text-slate-300 hover:text-violet-300 font-serif text-base tracking-wide transition-colors duration-300">鲜花图鉴</RouterLink>
            <a href="#" class="text-slate-300 hover:text-violet-300 font-serif text-base tracking-wide transition-colors duration-300">品牌故事</a>
          </div>
        </div>

        <div class="hidden md:flex relative items-center gap-8">
          
          <RouterLink 
            v-if="authStore.user" 
            to="/cart" 
            class="group relative p-2 text-slate-300 hover:text-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
            <span 
              v-if="cartStore.totalItems > 0"
              class="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-violet-600 rounded-full border border-slate-900 min-w-[18px]"
            >
              {{ cartStore.totalItems }}
            </span>
          </RouterLink>

          <div v-if="authStore.user" class="relative">
            <button 
              @click="isProfileOpen = !isProfileOpen"
              class="flex items-center gap-3 pl-3 pr-2 py-1.5 rounded-full hover:bg-white/5 transition-colors border border-transparent hover:border-white/10 focus:outline-none"
            >
              <span class="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-inner overflow-hidden">
                <img v-if="authStore.user?.avatarUrl" :src="authStore.user.avatarUrl" class="w-full h-full object-cover" />
                <span v-else>{{ authStore.user?.email ? authStore.user.email.charAt(0).toUpperCase() : 'U' }}</span>
              </span>
              
              <span class="text-sm font-medium text-violet-100 max-w-[150px] truncate">
                {{ authStore.user.username || authStore.user.email.split('@')[0] }}
              </span>

              <svg :class="{'rotate-180': isProfileOpen}" class="h-4 w-4 text-violet-300 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <div 
              v-if="isProfileOpen"
              class="absolute right-0 mt-2 w-56 bg-slate-800 border border-white/10 rounded-xl shadow-2xl py-2 z-50 transform origin-top-right transition-all backdrop-blur-xl"
            >
              <div class="px-4 py-3 border-b border-white/5 bg-white/5">
                <p class="text-xs text-slate-400 font-medium uppercase tracking-wider">Signed in as</p>
                <p class="text-sm font-bold text-white truncate mt-1">{{ authStore.user.email }}</p>
                <span class="inline-flex mt-2 items-center px-2 py-0.5 rounded text-[10px] font-medium bg-violet-900/50 text-violet-200 border border-violet-700/50">
                   {{ authStore.user.role }}
                </span>
              </div>
              
              <div class="py-1">
                 <RouterLink to="/profile" @click="isProfileOpen = false" class="flex items-center px-4 py-2.5 text-sm text-slate-300 hover:bg-violet-600/20 hover:text-white transition-colors">
                  <span class="mr-3">👤</span> 个人中心
                </RouterLink>

                <RouterLink to="/orders" @click="isProfileOpen = false" class="flex items-center px-4 py-2.5 text-sm text-slate-300 hover:bg-violet-600/20 hover:text-white transition-colors">
                  <span class="mr-3">📦</span> 我的订单
                </RouterLink>
                
                <RouterLink 
                  v-if="authStore.user.role === 'SELLER'" 
                  to="/seller/dashboard" 
                  @click="isProfileOpen = false"
                  class="flex items-center px-4 py-2.5 text-sm text-slate-300 hover:bg-violet-600/20 hover:text-white transition-colors"
                >
                  <span class="mr-3">📊</span> 卖家后台
                </RouterLink>
              </div>
              
              <div class="border-t border-white/5 py-1">
                <button 
                  @click="handleLogout"
                  class="flex w-full items-center px-4 py-2.5 text-sm text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors"
                >
                  <svg class="mr-3 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                  退出登录
                </button>
              </div>
            </div>
            
            <div v-if="isProfileOpen" @click="isProfileOpen = false" class="fixed inset-0 z-40 cursor-default"></div>
          </div>

          <RouterLink v-else to="/login">
            <button class="bg-violet-700/20 border border-violet-500/50 hover:bg-violet-600 text-violet-100 px-6 py-2 rounded-sm font-serif text-sm tracking-widest shadow-[0_0_15px_rgba(139,92,246,0.2)] hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] transition-all">
              登录 / 注册
            </button>
          </RouterLink>
        </div>
      </div>
    </div>
  </nav>
</template>