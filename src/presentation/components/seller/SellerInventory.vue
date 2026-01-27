<script setup lang="ts">
// 定义 Props：接收父组件传来的鲜花数据
defineProps<{
  flowers: any[]
}>();

// 定义 Emits：向父组件发送操作请求
const emit = defineEmits<{
  (e: 'edit', flower: any): void;
  (e: 'delete', id: number): void;
  (e: 'add'): void;
}>();
</script>

<template>
  <div>
    <div v-if="flowers.length === 0" class="text-center py-16 bg-white rounded-xl border-2 border-dashed border-slate-200">
      <div class="text-4xl mb-4 opacity-50">🥀</div>
      <p class="text-slate-500">Your garden is empty.</p>
      <button @click="emit('add')" class="mt-4 text-purple-600 font-medium hover:underline">Plant your first flower</button>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="flower in flowers" :key="flower.id" class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl transition-all group relative duration-300">
        
        <div class="h-56 overflow-hidden bg-slate-100 relative">
          <img :src="flower.imageUrl" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" />
          
          <div class="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[2px]">
            <button @click="emit('edit', flower)" class="bg-white text-slate-900 px-4 py-2 rounded-full font-bold text-xs uppercase tracking-wide hover:bg-purple-50 transition-colors shadow-lg">Edit</button>
            <button @click="emit('delete', flower.id)" class="bg-rose-500 text-white px-4 py-2 rounded-full font-bold text-xs uppercase tracking-wide hover:bg-rose-600 transition-colors shadow-lg">Delete</button>
          </div>
        </div>

        <div class="p-5">
          <div class="flex justify-between items-start mb-2">
            <h4 class="font-bold text-slate-800 text-lg truncate pr-2 font-serif">{{ flower.name }}</h4>
            <span class="shrink-0 bg-purple-50 text-purple-700 text-[10px] uppercase font-bold px-2 py-1 rounded border border-purple-100">
              {{ flower.category }}
            </span>
          </div>
          <p class="text-slate-500 text-sm mb-4 line-clamp-2 min-h-[40px] leading-relaxed">{{ flower.description }}</p>
          <div class="flex justify-between items-center border-t border-slate-50 pt-4 mt-2">
            <div class="flex flex-col">
              <span class="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Price</span>
              <span class="text-emerald-600 font-bold font-sans text-lg">RM {{ flower.price }}</span>
            </div>
            <div class="flex flex-col items-end">
              <span class="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Stock</span>
              <span class="text-slate-700 font-medium font-sans text-lg">{{ flower.stock }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>