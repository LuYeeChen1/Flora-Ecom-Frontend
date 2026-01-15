<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { HttpFlowerRepository } from '../../infrastructure/repositories/HttpFlowerRepository';
import Navbar from '../components/Navbar.vue'; // 确保你有这个组件，如果没有可以删掉这行

const route = useRoute();
const repo = new HttpFlowerRepository();

const flower = ref<any>(null);
const loading = ref(true);
const error = ref(null);

onMounted(async () => {
  try {
    // 从路由中获取 ID (比如 /flowers/1 -> id=1)
    const flowerId = route.params.id as string;
    
    // 调用 API 获取详情
    // 注意：HttpFlowerRepository 需要有 getFlowerById 方法
    flower.value = await repo.getFlowerById(flowerId);
  } catch (err: any) {
    error.value = err;
  } finally {
    loading.value = false;
  }
});
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
             <button class="flex-1 bg-slate-900 text-white py-4 rounded-lg hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200 font-bold tracking-wide">
               ADD TO CART
             </button>
           </div>
        </div>

      </div>
    </div>
  </div>
</template>