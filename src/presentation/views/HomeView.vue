<script setup lang="ts">
/**
 * ==========================================================
 * [Clean Architecture - Presentation Layer]
 * 職責：首頁視圖，展示季節性花卉典藏。
 * ==========================================================
 */
import { onMounted } from 'vue';
import FlowerCard from '../components/FlowerCard.vue';
import HeroSection from '../components/HeroSection.vue';
import { useFlowerStore } from '../store/flowerStore';

// 1. 初始化 Store
const flowerStore = useFlowerStore();

/**
 * 核心邏輯：組件掛載後異步獲取公開鮮花列表
 * 這裡會自動讀取生產環境網址 (VITE_CORE_API)
 */
onMounted(async () => {
  try {
    // ✅ 調用封裝好的 Store 邏輯
    await flowerStore.fetchFlowers();
  } catch (error) {
    console.error("加載季節性典藏花朵失敗，請確認網絡連線:", error);
  }
});
</script>

<template>
  <div class="min-h-screen bg-[#f2f0ea]"> 
    <HeroSection />

    <div class="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div class="text-center mb-16">
        <h2 class="text-3xl font-serif font-bold text-slate-800">Seasonal Collections</h2>
        <p class="mt-2 text-violet-500 font-serif italic">— Record of Observations —</p>
      </div>

      <div v-if="flowerStore.isLoading" class="text-center py-20">
        <div class="inline-block animate-spin text-violet-600 text-3xl">✑</div>
        <p class="mt-4 text-slate-400 font-serif text-sm">正在書寫信件...</p>
      </div>

      <div v-else class="grid grid-cols-1 gap-y-12 sm:grid-cols-2 sm:gap-x-8 lg:grid-cols-3 xl:gap-x-12">
        <FlowerCard 
          v-for="flower in flowerStore.flowers" 
          :key="flower.id" 
          :flower="flower" 
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 此視圖主要依賴全局樣式與 Tailwind，不需額外定義 scoped CSS */
</style>