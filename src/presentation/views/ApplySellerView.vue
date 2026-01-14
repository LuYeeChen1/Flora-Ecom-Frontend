<script setup lang="ts">
/**
 * ==========================================================
 * [Clean Architecture - Presentation Layer]
 * 职责：负责 UI 渲染、用户交互及即时准入逻辑。
 * ==========================================================
 */
import axios from 'axios';
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useAuthStore } from '../store/authStore';
import { useSellerStore } from '../store/sellerStore';

const sellerStore = useSellerStore();
const authStore = useAuthStore();

// --- UI 状态 ---
const sellerType = ref<'INDIVIDUAL' | 'BUSINESS'>('INDIVIDUAL'); 
const isIdVerified = ref(false);       
const isValidating = ref(false);       
const showSuccessOverlay = ref(false); 
const applicationStatus = ref('NONE'); 

const countries = [
  { code: '+60', flag: '🇲🇾' }, { code: '+65', flag: '🇸🇬' }, 
  { code: '+81', flag: '🇯🇵' }, { code: '+86', flag: '🇨🇳' }
];

// --- 生命周期 ---
onMounted(async () => {
  try {
    const res = await axios.get('http://localhost:8080/api/seller/status', {
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    });
    applicationStatus.value = res.data === 'ACTIVE' ? 'APPROVED' : res.data;
  } catch (err) {
    console.error("无法同步状态", err);
  }
});

// --- 资料回显 ---
const displayName = computed(() => authStore.user?.username || authStore.user?.email?.split('@')[0] || 'User');
const userAvatar = computed(() => authStore.user?.avatarUrl); 
const userInitials = computed(() => displayName.value.charAt(0).toUpperCase());
const userRole = computed(() => authStore.user?.role || 'GUEST');

// --- 表单模型 ---
const form = reactive({
  realName: '',          
  idCardNumber: '',      
  countryCode: '+60',    
  phoneBody: '',         
  tinNumber: '',         
  msicCode: '47733',     
  sstNumber: '',         
  address: ''            
});

// --- 格式化 ---
const formattedID = computed({
  get: () => {
    const v = form.idCardNumber.replace(/\D/g, ''); 
    if (v.length <= 6) return v;
    if (v.length <= 8) return `${v.slice(0, 6)}-${v.slice(6)}`;
    return `${v.slice(0, 6)}-${v.slice(6, 8)}-${v.slice(8, 12)}`;
  },
  set: (v) => { form.idCardNumber = v.replace(/\D/g, ''); }
});

watch(sellerType, (newType) => {
  if (newType === 'INDIVIDUAL') {
    form.tinNumber = '';
    form.sstNumber = '';
    form.msicCode = '47733';
  }
});

// --- 业务逻辑 ---
const handleValidate = () => {
  if (form.idCardNumber.length < 5) {
    alert("请输入有效的证件号码或注册号。");
    return;
  }
  isValidating.value = true;
  setTimeout(() => {
    isValidating.value = false;
    isIdVerified.value = true;
  }, 1200);
};

const handleSubmit = async () => {
  if (!isIdVerified.value) return;

  const payload: any = {
    applyType: sellerType.value,
    phoneNumber: `${form.countryCode}${form.phoneBody}`,
    address: form.address,
  };

  if (sellerType.value === 'INDIVIDUAL') {
    payload.realName = form.realName;
    payload.nricNumber = form.idCardNumber;
  } else {
    payload.companyName = form.realName; 
    payload.brnNumber = form.idCardNumber; 
    payload.tinNumber = form.tinNumber;
    payload.msicCode = form.msicCode;
    payload.sstNumber = form.sstNumber;
  }

  try {
    await sellerStore.submitApplication(payload);
    
    if (sellerStore.successMessage || !sellerStore.error) {
      
      // 🔥🔥🔥 关键修复点 🔥🔥🔥
      // 我们不调用普通的 checkAuth()，因为那会用缓存的旧 Token (Customer)。
      // 我们调用 refreshUserSession()，强制 AWS 签发新 Token (Seller)。
      try {
        await authStore.refreshUserSession();
        console.log("✅ 权限升级成功，当前角色:", authStore.user?.role);
      } catch (e) {
        console.warn("自动刷新失败，请重新登录", e);
      }

      showSuccessOverlay.value = true; 
      applicationStatus.value = 'APPROVED'; 
    }
  } catch (err) {
    console.error("提交失败", err);
  }
};
</script>

