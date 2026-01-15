<script setup lang="ts">
import axios from 'axios';
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import Navbar from '../components/Navbar.vue';

const route = useRoute();
const flowerId = route.params.id;
const flower = ref<any>(null);
const loading = ref(true);

onMounted(async () => {
  try {
    const res = await axios.get(`http://localhost:8080/api/public/flowers/${flowerId}`);
    flower.value = res.data;
  } catch (e) {
    console.error("加载详情失败", e);
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="min-h-screen bg-slate-50 font-serif">
    <Navbar />

    <div v-if="loading" class="flex justify-center pt-20">Loading...</div>
    
    <div v-else-if="flower" class="max-w-6xl mx-auto px-4 py-12">
      <div class="bg-white rounded-2xl shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-2">
        
        <div class="h-[500px] lg:h-auto bg-slate-100 relative">
           <img :src="flower.imageUrl" class="absolute inset-0 w-full h-full object-cover" />
        </div>

        <div class="p-10 lg:p-14 flex flex-col">
           <div class="mb-auto">
             <span class="text-purple-600 text-sm tracking-widest uppercase font-bold">{{ flower.category }}</span>
             <h1 class="text-4xl text-slate-900 mt-2 mb-4 italic">{{ flower.name }}</h1>
             <div class="text-2xl text-emerald-600 font-bold mb-6">RM {{ flower.price }}</div>
             <p class="text-slate-600 leading-relaxed">{{ flower.description }}</p>
           </div>

           <div class="mt-10 pt-8 border-t border-slate-100">
             <h3 class="text-xs text-slate-400 uppercase tracking-widest mb-4">Merchant Profile</h3>
             <div class="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div class="w-12 h-12 rounded-full bg-slate-200 overflow-hidden">
                   <img v-if="flower.sellerAvatar" :src="flower.sellerAvatar" class="w-full h-full object-cover" />
                   <div v-else class="w-full h-full flex items-center justify-center text-slate-400">?</div>
                </div>
                <div>
                   <div class="flex items-center gap-2">
                     <span class="font-bold text-slate-800">{{ flower.sellerName }}</span>
                     <span v-if="flower.verified" class="text-blue-500 text-[10px] bg-blue-50 px-1 rounded border border-blue-100">Verified</span>
                   </div>
                   <div class="text-xs text-slate-500 mt-0.5">
                     {{ flower.sellerType === 'INDIVIDUAL' ? 'Independent Artist' : 'Registered Business' }}
                   </div>
                </div>
                <button class="ml-auto text-sm text-purple-600 hover:text-purple-700 font-medium">
                  View Store →
                </button>
             </div>
           </div>

           <div class="mt-8 flex gap-4">
             <button class="flex-1 bg-slate-900 text-white py-4 rounded-lg hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200">
               Contact Seller
             </button>
             <button class="flex-1 border border-slate-200 text-slate-900 py-4 rounded-lg hover:bg-slate-50 transition-colors">
               Add to Wishlist
             </button>
           </div>
        </div>

      </div>
    </div>
  </div>
</template>