<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../store/authStore';

const router = useRouter();
const authStore = useAuthStore();

// 模拟数据 (后续会对接真实 API)
const stats = ref([
  { title: 'Total Flowers', value: '12', icon: '🌸', color: 'bg-purple-100 text-purple-600' },
  { title: 'Pending Orders', value: '5', icon: '📦', color: 'bg-blue-100 text-blue-600' },
  { title: 'Total Revenue', value: 'RM 1,280', icon: '💰', color: 'bg-green-100 text-green-600' },
  { title: 'Rating', value: '4.9', icon: '⭐', color: 'bg-yellow-100 text-yellow-600' },
]);

// 简单的登出逻辑
const handleLogout = async () => {
  await authStore.logout();
  router.push('/login');
};
</script>

<template>
  <div class="min-h-screen bg-slate-50 flex font-serif">
    
    <aside class="w-64 bg-slate-900 text-slate-300 flex flex-col fixed h-full shadow-2xl z-20">
      <div class="p-8 border-b border-slate-800">
        <h1 class="text-2xl text-white font-italic tracking-widest">FlowerShop</h1>
        <p class="text-xs text-purple-400 mt-2 uppercase tracking-wider">Merchant Center</p>
      </div>

      <nav class="flex-1 p-4 space-y-2">
        <a href="#" class="flex items-center gap-3 px-4 py-3 bg-purple-600/20 text-purple-300 rounded-lg border border-purple-500/30 transition-all">
          <span>📊</span> Dashboard
        </a>
        <a href="#" class="flex items-center gap-3 px-4 py-3 hover:bg-white/5 hover:text-white rounded-lg transition-all opacity-50 cursor-not-allowed" title="Coming Soon">
          <span>🌹</span> My Flowers
        </a>
        <a href="#" class="flex items-center gap-3 px-4 py-3 hover:bg-white/5 hover:text-white rounded-lg transition-all opacity-50 cursor-not-allowed" title="Coming Soon">
          <span>🧾</span> Orders
        </a>
        <a href="#" class="flex items-center gap-3 px-4 py-3 hover:bg-white/5 hover:text-white rounded-lg transition-all opacity-50 cursor-not-allowed" title="Coming Soon">
          <span>⚙️</span> Settings
        </a>
      </nav>

      <div class="p-4 border-t border-slate-800">
        <button @click="router.push('/profile')" class="flex items-center gap-3 px-4 py-3 w-full hover:bg-white/5 text-slate-400 hover:text-white rounded-lg transition-all text-sm">
          <span>←</span> Back to Profile
        </button>
      </div>
    </aside>

    <main class="flex-1 ml-64 p-8">
      <header class="flex justify-between items-center mb-10">
        <div>
          <h2 class="text-3xl text-slate-800">Welcome back, {{ authStore.user?.username || 'Florist' }}</h2>
          <p class="text-slate-500 mt-1 italic">"May your garden bloom with prosperity today."</p>
        </div>
        <div class="flex items-center gap-4">
           <div class="w-10 h-10 rounded-full bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-700 font-bold">
             {{ authStore.user?.username?.charAt(0).toUpperCase() }}
           </div>
        </div>
      </header>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div v-for="stat in stats" :key="stat.title" class="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div class="flex justify-between items-start">
            <div>
              <p class="text-sm text-slate-500 uppercase tracking-wider font-sans">{{ stat.title }}</p>
              <h3 class="text-2xl font-bold text-slate-800 mt-2 font-sans">{{ stat.value }}</h3>
            </div>
            <div :class="`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`">
              {{ stat.icon }}
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-slate-100 p-8 text-center py-20">
        <div class="text-4xl mb-4">🌻</div>
        <h3 class="text-lg text-slate-800 font-medium">Your garden is ready</h3>
        <p class="text-slate-500 mt-2 max-w-md mx-auto">
          You are now a verified seller. Start by listing your first flower arrangement to the global marketplace.
        </p>
        <button class="mt-6 px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200/50 cursor-not-allowed opacity-70">
          + Add New Flower (Coming Next)
        </button>
      </div>
    </main>
  </div>
</template>