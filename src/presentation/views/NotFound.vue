<script setup>
import { useRouter } from 'vue-router';

const router = useRouter()
const goHome = () => router.push('/')
</script>

<template>
  <div class="relative min-h-screen bg-slate-900 flex flex-col items-center justify-center overflow-hidden text-center px-4">
    
    <div class="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
      <span class="text-[20rem] font-black text-white/5 leading-none">404</span>
    </div>

    <div class="relative z-10 space-y-6 max-w-lg">
      <h2 class="text-4xl md:text-5xl font-bold text-white tracking-tight">
        Page Not Found
      </h2>
      
      <p class="text-lg text-gray-400 font-serif italic leading-relaxed">
        "The flower you are looking for has not bloomed yet,<br>
        or perhaps it has withered away."
      </p>

      <div class="pt-6">
        <button 
          @click="goHome"
          class="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-full transition-all shadow-lg shadow-purple-900/50 hover:shadow-purple-600/50"
        >
          Return Home
        </button>
      </div>
    </div>
  </div>
</template>