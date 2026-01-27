<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../store/authStore'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// 状态控制
const isLogin = ref(true)
const showPassword = ref(false)
const showVerification = ref(false)
const showSuccessModal = ref(false)

// 表单数据
const formData = ref({
  email: '',
  password: '',
  code: ''
})

const errorMessage = ref('')

// === 初始化检查 ===
onMounted(() => {
  if (route.query.showVerify === 'true') {
    isLogin.value = false
    showVerification.value = true
    if (route.query.email) {
      formData.value.email = route.query.email
    }
  }
})

const handleSubmit = async () => {
  errorMessage.value = ''
  try {
    if (showVerification.value) {
      await handleConfirmSignUp()
      return
    }
    if (isLogin.value) {
      await handleSignIn()
    } else {
      await handleSignUp()
    }
  } catch (error) {
    console.error('Auth Error:', error)
    errorMessage.value = authStore.error || error.message || 'An error occurred'
  }
}

const handleSignUp = async () => {
  const { nextStep } = await authStore.register(
    formData.value.email,
    formData.value.password
  )
  if (nextStep === 'CONFIRM_SIGN_UP') {
    router.push({ 
      path: '/register-success', 
      query: { email: formData.value.email } 
    })
  }
}

const handleConfirmSignUp = async () => {
  const isComplete = await authStore.verifyCode(
    formData.value.email,
    formData.value.code
  )
  if (isComplete) {
    showSuccessModal.value = true
  }
}

const closeSuccessModal = () => {
  showSuccessModal.value = false
  showVerification.value = false
  isLogin.value = true
  formData.value.code = ''
  router.replace('/login')
}

const handleSignIn = async () => {
  const result = await authStore.login(
    formData.value.email,
    formData.value.password
  )
  if (result.user) {
    router.push('/') 
  }
}

const toggleTab = (loginState) => {
  isLogin.value = loginState
  showVerification.value = false
  errorMessage.value = ''
}
</script>

<template>
  <div class="min-h-screen relative flex items-center justify-center p-4 overflow-hidden font-serif selection:bg-purple-500/30 selection:text-purple-200">
    
    <div class="absolute inset-0 z-0">
      <img 
        src="https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?q=80&w=2013&auto=format&fit=crop" 
        alt="Starry Night" 
        class="w-full h-full object-cover opacity-90"
      />
      <div class="absolute inset-0 bg-gradient-to-b from-[#0f1016]/40 via-transparent to-[#0f1016]/80"></div>
    </div>

    <div class="absolute inset-0 z-0 pointer-events-none overflow-hidden">
      <div class="firefly"></div>
      <div class="firefly"></div>
      <div class="firefly"></div>
      <div class="firefly"></div>
      <div class="firefly"></div>
      <div class="firefly"></div>
      <div class="firefly"></div>
      <div class="firefly"></div>
    </div>

    <div class="relative z-10 w-full max-w-[400px] flex flex-col items-center">
      
      <div class="text-center mb-8 animate-fade-in-down">
        <h1 class="text-4xl text-white font-light tracking-[0.2em] drop-shadow-[0_2px_10px_rgba(255,255,255,0.2)]">
          FlowerShop
        </h1>
        <p class="text-purple-200/70 text-[10px] uppercase tracking-[0.4em] mt-3">
          Stories in Bloom
        </p>
      </div>

      <div class="w-full backdrop-blur-xl bg-[#0f1016]/30 border border-white/10 shadow-2xl rounded-sm overflow-hidden transition-all duration-500 hover:bg-[#0f1016]/40 hover:border-white/20 hover:shadow-[0_0_40px_-10px_rgba(139,92,246,0.3)]">
        
        <div v-if="authStore.isLoading" class="absolute inset-0 bg-[#0f1016]/60 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
          <div class="w-1 h-1 bg-white rounded-full animate-ping mb-4"></div>
          <span class="text-xs text-white/80 tracking-widest animate-pulse">CONNECTING</span>
        </div>

        <div class="flex border-b border-white/5">
          <button 
            @click="toggleTab(true)"
            :class="['flex-1 py-5 text-[11px] tracking-[0.2em] uppercase transition-all duration-300', isLogin ? 'text-white bg-white/5 border-b-2 border-purple-400/50' : 'text-white/40 hover:text-white/70']"
          >
            Sign In
          </button>
          <button 
            @click="toggleTab(false)"
            :class="['flex-1 py-5 text-[11px] tracking-[0.2em] uppercase transition-all duration-300', !isLogin ? 'text-white bg-white/5 border-b-2 border-purple-400/50' : 'text-white/40 hover:text-white/70']"
          >
            Register
          </button>
        </div>

        <div class="p-8 pt-10">
          <div v-if="errorMessage" class="mb-6 text-center">
            <p class="text-[10px] text-red-300 bg-red-500/10 py-2 border border-red-500/20 px-2 tracking-wide">
              {{ errorMessage }}
            </p>
          </div>

          <form @submit.prevent="handleSubmit" class="space-y-8">
            
            <div v-if="showVerification" class="space-y-6 text-center animate-fade-in">
               <p class="text-purple-100/60 text-xs italic leading-relaxed">
                 "A fragment of starlight has been sent to<br>
                 <span class="text-white not-italic border-b border-white/20">{{ formData.email }}</span>"
               </p>
               <input 
                 v-model="formData.code"
                 type="text" 
                 placeholder="• • • • • •"
                 class="w-full bg-transparent border-b border-white/20 py-2 text-center text-2xl text-white tracking-[0.5em] focus:border-purple-400/50 outline-none transition-colors placeholder-white/10"
               />
            </div>

            <div v-else class="space-y-6 animate-fade-in">
              <div class="group relative">
                <input 
                  v-model="formData.email"
                  type="email" 
                  required
                  class="peer w-full bg-transparent border-b border-white/20 py-2 text-white/90 placeholder-transparent focus:border-purple-400/50 outline-none transition-all text-sm tracking-wide"
                  placeholder="Email"
                />
                <label class="absolute left-0 -top-3.5 text-[10px] text-white/40 uppercase tracking-widest transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:text-white/40 peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-[10px] peer-focus:text-purple-300">
                  Email Address
                </label>
              </div>

              <div class="group relative">
                <input 
                  v-model="formData.password"
                  :type="showPassword ? 'text' : 'password'"
                  required
                  class="peer w-full bg-transparent border-b border-white/20 py-2 text-white/90 placeholder-transparent focus:border-purple-400/50 outline-none transition-all text-sm tracking-wide"
                  placeholder="Password"
                />
                <label class="absolute left-0 -top-3.5 text-[10px] text-white/40 uppercase tracking-widest transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:text-white/40 peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-[10px] peer-focus:text-purple-300">
                  Password
                </label>
                <button 
                  type="button" 
                  @click="showPassword = !showPassword"
                  class="absolute right-0 top-2 text-[10px] text-white/30 hover:text-white uppercase tracking-wider transition-colors"
                >
                  {{ showPassword ? 'Hide' : 'Show' }}
                </button>
              </div>
            </div>

            <button 
              type="submit"
              :disabled="authStore.isLoading"
              class="group relative w-full py-3 overflow-hidden border border-white/20 hover:border-white/40 transition-colors duration-500"
            >
              <div class="absolute inset-0 bg-white/5 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-500 ease-out"></div>
              <span class="relative z-10 text-xs text-white uppercase tracking-[0.3em] group-hover:tracking-[0.4em] transition-all duration-500">
                <span v-if="authStore.isLoading">Loading...</span>
                <span v-else-if="showVerification">Connect</span>
                <span v-else>{{ isLogin ? 'Enter' : 'Join' }}</span>
              </span>
            </button>
          </form>
        </div>
      </div>
    </div>

    <Transition name="fade">
      <div v-if="showSuccessModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-[#0f1016]/90 backdrop-blur-md transition-opacity" @click="closeSuccessModal"></div>
        
        <div class="relative z-10 text-center animate-float">
          <div class="flex justify-center mb-6">
             <div class="relative">
               <div class="absolute inset-0 bg-purple-500 blur-[20px] opacity-40 animate-pulse"></div>
               <div class="w-2 h-2 bg-white rounded-full shadow-[0_0_30px_5px_white] animate-star-bloom"></div>
               <div class="absolute -inset-8 border border-white/10 rounded-full animate-spin-slow"></div>
               <div class="absolute -inset-12 border border-white/5 rounded-full animate-reverse-spin"></div>
             </div>
          </div>

          <h3 class="text-3xl text-white font-light tracking-[0.2em] mb-4 text-shadow-glow">
            Bond Established
          </h3>
          <p class="text-purple-200/60 text-xs tracking-widest leading-loose mb-10">
            "The stars have aligned.<br>Your story begins here."
          </p>

          <button 
            @click="closeSuccessModal"
            class="text-[10px] text-white/50 hover:text-white uppercase tracking-[0.3em] border-b border-transparent hover:border-white/50 pb-1 transition-all"
          >
            Proceed
          </button>
        </div>
      </div>
    </Transition>

  </div>
