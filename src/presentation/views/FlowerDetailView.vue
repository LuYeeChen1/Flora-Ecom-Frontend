<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { HttpFlowerRepository } from '../../infrastructure/repositories/HttpFlowerRepository';
import Navbar from '../components/Navbar.vue';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';

const route = useRoute();
const repo = new HttpFlowerRepository();
const cartStore = useCartStore();
const authStore = useAuthStore();

const flower = ref<any>(null);
const loading = ref(true);
const error = ref(null);
const isAdding = ref(false);

// 计算是否是店主
const isOwner = computed(() => {
  if (!flower.value || !authStore.user) return false;
  // 注意：后端返回的 sellerId 和 Cognito ID (sub) 应该是匹配的
  return flower.value.sellerId === authStore.user.id; 
});

onMounted(async () => {
  try {
    const flowerId = route.params.id as string;
    flower.value = await repo.getFlowerById(flowerId);
  } catch (err: any) {
    error.value = err;
  } finally {
    loading.value = false;
  }
});

const handleAddToCart = async () => {
  if (!flower.value) return;
  // 🛡️ 前端防御
  if (isOwner.value) {
    alert("❌ You cannot buy your own product!");
    return;
  }
  
  isAdding.value = true;
  // 修正：直接調用，不聲明 const success
  await cartStore.addItem(flower.value.id, 1);
  isAdding.value = false;
};
</script>

<template>
  <div class="min-h-screen bg-slate-50 font-serif">
    <Navbar />

    <div v-if="loading" class="flex justify-center pt-20">
      <div class="animate-pulse text-purple-600">Loading flower details...</div>
    </div>
    
    <div v-else-if="flower" class="max-w-6xl mx-auto px-4 py-12">
      <div class="text-sm text-slate-400 mb-6">
        <router-link to="/" class="hover:text-purple-600">Home</router-link> 
        <span class="mx-2">/</span> 
        <span>{{ flower.category }}</span>
      </div>

      <div class="bg-white rounded-2xl shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-2">
        
        <div class="h-[500px] lg:h-auto bg-slate-100 relative group">
           <img :src="flower.imageUrl" class="absolute inset-0 w-full h-full object-cover" />
        </div>

        <div class="p-10 lg:p-14 flex flex-col">
           <div class="mb-auto">
             <span class="text-purple-600 text-sm tracking-widest uppercase font-bold border border-purple-200 px-2 py-1 rounded">{{ flower.category }}</span>
             <h1 class="text-4xl text-slate-900 mt-4 mb-4 italic">{{ flower.name }}</h1>
             <div class="text-3xl text-emerald-600 font-bold mb-6 font-sans">RM {{ flower.price }}</div>
             
             <div class="prose prose-slate text-slate-600 leading-relaxed mb-8">
               {{ flower.description }}
             </div>

             <div class="flex items-center gap-4 text-sm text-slate-500 font-sans border-y border-slate-100 py-4">
                <span>📦 Stock: {{ flower.stock }} available</span>
                <span>🆔 SKU: {{ flower.id }}</span>
             </div>
           </div>

           <div class="mt-10 pt-8">
             <h3 class="text-xs text-slate-400 uppercase tracking-widest mb-4">Sold By</h3>
             <div class="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 hover:border-purple-200 transition-colors cursor-pointer">
                <div class="w-12 h-12 rounded-full bg-slate-200 overflow-hidden shrink-0">
                   <img v-if="flower.sellerAvatar" :src="flower.sellerAvatar" class="w-full h-full object-cover" />
                   <div v-else class="w-full h-full flex items-center justify-center text-slate-400 text-xl">👤</div>
                </div>
                
                <div>
                   <div class="flex items-center gap-2">
                     <span class="font-bold text-slate-800">{{ flower.sellerName || 'Unknown Seller' }}</span>
                     <span v-if="flower.verified" class="text-blue-500" title="Verified Seller">
                       <svg class="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/></svg>
                     </span>
                   </div>
                   <div class="text-xs text-slate-500 mt-0.5">
                     {{ flower.sellerType === 'INDIVIDUAL' ? 'Independent Artist' : 'Business Account' }}
                   </div>
                </div>
             </div>
           </div>

           <div class="mt-8 flex gap-4 font-sans">
             <button 
               @click="handleAddToCart"
               :disabled="isAdding || cartStore.isLoading || isOwner || flower.stock <= 0"
               :class="[
                 'flex-1 py-4 rounded-lg transition-all shadow-lg font-bold tracking-wide flex justify-center items-center gap-2',
                 isOwner || flower.stock <= 0
                   ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' 
                   : 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-200'
               ]"
             >
               <span v-if="isAdding" class="animate-spin">❄️</span>
               
               <span v-if="flower.stock <= 0">OUT OF STOCK</span>
               <span v-else-if="isOwner">🚫 YOU OWN THIS ITEM</span>
               <span v-else>{{ isAdding ? 'ADDING...' : 'ADD TO CART' }}</span>
             </button>
           </div>
        </div>

      </div>
    </div>
  </div>
</template>