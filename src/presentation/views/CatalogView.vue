<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
// ✅ [修复] 修正路径：model (单数) 且路径层级正确
import type { Flower } from '../../domain/models/Flower';
import apiClient from '../../infrastructure/api/apiClient';
// ✅ [修复] 修正路径：直接指向 components 目录
import FlowerCard from '../components/FlowerCard.vue';

const flowers = ref<Flower[]>([]);
const isLoading = ref(false);
const currentPage = ref(1);
const totalPages = ref(1);
const pageSize = 6; 

const selectedCategory = ref('ALL');
const searchQuery = ref('');

const categories = [
  { label: 'All Flowers', value: 'ALL' },
  { label: 'Romance', value: 'ROMANCE' },
  { label: 'Wedding', value: 'WEDDING' },
  { label: 'Birthday', value: 'BIRTHDAY' },
  { label: 'Sympathy', value: 'SYMPATHY' }
];

const fetchFlowers = async () => {
  isLoading.value = true;
  try {
    const offset = (currentPage.value - 1) * pageSize;
    const response = await apiClient.get('/public/flowers', {
      params: {
        category: selectedCategory.value,
        search: searchQuery.value,
        limit: pageSize,
        offset: offset
      }
    });
    // ✅ 适配后端新接口返回结构 { list: [], total: 0 }
    flowers.value = response.data.list || [];
    totalPages.value = Math.ceil((response.data.total || 0) / pageSize);
  } catch (error) {
    console.error("Failed to load catalog", error);
    flowers.value = []; 
  } finally {
    isLoading.value = false;
  }
};

watch([selectedCategory, searchQuery], () => {
  currentPage.value = 1;
  fetchFlowers();
});

onMounted(fetchFlowers);

const handlePageChange = (dir: 'prev' | 'next') => {
  if (dir === 'prev' && currentPage.value > 1) currentPage.value--;
  if (dir === 'next' && currentPage.value < totalPages.value) currentPage.value++;
  fetchFlowers();
  window.scrollTo({ top: 0, behavior: 'smooth' });
};
</script>

<template>
  <div class="min-h-screen bg-[#F9F7F2] font-serif pb-20">
    <header class="bg-white border-b border-slate-100 py-12 px-6 text-center">
      <h1 class="text-4xl font-bold text-slate-900 mb-4 tracking-tight">Flower Catalog</h1>
      <p class="text-slate-500 italic">"Explore our curated collection from gardens across the country."</p>
    </header>

    <main class="max-w-7xl mx-auto px-6 mt-10">
      <div class="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
        <div class="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto">
          <button 
            v-for="cat in categories" 
            :key="cat.value"
            @click="selectedCategory = cat.value"
            :class="selectedCategory === cat.value ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'"
            class="px-6 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap"
          >
            {{ cat.label }}
          </button>
        </div>

        <div class="relative w-full md:w-80">
          <input 
            v-model="searchQuery"
            type="text" 
            placeholder="Search by flower name..."
            class="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none transition-all shadow-sm"
          />
          <span class="absolute left-4 top-3.5 opacity-30">🔍</span>
        </div>
      </div>

      <div v-if="isLoading" class="flex justify-center py-32">
        <div class="animate-spin text-4xl text-purple-600">❄️</div>
      </div>

      <div v-else-if="flowers.length === 0" class="text-center py-32 bg-white rounded-3xl border-2 border-dashed border-slate-200">
        <p class="text-slate-400 text-lg">No flowers found matching your search.</p>
      </div>

      <div v-else>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          <FlowerCard 
            v-for="flower in flowers" 
            :key="flower.id" 
            :flower="flower" 
          />
        </div>

        <div class="mt-16 flex justify-center items-center gap-8">
          <button 
            @click="handlePageChange('prev')"
            :disabled="currentPage === 1"
            class="p-4 rounded-full bg-white border border-slate-200 shadow-sm hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <span class="text-xl font-bold">←</span>
          </button>

          <div class="flex items-center gap-2">
            <span class="text-slate-400 font-bold uppercase tracking-widest text-xs">Page</span>
            <span class="text-lg font-bold text-slate-900">{{ currentPage }} / {{ totalPages }}</span>
          </div>

          <button 
            @click="handlePageChange('next')"
            :disabled="currentPage === totalPages"
            class="p-4 rounded-full bg-white border border-slate-200 shadow-sm hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <span class="text-xl font-bold">→</span>
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.grid {
  min-height: 400px;
  align-content: start;
}
</style>