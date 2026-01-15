<script setup lang="ts">
import { onMounted } from 'vue';
import FlowerCard from '../components/FlowerCard.vue';
import HeroSection from '../components/HeroSection.vue';
import { useFlowerStore } from '../store/flowerStore';

// 1. 初始化 Store
const flowerStore = useFlowerStore();
// ❌ 删除: const flowerRepo = new HttpFlowerRepository(); (Store 内部已经处理了，View 不需要管)

/**
 * 核心逻辑：组件挂载后异步获取公开鲜花列表
 * 访问路径：http://localhost:8080/api/public/flowers
 */
onMounted(async () => {
  try {
    // ✅ 修复 1: 不再传递参数，直接调用
    await flowerStore.fetchFlowers();
  } catch (error) {
    console.error("加载季节性典藏花朵失败:", error);
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
        <p class="mt-4 text-slate-400 font-serif text-sm">正在书写信件...</p>
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