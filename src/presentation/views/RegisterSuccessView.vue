<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

const email = route.query.email as string || 'your.email@story.com';

const goToVerify = () => {
  // 带着 showVerify 参数跳回登录页，触发验证码输入框
  router.push({ path: '/login', query: { email: email, showVerify: 'true' } });
};
</script>

<template>
  <div class="min-h-screen relative flex items-center justify-center p-4 overflow-hidden font-serif bg-[#0f1016]">
    
    <div class="absolute inset-0 z-0">
      <img 
        src="/violet-bg.jpg" 
        alt="Starry Night" 
        class="w-full h-full object-cover opacity-80"
      />
      <div class="absolute inset-0 bg-gradient-to-b from-[#0f1016]/60 via-[#0f1016]/20 to-[#0f1016]/90"></div>
    </div>

    <div class="absolute inset-0 z-0 pointer-events-none overflow-hidden">
      <div class="firefly"></div>
      <div class="firefly" style="animation-delay: 1s; left: 20%;"></div>
      <div class="firefly" style="animation-delay: 3s; left: 80%;"></div>
    </div>

    <div class="relative z-10 w-full max-w-md animate-fade-in-up">
      <div class="w-full backdrop-blur-xl bg-[#0f1016]/40 border border-white/10 shadow-[0_0_50px_-12px_rgba(139,92,246,0.3)] rounded-sm p-10 text-center">
        
        <div class="flex justify-center mb-8 relative">
           <div class="relative w-20 h-20 flex items-center justify-center">
             <div class="absolute inset-0 bg-purple-500/30 blur-[30px] rounded-full animate-pulse-slow"></div>
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1" stroke="currentColor" class="w-12 h-12 text-white/90 relative z-10 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
               <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
             </svg>
             <div class="absolute -top-4 -right-4 w-2 h-2 bg-white rounded-full shadow-[0_0_10px_white] animate-float"></div>
           </div>
        </div>

        <h2 class="text-3xl text-white font-light tracking-[0.1em] mb-4 text-shadow-glow">
          Signal Sent
        </h2>
        
        <div class="space-y-6">
          <p class="text-purple-200/70 text-xs tracking-widest leading-loose">
            "We have dispatched a star fragment (code) to the following coordinates:"
          </p>
          
          <div class="py-3 border-b border-white/10">
             <span class="text-lg text-white font-serif tracking-wide italic">{{ email }}</span>
          </div>

          <p class="text-purple-200/50 text-[10px] tracking-widest uppercase">
            Please retrieve it to complete the bond.
          </p>
        </div>

        <button 
          @click="goToVerify"
          class="mt-10 group relative w-full py-3 overflow-hidden border border-white/20 hover:border-white/40 transition-colors duration-500"
        >
          <div class="absolute inset-0 bg-white/5 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-500 ease-out"></div>
          <span class="relative z-10 text-xs text-white uppercase tracking-[0.3em] group-hover:text-purple-200 transition-colors">
            Enter Code
          </span>
        </button>

      </div>
    </div>

  </div>
</template>

<style scoped>
/* 萤火虫动画复用 */
.firefly {
  position: absolute;
  bottom: -10%;
  left: 50%;
  width: 3px;
  height: 3px;
  background: #a78bfa;
  border-radius: 50%;
  box-shadow: 0 0 10px 2px rgba(167, 139, 250, 0.4);
  animation: fly 8s ease-in-out infinite;
}
@keyframes fly {
  0% { transform: translateY(0) translateX(0); opacity: 0; }
  50% { opacity: 0.8; }
  100% { transform: translateY(-60vh) translateX(-20px); opacity: 0; }
}

.animate-fade-in-up {
  animation: fadeInUp 1s ease-out;
}
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-pulse-slow {
  animation: pulse 4s infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(1.1); }
}

.text-shadow-glow {
  text-shadow: 0 0 20px rgba(167, 139, 250, 0.6);
}
</style>