<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
// 删除这一行！不要直接引入 aws-amplify
// import { confirmSignUp, signIn, signUp } from 'aws-amplify/auth'

// ✅ 引入我们刚才写好的 Store
import { useAuthStore } from '../store/authStore'

const router = useRouter()
const authStore = useAuthStore() // 初始化 Store

// 状态控制
const isLogin = ref(true)
const showPassword = ref(false)
const showVerification = ref(false)

// 表单数据
const formData = ref({
  email: '',
  password: '',
  code: ''
})

const errorMessage = ref('')

// 处理主逻辑
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
    // 优先显示 Store 里的错误信息
    errorMessage.value = authStore.error || error.message || 'An error occurred'
  }
}

// === 1. 处理注册 (走 Store) ===
const handleSignUp = async () => {
  // ✅ 使用 authStore.register
  const { nextStep } = await authStore.register(
    formData.value.email,
    formData.value.password
  )

  console.log('Sign Up Result:', nextStep)

  if (nextStep === 'CONFIRM_SIGN_UP') {
    showVerification.value = true
    alert('验证码已发送到您的邮箱，请输入以完成注册。')
  }
}

// === 2. 处理验证码确认 (走 Store) ===
const handleConfirmSignUp = async () => {
  // ✅ 使用 authStore.verifyCode
  const isComplete = await authStore.verifyCode(
    formData.value.email,
    formData.value.code
  )

  if (isComplete) {
    alert('注册成功！请登录。')
    showVerification.value = false
    isLogin.value = true
    formData.value.code = ''
  }
}

// === 3. 处理登录 (走 Store) ===
const handleSignIn = async () => {
  // ✅ 使用 authStore.login
  // 这会触发 Repository -> 自动修复 "UserAlreadyAuthenticated" -> 成功登录
  const result = await authStore.login(
    formData.value.email,
    formData.value.password
  )

  if (result.user) {
    console.log('Login Success')
    router.push('/') 
  } else {
    console.log('Login next step:', result.nextStep)
  }
}

const toggleTab = (loginState) => {
  isLogin.value = loginState
  showVerification.value = false
  errorMessage.value = ''
}
</script>

<template>
  <div class="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
    <div class="text-center mb-8">
      <h1 class="text-4xl font-bold text-white tracking-wide">Welcome</h1>
      <div class="h-1 w-16 bg-purple-600 mx-auto mt-3 rounded-full"></div>
    </div>

    <div class="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden">
      <div v-if="authStore.isLoading" class="absolute inset-0 bg-white/50 z-50 flex items-center justify-center">
        <span class="text-purple-600 font-bold">Processing...</span>
      </div>

      <div class="flex border-b border-gray-100">
        <button 
          @click="toggleTab(true)"
          :class="['flex-1 py-4 font-medium transition-colors', isLogin ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50' : 'text-gray-400 hover:text-gray-600']"
        >
          Sign In
        </button>
        <button 
          @click="toggleTab(false)"
          :class="['flex-1 py-4 font-medium transition-colors', !isLogin ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50' : 'text-gray-400 hover:text-gray-600']"
        >
          Create Account
        </button>
      </div>

      <div class="p-8">
        <div v-if="errorMessage" class="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
          {{ errorMessage }}
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-6">
          <div v-if="showVerification" class="space-y-2">
             <div class="bg-blue-50 text-blue-800 p-3 rounded text-sm mb-4">
               Check your email <strong>{{ formData.email }}</strong> for a verification code.
             </div>
             <label class="text-sm font-medium text-gray-700">Verification Code</label>
             <input 
               v-model="formData.code"
               type="text" 
               placeholder="123456"
               class="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all placeholder:text-gray-400 text-center tracking-widest text-xl"
             />
          </div>

          <div v-else class="space-y-6">
            <div class="space-y-2">
              <label class="text-sm font-medium text-gray-700">Email</label>
              <input 
                v-model="formData.email"
                type="email" 
                placeholder="name@company.com"
                required
                class="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all placeholder:text-gray-400"
              />
            </div>

            <div class="space-y-2">
              <label class="text-sm font-medium text-gray-700">Password</label>
              <div class="relative">
                <input 
                  v-model="formData.password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="••••••••"
                  required
                  class="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all placeholder:text-gray-400"
                />
                <button 
                  type="button"
                  @click="showPassword = !showPassword"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-600"
                >
                  <span class="text-sm">{{ showPassword ? 'Hide' : 'Show' }}</span>
                </button>
              </div>
            </div>
          </div>

          <button 
            type="submit"
            :disabled="authStore.isLoading"
            class="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white font-bold rounded-lg shadow-lg shadow-purple-500/30 transition-all transform hover:-translate-y-0.5"
          >
            <span v-if="authStore.isLoading">Processing...</span>
            <span v-else-if="showVerification">Verify Account</span>
            <span v-else>{{ isLogin ? 'Sign In' : 'Sign Up' }}</span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>