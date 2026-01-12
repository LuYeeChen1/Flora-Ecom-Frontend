<script setup lang="ts">
import { ref } from 'vue';
import { RouterLink } from 'vue-router';

const isMobileMenuOpen = ref(false)
</script>

<template>
  <nav class="sticky top-0 z-50 w-full border-b border-white/5 bg-slate-900/90 backdrop-blur-md">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="flex h-20 items-center justify-between">
        
        <div class="flex-shrink-0">
          <RouterLink to="/" class="flex items-center gap-3 group">
            <div class="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-emerald-600 p-[1px]">
              <div class="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-violet-200 font-serif italic text-sm border border-white/10">
                V
              </div>
            </div>
            <span class="text-2xl font-serif font-medium tracking-widest text-violet-100 group-hover:text-white transition-colors">
              FlowerShop
            </span>
          </RouterLink>
        </div>

        <div class="hidden md:block">
          <div class="ml-10 flex items-baseline space-x-10">
            <RouterLink to="/" class="text-slate-300 hover:text-violet-300 font-serif text-base tracking-wide transition-colors duration-300">
              首页
            </RouterLink>
            <RouterLink to="/catalog" class="text-slate-300 hover:text-violet-300 font-serif text-base tracking-wide transition-colors duration-300">
              鲜花图鉴
            </RouterLink>
            <a href="#" class="text-slate-300 hover:text-violet-300 font-serif text-base tracking-wide transition-colors duration-300">
              品牌故事
            </a>
          </div>
        </div>

        <div class="hidden md:block">
          <button class="bg-violet-700/20 border border-violet-500/50 hover:bg-violet-600 text-violet-100 px-6 py-2 rounded-sm font-serif text-sm tracking-widest shadow-[0_0_15px_rgba(139,92,246,0.2)] hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] transition-all">
            定制花束
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>