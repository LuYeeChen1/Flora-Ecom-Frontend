<script setup lang="ts">
import { ref } from 'vue'

// 直接引用 public 文件夹下的图片
const heroImage = '/violet-bg.jpg'

const isPlaying = ref(false)

const handleStart = () => {
  // 简单的交互反馈
  isPlaying.value = !isPlaying.value
  console.log('Journey started.')
}
</script>

<template>
  <div class="relative h-screen w-full overflow-hidden font-serif">
    
    <div 
      class="absolute inset-0 bg-cover bg-center z-0 transition-transform duration-[20s] ease-out"
      :style="{ backgroundImage: `url(${heroImage})` }"
    ></div>

    <div class="absolute inset-0 bg-slate-900/30 mix-blend-multiply z-10"></div>
    <div class="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent z-20"></div>

    <div class="relative z-30 h-full flex flex-col justify-center items-center text-center text-white px-4 max-w-5xl mx-auto mt-16">
      
      <div class="mb-6 inline-flex items-center justify-center gap-3 opacity-80 animate-fade-in-up">
        <div class="h-[1px] w-12 bg-violet-300 shadow-[0_0_8px_rgba(167,139,250,0.8)]"></div>
        <span class="italic text-violet-200 tracking-[0.2em] text-xs uppercase drop-shadow-md">
          Est. 2026 • Flower & Emotions
        </span>
        <div class="h-[1px] w-12 bg-violet-300 shadow-[0_0_8px_rgba(167,139,250,0.8)]"></div>
      </div>

      <h1 class="text-4xl md:text-6xl font-bold text-white tracking-wide drop-shadow-2xl mb-8 leading-tight animate-fade-in-up delay-100">
        <span class="block text-xl md:text-2xl italic font-light text-violet-200 mb-4 opacity-90 font-sans tracking-[0.2em] uppercase">
          "Every flower tells a story"
        </span>
        以繁花为信，<br/>
        封缄您的<span class="text-violet-300 decoration-violet-400 underline decoration-1 underline-offset-8 decoration-wavy">万千心意</span>
      </h1>
      
      <p class="text-lg md:text-xl text-slate-100 mb-12 max-w-3xl mx-auto leading-relaxed tracking-wider border-l-2 border-violet-400/50 pl-6 text-left bg-slate-900/40 p-6 backdrop-blur-sm rounded-r-lg shadow-lg animate-fade-in-up delay-200 hover:bg-slate-900/50 transition-colors duration-500">
        <span class="text-violet-200 font-semibold">热烈的玫瑰、纯洁的百合、温柔的郁金香……</span><br/>
        我们需要不同的色彩，来描绘这世间千变万化的爱意。<br>
        <span class="text-sm text-slate-300 mt-2 block">Tell us your story, and we will choose the perfect bouquet.</span>
      </p>

      <div class="flex flex-col sm:flex-row gap-6 justify-center items-center animate-fade-in-up delay-300">
        <button 
          @click="handleStart"
          class="group relative px-10 py-3 bg-violet-600/90 hover:bg-violet-500 text-white rounded-sm font-semibold tracking-widest transition-all duration-300 shadow-[0_0_20px_rgba(124,58,237,0.5)] hover:shadow-[0_0_30px_rgba(139,92,246,0.8)] hover:-translate-y-1 overflow-hidden"
        >
          <div class="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"></div>
          <span class="relative z-10 flex items-center gap-2">
            定制专属花礼
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" 
                 class="w-4 h-4 transition-transform duration-500" 
                 :class="{'rotate-90': isPlaying}">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </span>
        </button>
        
        <button class="px-10 py-3 bg-white/5 hover:bg-white/10 text-white backdrop-blur-md border border-white/20 rounded-sm font-medium tracking-widest transition-all hover:tracking-[0.2em] hover:border-white/40">
          浏览全品类图鉴
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 仅保留文字进入的动画 (Fade In Up)，
  背景完全静止。
*/

.animate-fade-in-up {
  animation: fadeInUp 1s cubic-bezier(0.2, 0.8, 0.2, 1) backwards;
}

.delay-100 { animation-delay: 0.1s; }
.delay-200 { animation-delay: 0.3s; }
.delay-300 { animation-delay: 0.5s; }

@keyframes fadeInUp {
  from { 
    opacity: 0; 
    transform: translateY(30px); 
    filter: blur(4px); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0); 
    filter: blur(0); 
  }
}
</style>