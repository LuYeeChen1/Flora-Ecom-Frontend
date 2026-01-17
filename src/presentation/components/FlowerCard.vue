<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
// ✅ [新增] 引入统一的 Flower 接口，确保与 CatalogView 类型一致
import type { Flower } from '../../domain/models/Flower';

// ✅ [修改] 使用引入的接口，而不是在组件内手写类型
const props = defineProps<{
  flower: Flower
}>();

const router = useRouter();

// 1. 编号格式化: 1 -> "001"
const formattedId = computed(() => {
  if (!props.flower.id) return '000';
  return String(props.flower.id).padStart(3, '0');
});

// 2. 跳转到详情页
const goToDetail = () => {
  router.push({ 
    name: 'flower-detail', 
    params: { id: props.flower.id } 
  });
};
</script>

<template>
  <div 
    class="group relative flex flex-col items-center cursor-pointer"
    @click="goToDetail"
  >
    <div class="relative w-full overflow-hidden bg-[#fdfbf7] p-4 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_60px_-15px_rgba(139,92,246,0.2)] border-4 border-double border-slate-200">
      
      <div class="absolute -right-2 -top-2 z-10 h-12 w-12 rounded-full bg-violet-800 text-white flex items-center justify-center font-serif text-xs font-bold shadow-md ring-2 ring-white transform rotate-12 group-hover:rotate-0 transition-transform">
        No.{{ formattedId }}
      </div>

      <div class="relative aspect-[3/4] w-full overflow-hidden bg-slate-200 grayscale-[0.3] transition-all duration-700 group-hover:grayscale-0">
        <img 
          :src="flower.imageUrl" 
          :alt="flower.name" 
          class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-[#fdfbf7] via-transparent to-transparent opacity-20"></div>
      </div>

      <div class="mt-6 text-center">
        <div class="mb-3 mx-auto h-[1px] w-12 bg-violet-300"></div>

        <h3 class="font-serif text-xl font-bold text-slate-800 group-hover:text-violet-700 transition-colors">
          {{ flower.name }}
        </h3>
        
        <p class="mt-3 text-xs leading-relaxed text-slate-500 font-serif italic line-clamp-3 px-2 h-[3em]">
          {{ flower.description }}
        </p>

        <div class="mt-6 flex items-center justify-center gap-4">
          <span class="font-serif text-lg text-emerald-700 font-semibold">
            RM {{ Number(flower.price).toFixed(2) }}
          </span>
          
          <button 
            @click.stop="goToDetail"
            class="rounded-sm border border-violet-800 px-4 py-1 text-xs font-bold uppercase tracking-widest text-violet-800 transition-colors hover:bg-violet-800 hover:text-white"
          >
            View Detail
          </button>
        </div>
      </div>
    </div>
  </div>
</template>