<template>
  <div class="min-h-screen bg-[url('https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=2094&auto=format&fit=crop')] bg-cover bg-center bg-fixed flex items-center justify-center p-4">
    <div class="absolute inset-0 bg-slate-900/70 z-0"></div>

    <div v-if="applicationStatus === 'APPROVED'" 
         class="relative z-10 w-full max-w-4xl bg-slate-900/40 backdrop-blur-xl p-12 text-center rounded-xl border border-white/10 shadow-2xl">
       <div class="mb-8">
         <div class="wax-seal scale-125 mb-6"><span class="seal-v">V</span></div>
         <h2 class="text-3xl text-white tracking-widest font-serif italic">欢迎，花艺师</h2>
         <p class="mt-6 text-slate-300 italic font-serif leading-relaxed px-10">
           “契约已成，您的花园现在正式对世界开放。愿花香在您的指尖绽放。”
         </p>
       </div>
       <RouterLink to="/profile" class="text-purple-400 hover:text-purple-300 text-sm tracking-widest border-b border-purple-400/30 pb-1">
         ← 前往经营中心
       </RouterLink>
    </div>

    <div v-else-if="applicationStatus === 'REJECTED'" 
         class="relative z-10 w-full max-w-4xl bg-rose-950/40 backdrop-blur-xl p-12 text-center rounded-xl border border-rose-500/10 shadow-2xl">
       <div class="mb-8">
         <div class="text-5xl mb-6 text-rose-400">🥀</div>
         <h2 class="text-3xl text-rose-200 tracking-widest font-serif italic">契约已终结</h2>
         <p class="mt-6 text-rose-300/70 italic font-serif leading-relaxed px-10">
           “很遗憾，您的卖家资格已被注销。契约一旦解除，将无法再次申请。”
         </p>
       </div>
    </div>

    <div v-else-if="applicationStatus === 'NONE'" class="relative z-10 w-full max-w-7xl bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden text-slate-200 font-serif flex flex-col lg:flex-row min-h-[700px]">
      
      <div class="lg:w-1/3 bg-black/30 p-8 border-r border-white/10 flex flex-col relative">
         <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-60"></div>
         <div class="mt-8 mb-6 flex justify-center">
           <div class="w-28 h-28 rounded-full border-2 border-purple-400/30 p-1 flex items-center justify-center overflow-hidden bg-slate-800 shadow-[0_0_20px_rgba(168,85,247,0.2)]">
             <img v-if="userAvatar" :src="userAvatar" class="w-full h-full object-cover" />
             <span v-else class="text-4xl text-purple-200 font-serif italic">{{ userInitials }}</span>
           </div>
         </div>
         <div class="text-center mb-8">
           <h2 class="text-xl tracking-widest text-white break-all px-4">{{ displayName }}</h2>
           <div class="mt-2"><span class="px-3 py-0.5 rounded-full text-[10px] uppercase border border-purple-500/30 text-purple-300 bg-purple-500/10">{{ userRole }}</span></div>
         </div>
         
         <div class="space-y-4 px-4 text-xs text-slate-400 font-sans tracking-wide">
            <div class="flex justify-between border-b border-white/5 pb-2">
              <span class="uppercase text-slate-600">Email Link</span>
              <span class="text-slate-300 truncate max-w-[150px]">{{ authStore.user?.email || 'N/A' }}</span>
            </div>
            <div class="flex justify-between border-b border-white/5 pb-2">
              <span class="uppercase text-slate-600">System ID</span>
              <span class="font-mono text-slate-500">{{ authStore.user?.id?.substring(0, 8) }}...</span>
            </div>
         </div>
         
         <div class="mt-auto p-4 bg-white/5 border-l-2 border-purple-500 text-xs italic text-slate-400 leading-relaxed text-left">
           <span v-if="sellerType === 'INDIVIDUAL'">"Each flower carries a soul. Welcome, independent artist."</span>
           <span v-else>"Formalizing your business builds trust and legacy."</span>
         </div>
      </div>

      <div class="lg:w-2/3 p-8 lg:p-12 relative overflow-y-auto">
        <h1 class="text-3xl text-white tracking-widest mb-10 border-b border-white/10 pb-4 uppercase">Merchant Registry</h1>

        <div class="grid grid-cols-2 gap-6 mb-10 text-left">
          <div @click="sellerType = 'INDIVIDUAL'" class="cursor-pointer border p-4 rounded-lg transition-all" :class="sellerType === 'INDIVIDUAL' ? 'bg-purple-900/40 border-purple-400 shadow-lg' : 'bg-slate-800/30 border-slate-700 hover:border-slate-500'">
             <div class="flex items-center gap-3 mb-2"><span class="text-2xl">🌿</span><h3 class="text-sm uppercase tracking-widest text-white font-bold">Individual</h3></div>
             <p class="text-[10px] text-slate-400 italic">Freelance florists. NRIC required.</p>
          </div>
          <div @click="sellerType = 'BUSINESS'" class="cursor-pointer border p-4 rounded-lg transition-all" :class="sellerType === 'BUSINESS' ? 'bg-purple-900/40 border-purple-400 shadow-lg' : 'bg-slate-800/30 border-slate-700 hover:border-slate-500'">
             <div class="flex items-center gap-3 mb-2"><span class="text-2xl">🏢</span><h3 class="text-sm uppercase tracking-widest text-white font-bold">Business</h3></div>
             <p class="text-[10px] text-slate-400 italic">Registered entities. BRN & TIN required.</p>
          </div>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-8 text-left">
            <div class="space-y-6">
                <h3 class="text-sm text-slate-500 uppercase tracking-widest border-l-2 border-purple-500 pl-3">I. Identity Verification</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div class="md:col-span-2">
                    <label class="block text-xs text-slate-400 mb-2 uppercase tracking-tighter font-bold">
                      {{ sellerType === 'INDIVIDUAL' ? 'Legal Name' : 'Company / Entity Name' }} <span class="text-red-400">*</span>
                    </label>
                    <input v-model="form.realName" type="text" class="w-full bg-transparent border-b border-slate-700 py-2 focus:border-purple-500 outline-none text-white transition-colors" placeholder="Name as per official registry" />
                  </div>
                  <div class="md:col-span-2">
                    <label class="block text-xs text-slate-400 mb-2 uppercase tracking-tighter font-bold">
                      {{ sellerType === 'INDIVIDUAL' ? 'IC Number' : 'Business Registration Number (BRN)' }} <span class="text-red-400">*</span>
                    </label>
                    <div class="flex gap-4">
                       <input v-model="formattedID" maxlength="14" type="text" class="flex-1 bg-transparent border-b border-slate-700 py-2 focus:border-purple-500 outline-none text-white tracking-widest transition-colors" placeholder="YYMMDD-PB-####" />
                       <button type="button" @click="handleValidate" :disabled="isValidating || isIdVerified" class="px-6 py-1 border border-purple-500/30 text-xs text-purple-300 uppercase hover:bg-purple-500/10 transition-all disabled:opacity-30">
                          {{ isValidating ? 'Verifying...' : (isIdVerified ? 'Verified ✓' : 'Verify') }}
                       </button>
                    </div>
                  </div>
                </div>
            </div>

            <div v-if="sellerType === 'BUSINESS'" class="space-y-6 animate-fade-in-down">
                 <h3 class="text-sm text-slate-500 uppercase tracking-widest border-l-2 border-purple-500 pl-3">II. Tax Compliance (E-Invoice)</h3>
                 <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div class="md:col-span-2">
                     <label class="block text-xs text-slate-400 mb-2 font-bold">TIN Number <span class="text-red-400">*</span></label>
                     <input v-model="form.tinNumber" type="text" class="w-full bg-transparent border-b border-slate-700 py-2 focus:border-purple-500 outline-none text-white" />
                   </div>
                   <div>
                        <label class="block text-xs text-slate-400 mb-2 uppercase font-bold">MSIC Code <span class="text-red-400">*</span></label>
                        <input v-model="form.msicCode" type="text" maxlength="5" class="w-full bg-transparent border-b border-slate-700 py-2 focus:border-purple-500 outline-none text-white" placeholder="e.g. 47733" />
                   </div>
                   <div>
                        <label class="block text-xs text-slate-400 mb-2 uppercase font-bold">SST Number</label>
                        <input v-model="form.sstNumber" type="text" class="w-full bg-transparent border-b border-slate-700 py-2 focus:border-purple-500 outline-none text-white" />
                   </div>
                 </div>
            </div>

            <div class="space-y-6">
                 <h3 class="text-sm text-slate-500 uppercase tracking-widest border-l-2 border-purple-500 pl-3">III. Contact Protocol</h3>
                 <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                       <label class="block text-xs text-slate-400 mb-2 uppercase tracking-tighter font-bold">International Phone <span class="text-red-400">*</span></label>
                       <div class="flex gap-2 border-b border-slate-700 pb-1">
                          <select v-model="form.countryCode" class="bg-transparent text-white text-xs outline-none cursor-pointer">
                              <option v-for="c in countries" :key="c.code" :value="c.code" class="bg-slate-900">{{ c.flag }} {{ c.code }}</option>
                          </select>
                          <input v-model="form.phoneBody" type="tel" class="flex-1 bg-transparent outline-none text-white" placeholder="12345678" />
                       </div>
                    </div>
                    <div class="md:col-span-2">
                       <label class="block text-xs text-slate-400 mb-2 uppercase tracking-tighter font-bold">Full Address <span class="text-red-400">*</span></label>
                       <textarea v-model="form.address" rows="2" class="w-full bg-white/5 border border-white/10 rounded p-2 text-white text-xs focus:border-purple-500 outline-none transition-all"></textarea>
                    </div>
                 </div>
            </div>

            <div class="pt-6 border-t border-white/5 flex flex-col items-end gap-4">
                 <div v-if="sellerStore.error" class="w-full p-3 bg-rose-500/10 border border-rose-500/20 rounded text-rose-400 text-xs text-left animate-pulse">
                   ⚠️ 提交异常：{{ sellerStore.error }}
                 </div>
                 <button type="submit" :disabled="!isIdVerified || sellerStore.isLoading" class="px-10 py-3 bg-purple-600/20 text-purple-200 border border-purple-500/50 hover:bg-purple-600/40 transition-all disabled:opacity-30 disabled:cursor-not-allowed">
                    {{ sellerStore.isLoading ? 'Processing...' : 'Submit Application →' }}
                 </button>
            </div>
        </form>
      </div>
    </div>

    <Transition name="fade">
      <div v-if="showSuccessOverlay" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md px-4">
        
        <div class="absolute inset-0 pointer-events-none overflow-hidden">
          <div v-for="n in 8" :key="n" class="petal" :style="{ left: Math.random() * 100 + '%', animationDelay: Math.random() * 5 + 's' }"></div>
        </div>

        <div class="relative w-full max-w-lg bg-[#fdfaf5] p-10 shadow-2xl rounded-sm animate-letter-slide text-slate-800 border-t-[8px] border-purple-900 font-serif">
          <div class="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/handmade-paper.png')]"></div>
          <div class="relative space-y-8 text-center">
            <h2 class="text-2xl text-purple-900 italic font-bold border-b border-purple-100 pb-4 tracking-widest uppercase">花艺师契约 · 封存</h2>
            <p class="text-sm leading-relaxed italic font-medium typewriter">
                致管理处：<br/><br/>
                申请人 <span class="text-purple-700 font-bold underline decoration-purple-300 decoration-wavy">{{ form.realName }}</span> 已签署契约。<br/>
                契约已即时生效，花园之门已开启。<br/>
                愿花开之时即是相见之日。
            </p>
            <div class="flex justify-center pt-6"><div class="wax-seal animate-stamp"><span class="seal-v">V</span></div></div>
            <div class="pt-10"><button @click="showSuccessOverlay = false" class="text-[10px] uppercase tracking-[0.3em] text-slate-400 hover:text-purple-600 transition-colors">[ 关闭此函 ]</button></div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