</template>

<style scoped>
/* === 1. 萤火虫动画 (Fireflies) === */
.firefly {
  position: absolute;
  bottom: -10%;
  left: 50%;
  width: 3px;
  height: 3px;
  background: #a78bfa; /* Light Purple */
  border-radius: 50%;
  box-shadow: 0 0 10px 2px rgba(167, 139, 250, 0.4);
  opacity: 0;
  animation: fly 8s ease-in-out infinite;
}

/* 生成不同位置和速度的萤火虫 */
.firefly:nth-child(1) { left: 20%; animation-duration: 7s; animation-delay: 0s; }
.firefly:nth-child(2) { left: 40%; animation-duration: 9s; animation-delay: 1s; background: #fbbf24; /* Golden */ }
.firefly:nth-child(3) { left: 60%; animation-duration: 6s; animation-delay: 2s; }
.firefly:nth-child(4) { left: 80%; animation-duration: 11s; animation-delay: 0.5s; background: #fbbf24; }
.firefly:nth-child(5) { left: 10%; animation-duration: 8s; animation-delay: 3s; }
.firefly:nth-child(6) { left: 90%; animation-duration: 10s; animation-delay: 1.5s; }

@keyframes fly {
  0% { transform: translateY(0) translateX(0); opacity: 0; }
  10% { opacity: 0.8; }
  50% { transform: translateY(-30vh) translateX(20px); opacity: 0.5; }
  100% { transform: translateY(-60vh) translateX(-20px); opacity: 0; }
}

/* === 2. 基础动画 === */
@keyframes fade-in-down {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in-down { animation: fade-in-down 1s ease-out; }

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
.animate-fade-in { animation: fade-in 0.5s ease-out; }

@keyframes starBloom {
  0% { transform: scale(0); opacity: 0; }
  50% { transform: scale(2); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}
.animate-star-bloom { animation: starBloom 1.5s cubic-bezier(0.22, 1, 0.36, 1) forwards; }

@keyframes spin-slow {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.animate-spin-slow { animation: spin-slow 12s linear infinite; }
.animate-reverse-spin { animation: spin-slow 18s linear infinite reverse; }

/* 文字光晕 */
.text-shadow-glow {
  text-shadow: 0 0 20px rgba(167, 139, 250, 0.5);
}

/* Fade Transition */
.fade-enter-active, .fade-leave-active { transition: opacity 0.8s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>