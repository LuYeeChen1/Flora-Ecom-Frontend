<script setup lang="ts">
// 纯展示组件
</script>

<template>
  <section 
    class="relative h-[700px] w-full bg-cover bg-center flex items-center justify-center overflow-hidden"
    style="background-image: url('/violet-bg.jpg');"
  >
    <div class="absolute inset-0 bg-slate-900/30 mix-blend-multiply"></div>
    <div class="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/50 to-transparent"></div>

    <div class="relative z-10 text-center px-4 max-w-5xl mx-auto mt-16">
      
      <div class="mb-6 inline-flex items-center justify-center gap-3 opacity-80">
        <div class="h-[1px] w-12 bg-violet-300"></div>
        <span class="font-serif italic text-violet-200 tracking-widest text-sm">Est. 2026 • Flower & Emotions</span>
        <div class="h-[1px] w-12 bg-violet-300"></div>
      </div>

      <h1 class="text-4xl md:text-6xl font-serif font-bold text-white tracking-wide drop-shadow-2xl mb-8 leading-tight">
        <span class="block text-xl md:text-2xl italic font-light text-violet-200 mb-4 opacity-90 font-sans tracking-[0.2em] uppercase">
          "Every flower tells a story"
        </span>
        以繁花为信，<br/>
        封缄您的<span class="text-violet-300 decoration-violet-400 underline decoration-1 underline-offset-8">万千心意</span>
      </h1>
      
      <p class="text-lg md:text-xl text-slate-100 mb-12 max-w-3xl mx-auto font-serif leading-relaxed tracking-wider border-l-2 border-violet-400/50 pl-6 text-left bg-slate-900/40 p-6 backdrop-blur-sm rounded-r-lg shadow-lg">
        <span class="text-violet-200 font-semibold">热烈的玫瑰、纯洁的百合、温柔的郁金香……</span><br/>
        我们需要不同的色彩，来描绘这世间千变万化的爱意。请告诉我们您的故事，让我们为您甄选那一束最契合的花。
      </p>

      <div class="flex flex-col sm:flex-row gap-6 justify-center items-center">
        <button class="group relative px-10 py-3 bg-violet-600/90 hover:bg-violet-500 text-white border border-violet-400/50 rounded-sm font-serif font-semibold tracking-widest transition-all duration-300 shadow-[0_0_20px_rgba(124,58,237,0.5)] hover:shadow-[0_0_30px_rgba(139,92,246,0.8)] hover:-translate-y-1">
          <span class="absolute inset-0 border border-white/20 translate-x-1 translate-y-1 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform"></span>
          定制专属花礼
        </button>
        
        <button class="px-10 py-3 bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/30 rounded-sm font-serif font-medium tracking-widest transition-all hover:tracking-[0.2em] hover:bg-white/30">
          浏览全品类图鉴
        </button>
      </div>
    </div>
  </section>
</template>