/* 紫罗兰与火漆美学样式 */
.wax-seal {
  width: 60px; height: 60px;
  background: radial-gradient(circle, #9b1c1c 0%, #7f1d1d 100%);
  border-radius: 50%;
  box-shadow: 0 4px 10px rgba(0,0,0,0.3), inset 0 2px 5px rgba(255,255,255,0.2);
  display: flex;
  align-items: center;      
  justify-content: center;
  position: relative;
  margin: 0 auto;
}
.seal-v { color: #fbbf24; font-family: 'Times New Roman', serif; font-size: 2rem; font-style: italic; text-shadow: 1px 1px 2px rgba(0,0,0,0.5); user-select: none; }
.animate-stamp { animation: stamp-drop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; opacity: 0; }
@keyframes stamp-drop { 0% { opacity: 0; transform: scale(3) rotate(15deg); filter: blur(4px); } 100% { opacity: 1; transform: scale(1) rotate(0deg); filter: blur(0); } }
.animate-letter-slide { animation: letter-in 0.8s ease-out forwards; }
@keyframes letter-in { from { transform: translateY(100px) scale(0.9); opacity: 0; } to { transform: translateY(0) scale(1); opacity: 1; } }
.petal { position: absolute; width: 15px; height: 15px; background: #a78bfa; border-radius: 150% 0 150% 0; animation: falling 8s linear infinite; z-index: 101; }
@keyframes falling { 0% { transform: translateY(-10vh) rotate(0); } 100% { transform: translateY(110vh) rotate(720deg); } }
.fade-enter-active, .fade-leave-active { transition: opacity 0.5s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.typewriter { display: block; overflow: hidden; white-space: normal; animation: typing 3s steps(50, end); }
</style>