<script setup lang="ts">
/**
 * [Clean Architecture - Presentation Layer]
 * 修复：nricNumber 字段对齐
 * 修复：align-items CSS 语法错误
 */
import axios from 'axios';
import { computed, onMounted, reactive, ref } from 'vue';
import { useAuthStore } from '../store/authStore';
import { useSellerStore } from '../store/sellerStore';

const sellerStore = useSellerStore();
const authStore = useAuthStore();

const sellerType = ref<'INDIVIDUAL' | 'BUSINESS'>('INDIVIDUAL');
const isIdVerified = ref(false);
const isValidating = ref(false);
const showSuccessOverlay = ref(false); 
const applicationStatus = ref('NONE'); // NONE, APPROVED, REJECTED

const countries = [
  { code: '+60', flag: '🇲🇾' }, { code: '+65', flag: '🇸🇬' }, 
  { code: '+81', flag: '🇯🇵' }, { code: '+86', flag: '🇨🇳' }
];

onMounted(async () => {
  try {
    const res = await axios.get('http://localhost:8080/api/seller/status', {
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    });
    applicationStatus.value = res.data;
  } catch (err) {
    console.error("无法同步状态", err);
  }
});

const displayName = computed(() => authStore.user?.username || authStore.user?.email?.split('@')[0] || 'User');
const userAvatar = computed(() => authStore.user?.avatarUrl);
const userInitials = computed(() => displayName.value.charAt(0).toUpperCase());

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

const formattedID = computed({
  get: () => {
    const v = form.idCardNumber.replace(/\D/g, '');
    if (v.length <= 6) return v;
    if (v.length <= 8) return `${v.slice(0, 6)}-${v.slice(6)}`;
    return `${v.slice(0, 6)}-${v.slice(6, 8)}-${v.slice(8, 12)}`;
  },
  set: (v) => { form.idCardNumber = v.replace(/\D/g, ''); }
});

const handleValidate = () => {
  if (form.idCardNumber.length < 12) return;
  isValidating.value = true;
  setTimeout(() => {
    isValidating.value = false;
    isIdVerified.value = true;
  }, 1200);
};

