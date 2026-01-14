<script setup lang="ts">
/**
 * [Presentation Layer] 表现层组件
 * 采用 Vue 3 Composition API 构建，仅负责 UI 交互与渲染 [cite: 195, 196]。
 */
import axios from 'axios';
import { computed, onMounted, reactive, ref } from 'vue';
import { useAuthStore } from '../store/authStore';
import { useSellerStore } from '../store/sellerStore';

const sellerStore = useSellerStore();
const authStore = useAuthStore();

// UI 动画与状态
const sellerType = ref<'INDIVIDUAL' | 'BUSINESS'>('INDIVIDUAL');
const isIdVerified = ref(false); // 模拟 E-Invoice 的核验状态 [cite: 212]
const showSuccessOverlay = ref(false); // 控制“火漆印章”动画显示
const applicationStatus = ref('NONE'); // 实时获取申请状态

// 国际拨号前缀选择器支持
const countries = [{ code: '+60', flag: '🇲🇾' }, { code: '+65', flag: '🇸🇬' }];

// 初始化：检查用户是否已存在申请 [cite: 108, 211]
onMounted(async () => {
  try {
    const res = await axios.get('http://localhost:8080/api/seller/status', {
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    });
    applicationStatus.value = res.data;
  } catch (err) { console.error("Status check failed"); }
});

// 计算属性：回显数据库真实资料 [cite: 201]
const userAvatar = computed(() => authStore.user?.avatarUrl);
const userDisplayName = computed(() => authStore.user?.username || authStore.user?.email?.split('@')[0] || 'User');
const userInitials = computed(() => userDisplayName.value.charAt(0).toUpperCase());

// 表单响应式数据
const form = reactive({
  realName: '',          
  idCardNumber: '',      // 页面内部使用的 ID 字段
  countryCode: '+60',    
  phoneBody: '',         
  address: ''            
});

// NRIC 自动格式化 (如: 900101-10-1234) [cite: 57]
const formattedID = computed({
  get: () => {
    const v = form.idCardNumber.replace(/\D/g, '');
    if (v.length <= 6) return v;
    if (v.length <= 8) return `${v.slice(0, 6)}-${v.slice(6)}`;
    return `${v.slice(0, 6)}-${v.slice(6, 8)}-${v.slice(8, 12)}`;
  },
  set: (v) => { form.idCardNumber = v.replace(/\D/g, ''); }
});

// 提交逻辑：全流程封存仪式 [cite: 108, 109]
const handleSubmit = async () => {
  if (!isIdVerified.value) return;

  /**
   * 🔴 修复 400 报错的关键：
   * 将前端的 idCardNumber 映射为后端 Request DTO 期待的 nricNumber 字段。
   */
  const payload = {
    applyType: sellerType.value,
    phoneNumber: `${form.countryCode}${form.phoneBody}`,
    address: form.address,
    realName: form.realName,
    nricNumber: form.idCardNumber // 字段名对齐后端 [cite: 154, 166]
  };

  try {
    await sellerStore.submitApplication(payload as any);
    if (sellerStore.successMessage) {
      showSuccessOverlay.value = true; // 触发“火漆印章”全屏动画
      applicationStatus.value = 'PENDING_REVIEW'; // 提交后立即锁定 UI
    }
  } catch (err) { /* Store 负责处理详细报错展示 */ }
};
</script>

