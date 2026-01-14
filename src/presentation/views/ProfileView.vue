<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../store/authStore';

const authStore = useAuthStore();
const router = useRouter();

// 计算属性：获取显示名称 (优先显示用户名，没有则显示邮箱前缀)
const displayName = computed(() => {
  return authStore.user?.username || authStore.user?.email?.split('@')[0] || 'User';
});

// 计算属性：获取首字母用于头像
const initial = computed(() => {
  return displayName.value.charAt(0).toUpperCase();
});

// 如果用户未登录，强制跳回登录页
onMounted(() => {
  if (!authStore.user && !authStore.isLoading) {
    router.push('/login');
  }
});

const handleLogout = async () => {
  await authStore.logout();
  router.push('/login');
};
</script>

<template>
  <div class="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-3xl mx-auto">
      
      <div class="mb-8 text-center">
        <h1 class="text-3xl font-serif text-slate-900 tracking-wide">个人中心</h1>
        <p class="mt-2 text-slate-500 font-serif italic">Manage your account and view your profile.</p>
      </div>

      <div class="bg-white shadow-xl rounded-2xl overflow-hidden border border-slate-100">
        
        <div class="h-32 bg-gradient-to-r from-violet-600 to-indigo-600"></div>
        
        <div class="px-8 pb-8 relative">
          
          <div class="absolute -top-12 left-1/2 -translate-x-1/2 sm:left-8 sm:translate-x-0">
            <div class="w-24 h-24 rounded-full bg-slate-900 border-4 border-white shadow-lg flex items-center justify-center">
              <span class="text-3xl text-violet-200 font-serif italic">
                {{ initial }}
              </span>
            </div>
          </div>

          <div class="mt-16 text-center sm:mt-2 sm:ml-32 sm:text-left">
            <h2 class="text-2xl font-bold text-slate-900 break-all">
              {{ displayName }}
            </h2>
            <div class="mt-1 flex items-center justify-center sm:justify-start gap-2">
              <span class="text-sm text-slate-500">Current Role:</span>
              <span 
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                :class="{
                  'bg-blue-100 text-blue-800': authStore.user?.role === 'CUSTOMER',
                  'bg-purple-100 text-purple-800': authStore.user?.role === 'SELLER',
                  'bg-red-100 text-red-800': authStore.user?.role === 'ADMIN'
                }"
              >
                {{ authStore.user?.role || 'GUEST' }}
              </span>
            </div>
          </div>

          <div class="mt-8 border-t border-slate-100 pt-8">
            <dl class="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
              
              <div class="sm:col-span-1">
                <dt class="text-sm font-medium text-slate-500">Username</dt>
                <dd class="mt-1 text-sm text-slate-900 font-medium break-all">
                  {{ authStore.user?.username || 'Not set' }}
                </dd>
              </div>

              <div class="sm:col-span-1">
                <dt class="text-sm font-medium text-slate-500">Email Address</dt>
                <dd class="mt-1 text-sm text-slate-900 break-all">
                  {{ authStore.user?.email }}
                </dd>
              </div>

              <div class="sm:col-span-2">
                <dt class="text-sm font-medium text-slate-500">User ID (System Identifier)</dt>
                <dd class="mt-1 text-xs text-slate-400 font-mono break-all bg-slate-50 p-2 rounded border border-slate-100">
                  {{ authStore.user?.id }}
                </dd>
              </div>

              <div class="sm:col-span-1">
                <dt class="text-sm font-medium text-slate-500">Account Status</dt>
                <dd class="mt-1">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Active
                  </span>
                </dd>
              </div>
            </dl>
          </div>

          <div class="mt-10 flex gap-4 justify-center sm:justify-start">
          <button 
              v-if="authStore.user?.role === 'CUSTOMER'"
              @click="router.push('/apply-seller')" 
              class="px-4 py-2 bg-violet-600 text-white text-sm font-medium rounded-lg hover:bg-violet-700 transition-colors shadow-lg shadow-violet-200"
            >
              Apply to become Seller
            </button>
            
            <button 
              v-else
              class="px-4 py-2 bg-slate-100 text-slate-400 text-sm font-medium rounded-lg cursor-not-allowed"
              disabled
            >
              Edit Profile (Coming Soon)
            </button>

            <button 
              @click="handleLogout"
              class="px-4 py-2 bg-white text-red-500 border border-red-200 text-sm font-medium rounded-lg hover:bg-red-50 transition-colors"
            >
              Sign Out
            </button>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>