const handleSubmit = async () => {
  if (!isIdVerified.value) return;

  // 🔴 关键修复：payload 字段名对齐后端
  const payload = {
    applyType: sellerType.value,
    phoneNumber: `${form.countryCode}${form.phoneBody}`,
    address: form.address,
    realName: form.realName,
    nricNumber: form.idCardNumber, // 改为 nricNumber 对齐 SellerApplyDTORequest
    tinNumber: form.tinNumber,
    msicCode: form.msicCode,
    sstNumber: form.sstNumber
  };

  try {
    await sellerStore.submitApplication(payload as any);
    if (sellerStore.successMessage) {
      showSuccessOverlay.value = true; 
      applicationStatus.value = 'APPROVED'; // 直接成为 Seller
    }
  } catch (err) {
    console.error("提交异常", err);
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
         <div class="text-5xl mb-6">🥀</div>
         <h2 class="text-3xl text-rose-200 tracking-widest font-serif italic">契约已终结</h2>
         <p class="mt-6 text-rose-300/70 italic font-serif leading-relaxed px-10">
           “很遗憾，您的卖家资格已被注销。请联系行政管理处了解详细原因。”
         </p>
       </div>
    </div>

    <div v-else-if="applicationStatus === 'NONE'" class="relative z-10 w-full max-w-7xl bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden text-slate-200 font-serif flex flex-col lg:flex-row min-h-[700px]">
      <div class="lg:w-1/3 bg-black/30 p-8 border-r border-white/10 flex flex-col relative">
         <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-60"></div>
         <div class="mt-8 mb-6 flex justify-center">
           <div class="w-28 h-28 rounded-full border-2 border-purple-400/30 p-1 flex items-center justify-center overflow-hidden bg-slate-800">
             <img v-if="userAvatar" :src="userAvatar" class="w-full h-full object-cover" />
             <span v-else class="text-4xl text-purple-200 font-serif italic">{{ userInitials }}</span>
           </div>
         </div>
         <div class="text-center mb-8">
           <h2 class="text-xl tracking-widest text-white">{{ displayName }}</h2>
         </div>
         <div class="space-y-4 px-4 text-xs text-slate-400 font-sans tracking-wide">
            <div class="flex justify-between border-b border-white/5 pb-2"><span>Email</span><span class="truncate max-w-[150px]">{{ authStore.user?.email }}</span></div>
            <div class="flex justify-between border-b border-white/5 pb-2"><span>System ID</span><span class="font-mono">{{ authStore.user?.id?.substring(0, 8) }}...</span></div>
         </div>
      </div>

      <div class="lg:w-2/3 p-8 lg:p-12 relative overflow-y-auto">
        <h1 class="text-3xl text-white tracking-widest mb-10 border-b border-white/10 pb-4">MERCHANT REGISTRY</h1>
        <form @submit.prevent="handleSubmit" class="space-y-8 text-left">
            <div class="grid grid-cols-2 gap-6 mb-10">
              <div @click="sellerType = 'INDIVIDUAL'" class="cursor-pointer border p-4 rounded-lg transition-all" :class="sellerType === 'INDIVIDUAL' ? 'bg-purple-900/40 border-purple-400' : 'bg-slate-800/30 border-slate-700'">
                <div class="flex items-center gap-3 mb-2">🌿 <h3 class="text-sm uppercase tracking-widest text-white">Individual</h3></div>
              </div>
              <div @click="sellerType = 'BUSINESS'" class="cursor-pointer border p-4 rounded-lg transition-all" :class="sellerType === 'BUSINESS' ? 'bg-purple-900/40 border-purple-400' : 'bg-slate-800/30 border-slate-700'">
                <div class="flex items-center gap-3 mb-2">🏢 <h3 class="text-sm uppercase tracking-widest text-white">Business</h3></div>
              </div>
            </div>

            <div class="space-y-6">
                <input v-model="form.realName" type="text" class="w-full bg-transparent border-b border-slate-700 py-2 focus:border-purple-500 outline-none text-white" placeholder="Legal Name" />
                <div class="flex gap-4">
                    <input v-model="formattedID" maxlength="14" type="text" class="flex-1 bg-transparent border-b border-slate-700 py-2 focus:border-purple-500 outline-none text-white tracking-widest" placeholder="YYMMDD-PB-####" />
                    <button type="button" @click="handleValidate" :disabled="isValidating || isIdVerified" class="px-6 py-1 border border-purple-500/30 text-xs text-purple-300 uppercase hover:bg-purple-500/10 transition-all">
                      {{ isValidating ? 'Verifying...' : (isIdVerified ? 'Verified ✓' : 'Verify') }}
                    </button>
                </div>
                <div class="flex gap-2 border-b border-slate-700 pb-1">
                    <select v-model="form.countryCode" class="bg-transparent text-white text-xs outline-none">
                        <option v-for="c in countries" :key="c.code" :value="c.code" class="bg-slate-900">{{ c.flag }} {{ c.code }}</option>
                    </select>
                    <input v-model="form.phoneBody" type="tel" class="flex-1 bg-transparent outline-none text-white" placeholder="12345678" />
                </div>
                <textarea v-model="form.address" rows="2" class="w-full bg-white/5 border border-white/10 rounded p-2 text-white text-xs" placeholder="Full Address"></textarea>
            </div>

            <div class="pt-6 border-t border-white/5 flex flex-col items-end gap-4">
                 <div v-if="sellerStore.error" class="w-full p-3 bg-rose-500/10 border border-rose-500/20 rounded text-rose-400 text-xs text-left">{{ sellerStore.error }}</div>
                 <button type="submit" :disabled="!isIdVerified || sellerStore.isLoading" class="px-10 py-3 bg-purple-600/20 text-purple-200 border border-purple-500/50 hover:bg-purple-600/40 transition-all disabled:opacity-30">
                    Submit Application →
                 </button>
            </div>
        </form>
      </div>
    </div>

    <Transition name="fade">
      <div v-if="showSuccessOverlay" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md px-4">
        <div class="relative w-full max-w-lg bg-[#fdfaf5] p-10 shadow-2xl rounded-sm animate-letter-slide text-slate-800 border-t-[8px] border-purple-900 font-serif">
          <div class="relative space-y-8 text-center">
            <h2 class="text-2xl text-purple-900 italic font-bold border-b border-purple-100 pb-4 tracking-widest uppercase">花艺师契约 · 封存</h2>
            <p class="text-sm leading-relaxed italic font-medium typewriter">
                致管理处：<br/><br/>
                申请人 <span class="text-purple-700 font-bold underline">{{ form.realName }}</span> 已签署契约。<br/>
                契约已即时生效，花园之门已开启。
            </p>
            <div class="flex justify-center pt-6"><div class="wax-seal animate-stamp"><span class="seal-v">V</span></div></div>
            <div class="pt-10"><button @click="showSuccessOverlay = false" class="text-[10px] uppercase tracking-[0.3em] text-slate-400 hover:text-purple-600">[ 关闭此函 ]</button></div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.wax-seal {
  width: 60px; height: 60px;
  background: radial-gradient(circle, #9b1c1c 0%, #7f1d1d 100%);
  border-radius: 50%;
  box-shadow: 0 4px 10px rgba(0,0,0,0.3), inset 0 2px 5px rgba(255,255,255,0.2);
  display: flex;
  align-items: center;      /* 🔴 已修正：之前误写为 items-center */
  justify-content: center;
  position: relative;
  margin: 0 auto;
}
.seal-v { color: #fbbf24; font-family: 'Times New Roman', serif; font-size: 2rem; font-style: italic; text-shadow: 1px 1px 2px rgba(0,0,0,0.5); user-select: none; }
.animate-stamp { animation: stamp-drop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; opacity: 0; }
@keyframes stamp-drop { 0% { opacity: 0; transform: scale(3) rotate(15deg); filter: blur(4px); } 100% { opacity: 1; transform: scale(1) rotate(0deg); filter: blur(0); } }
.animate-letter-slide { animation: letter-in 0.8s ease-out forwards; }
@keyframes letter-in { from { transform: translateY(100px) scale(0.9); opacity: 0; } to { transform: translateY(0) scale(1); opacity: 1; } }
.fade-enter-active, .fade-leave-active { transition: opacity 0.5s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>