<template>
  <div class="min-h-screen bg-slate-950 font-serif flex items-center justify-center p-4">
    
    <div v-if="applicationStatus === 'PENDING_REVIEW'" class="z-10 p-12 text-center bg-slate-900/40 backdrop-blur-xl rounded-xl border border-white/10">
      <div class="wax-seal scale-125 mb-6"><span class="seal-v">V</span></div>
      <h2 class="text-3xl text-white italic">信笺已在旅途中</h2>
      <p class="mt-4 text-slate-400 italic">“您的花艺师契约已封存，请在花园中静候佳音。”</p>
    </div>

    <div v-else-if="applicationStatus === 'NONE'" class="z-10 w-full max-w-7xl flex flex-col lg:flex-row bg-slate-900/40 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden shadow-2xl">
      <div class="lg:w-1/3 bg-black/30 p-8 flex flex-col items-center border-r border-white/10">
        <div class="w-24 h-24 rounded-full border-2 border-purple-500/30 p-1 bg-slate-800 flex items-center justify-center overflow-hidden">
          <img v-if="userAvatar" :src="userAvatar" class="w-full h-full object-cover" />
          <span v-else class="text-3xl text-purple-200 italic">{{ userInitials }}</span>
        </div>
        <h2 class="mt-4 text-xl text-white tracking-widest">{{ userDisplayName }}</h2>
        <p class="text-[10px] text-purple-400 uppercase mt-1 tracking-widest">Customer Profile</p>
        <div class="mt-auto p-4 bg-white/5 border-l-2 border-purple-500 text-[10px] italic text-slate-400">
          "Flowers are the silent language of the soul."
        </div>
      </div>

      <div class="lg:w-2/3 p-12 overflow-y-auto">
        <h1 class="text-3xl text-white tracking-widest mb-10 border-b border-white/10 pb-4">MERCHANT REGISTRY</h1>
        <form @submit.prevent="handleSubmit" class="space-y-8">
          <div class="space-y-6">
            <input v-model="form.realName" class="w-full bg-transparent border-b border-white/10 py-2 text-white outline-none focus:border-purple-500" placeholder="Legal Full Name" />
            <div class="flex gap-4">
              <input v-model="formattedID" maxlength="14" class="flex-1 bg-transparent border-b border-white/10 py-2 text-white outline-none tracking-widest" placeholder="YYMMDD-PB-####" />
              <button type="button" @click="isIdVerified = true" class="px-4 text-[10px] border border-purple-500 text-purple-400 hover:bg-purple-500/10">
                {{ isIdVerified ? 'Verified ✓' : 'Verify' }}
              </button>
            </div>
          </div>
          <button type="submit" :disabled="!isIdVerified" class="w-full py-4 bg-purple-600/20 border border-purple-500 text-purple-100 hover:bg-purple-600/40 disabled:opacity-20 transition-all">
            Submit Application →
          </button>
        </form>
      </div>
    </div>

    <Transition name="fade">
      <div v-if="showSuccessOverlay" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md">
        <div class="relative w-full max-w-lg bg-[#fdfaf5] p-10 shadow-2xl rounded-sm animate-letter-slide text-slate-800 border-t-[8px] border-purple-900">
          <div class="space-y-8 text-center font-serif">
            <h2 class="text-2xl text-purple-900 italic font-bold border-b border-purple-100 pb-4">花艺师契约 · 封存</h2>
            <p class="text-sm italic leading-relaxed">申请人 <span class="font-bold underline">{{ form.realName }}</span> 已寄出契约，<br/>静候花开。</p>
            <div class="wax-seal animate-stamp"><span class="seal-v">V</span></div>
            <button @click="showSuccessOverlay = false" class="text-[10px] text-slate-400 uppercase tracking-widest">[ Close Letter ]</button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
/* 🔴 修复：align-items 修正，避免 colon expected 报错 */
.wax-seal {
  width: 60px; height: 60px;
  background: radial-gradient(circle, #9b1c1c 0%, #7f1d1d 100%);
  border-radius: 50%;
  box-shadow: 0 4px 10px rgba(0,0,0,0.3);
  display: flex;
  align-items: center;      /* 修正点 */
  justify-content: center;
  margin: 0 auto;
}
.seal-v { color: #fbbf24; font-family: serif; font-size: 2rem; }
.animate-stamp { animation: stamp-drop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
@keyframes stamp-drop { 0% { opacity: 0; transform: scale(3) rotate(15deg); } 100% { opacity: 1; transform: scale(1); } }
@keyframes letter-in { from { transform: translateY(50px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
.animate-letter-slide { animation: letter-in 0.8s ease-out; }
</style>