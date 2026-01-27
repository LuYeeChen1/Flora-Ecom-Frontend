<script setup lang="ts">
import "@aws-amplify/ui-vue/styles.css";
import { onMounted } from 'vue';
import Navbar from './presentation/components/Navbar.vue';
import { useAuthStore } from './presentation/store/authStore';

// 1. 获取 Store 实例
const authStore = useAuthStore();

// 2. 当应用启动/挂载时，自动检查用户是否已登录
onMounted(async () => {
  await authStore.checkAuth();
});
</script>

<template>
  <div class="min-h-screen bg-slate-50 font-sans text-slate-900">
    <Navbar />
    
    <main class="container mx-auto p-4">
      <router-view></router-view>
    </main>
  </div>
</template>