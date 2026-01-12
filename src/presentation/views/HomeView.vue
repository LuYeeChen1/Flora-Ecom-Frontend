<script setup lang="ts">
import { onMounted } from 'vue';
import FlowerCard from '../components/FlowerCard.vue';
import HeroSection from '../components/HeroSection.vue';
import { useFlowerStore } from '../store/flowerStore';

const flowerStore = useFlowerStore();

// 页面加载时，获取数据
onMounted(() => {
  flowerStore.fetchFlowers();
});
</script>

<template>
  <div class="min-h-screen bg-[#f2f0ea]"> <HeroSection />

    <div class="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div class="text-center mb-16">
        <h2 class="text-3xl font-serif font-bold text-slate-800">
          Seasonal Collections
        </h2>
        <p class="mt-2 text-violet-500 font-serif italic">
          — Record of Observations —
        </p>
      </div>

      <div v-if="flowerStore.loading" class="text-center py-20">
        <div class="inline-block animate-spin text-violet-600">
          ✑ </div>
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