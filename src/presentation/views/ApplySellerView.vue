<script setup lang="ts">
/**
 * ==========================================================
 * [Clean Architecture - Presentation Layer]
 * 职责：仅负责 UI 渲染、用户交互监听、以及简单的界面逻辑（如格式化）。
 * 复杂的业务逻辑（如 API 调用）由 Store (Application Layer) 处理。
 * ==========================================================
 */
import axios from 'axios'; // 用于初始状态检查
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useAuthStore } from '../store/authStore'; // 身份状态仓库
import { useSellerStore } from '../store/sellerStore'; // 卖家业务仓库

// 初始化状态仓库
const sellerStore = useSellerStore();
const authStore = useAuthStore();

// --- 1. UI 交互状态 (Reactive State) ---
const sellerType = ref<'INDIVIDUAL' | 'BUSINESS'>('INDIVIDUAL'); // 申请类型切换
const isIdVerified = ref(false);       // 模拟身份核验状态（Verified 勾选）
const isValidating = ref(false);       // 点击核验时的加载状态
const showSuccessOverlay = ref(false); // 控制“火漆印章”成功动画的显示
const applicationStatus = ref('NONE'); // 实时申请状态：NONE, PENDING_REVIEW, APPROVED

// 国际拨号代码配置，对齐您要求的 +60 前缀选择
const countries = [
  { code: '+60', flag: '🇲🇾' }, { code: '+65', flag: '🇸🇬' }, 
  { code: '+81', flag: '🇯🇵' }, { code: '+86', flag: '🇨🇳' }
];

// --- 2. 生命周期：初始化状态检查 (Status Tracking) ---
onMounted(async () => {
  try {
    /**
     * [业务对齐]：页面加载时立即查询用户是否已有申请记录。
     * 如果返回 PENDING_REVIEW，界面将自动切换为“信笺封存”锁定模式。
     */
    const res = await axios.get('http://localhost:8080/api/seller/status', {
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    });
    applicationStatus.value = res.data;
  } catch (err) {
    console.error("无法同步申请状态", err);
  }
});

// --- 3. 资料回显逻辑 (Identity Mirroring) ---
/**
 * [用户理解]：左侧面板需要展示 Customer 已有的资料。
 * 这些资料来源于 authStore，即 Cognito 同步到本地 MySQL 后的数据 。
 */
const displayName = computed(() => {
  // 优先显示用户名，若无则显示邮箱前缀 [cite: 13]
  return authStore.user?.username || authStore.user?.email?.split('@')[0] || 'User';
});

const userAvatar = computed(() => authStore.user?.avatarUrl); // 数据库中的真实头像 URL
const userInitials = computed(() => displayName.value.charAt(0).toUpperCase()); // 无头像时的首字母
const userRole = computed(() => authStore.user?.role || 'GUEST'); // 当前角色标签 [cite: 114]

// --- 4. 表单数据模型 (Form Model) ---
const form = reactive({
  realName: '',          
  idCardNumber: '',      // 前端内部使用的 ID 字段
  countryCode: '+60',    // 拨号前缀
  phoneBody: '',         // 电话号码主体
  tinNumber: '',         // 企业税号 (E-Invoice)
  msicCode: '47733',     // 行业代码 (默认零售)
  sstNumber: '',         
  address: ''            
});

// --- 5. 格式化逻辑 (Data Formatting) ---
/**
 * NRIC 实时格式化 (YYMMDD-PB-####)
 * 作用：提升填表严谨感，并在输入时自动添加横杠 [cite: 4]
 */
const formattedID = computed({
  get: () => {
    const v = form.idCardNumber.replace(/\D/g, ''); // 过滤掉非数字
    if (v.length <= 6) return v;
    if (v.length <= 8) return `${v.slice(0, 6)}-${v.slice(6)}`;
    return `${v.slice(0, 6)}-${v.slice(6, 8)}-${v.slice(8, 12)}`;
  },
  set: (v) => { form.idCardNumber = v.replace(/\D/g, ''); } // 保存时仅保留数字
});

// 监听身份类型切换，重置特定字段
watch(sellerType, (newType) => {
  if (newType === 'INDIVIDUAL') {
    form.tinNumber = '';
    form.sstNumber = '';
    form.msicCode = '47733';
  }
});

// --- 6. 核心业务：提交申请 (Business Submission) ---
const handleValidate = () => {
  if (form.idCardNumber.length < 12) {
    alert("请输入有效的 12 位身份证号。");
    return;
  }
  isValidating.value = true;
  setTimeout(() => {
    isValidating.value = false;
    isIdVerified.value = true; // 模拟核验通过 [cite: 212]
  }, 1200);
};

const handleSubmit = async () => {
  if (!isIdVerified.value) return;

  /**
   * [Clean Architecture]：构造 Payload 提交给 Application Layer (Store)。
   * 🔴 修复 400 错误：确保字段名为 nricNumber 以对齐后端 DTO 期待的名称 [cite: 188, 192]。
   */
  const payload: any = {
    applyType: sellerType.value,
    phoneNumber: `${form.countryCode}${form.phoneBody}`, // 拼接前缀
    address: form.address,
    realName: form.realName,
    nricNumber: form.idCardNumber, // 映射到后端的 nricNumber 字段
    tinNumber: form.tinNumber,
    msicCode: form.msicCode,
    sstNumber: form.sstNumber
  };

  try {
    await sellerStore.submitApplication(payload);
    if (sellerStore.successMessage) {
      showSuccessOverlay.value = true; // 触发火漆印章动画 [cite: 171]
      applicationStatus.value = 'PENDING_REVIEW'; // 立即锁定表单
    }
  } catch (err) {
    // 错误处理由 sellerStore 负责，错误信息将显示在 template 的说明栏中
    console.error("提交失败", err);
  }
};
</script>

<template>
  <div class="min-h-screen bg-[url('https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=2094&auto=format&fit=crop')] bg-cover bg-center bg-fixed flex items-center justify-center p-4">
    <div class="absolute inset-0 bg-slate-900/70 z-0"></div> <div v-if="applicationStatus === 'PENDING_REVIEW' || applicationStatus === 'REJECTED'" 
         class="relative z-10 w-full max-w-4xl bg-slate-900/40 backdrop-blur-xl p-12 text-center rounded-xl border border-white/10 shadow-2xl">
       <div class="mb-8">
         <div class="wax-seal scale-125 mb-6"><span class="seal-v">V</span></div>
         <h2 class="text-3xl text-white tracking-widest font-serif italic">信笺已在旅途中</h2>
         <p class="mt-6 text-slate-300 italic font-serif leading-relaxed px-10">
           “您的花艺师契约已成功封存并寄往行政处。在管理员给予答复前，请在您的花园中静候佳音。”
         </p>
       </div>
       <RouterLink to="/profile" class="text-purple-400 hover:text-purple-300 text-sm tracking-widest border-b border-purple-400/30 pb-1">
         ← 返回个人中心
       </RouterLink>
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
                <h3 class="text-sm text-slate-500 uppercase tracking-widest border-l-2 border-purple-500 pl-3">I. Personal Verification</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div class="md:col-span-2">
                    <label class="block text-xs text-slate-400 mb-2 uppercase">Legal Name / Entity Name <span class="text-red-400 font-bold">*</span></label>
                    <input v-model="form.realName" type="text" class="w-full bg-transparent border-b border-slate-700 py-2 focus:border-purple-500 outline-none text-white transition-colors" placeholder="Name as per registry" />
                  </div>
                  <div class="md:col-span-2">
                    <label class="block text-xs text-slate-400 mb-2 uppercase">ID Number <span class="text-red-400 font-bold">*</span></label>
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
                 <h3 class="text-sm text-slate-500 uppercase tracking-widest border-l-2 border-purple-500 pl-3">II. Tax Compliance</h3>
                 <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div class="md:col-span-2">
                     <label class="block text-xs text-slate-400 mb-2">TIN Number <span class="text-red-400 font-bold">*</span></label>
                     <input v-model="form.tinNumber" type="text" class="w-full bg-transparent border-b border-slate-700 py-2 focus:border-purple-500 outline-none text-white" />
                   </div>
                   <div class="md:col-span-2">
                        <label class="block text-xs text-slate-400 mb-2 uppercase tracking-widest">MSIC Code <span class="text-red-400 font-bold">*</span></label>
                        <input v-model="form.msicCode" type="text" maxlength="5" class="w-full bg-transparent border-b border-slate-700 py-2 focus:border-purple-500 outline-none text-white" placeholder="e.g. 47733" />
                   </div>
                 </div>
            </div>

            <div class="space-y-6">
                 <h3 class="text-sm text-slate-500 uppercase tracking-widest border-l-2 border-purple-500 pl-3">III. Contact Protocol</h3>
                 <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                       <label class="block text-xs text-slate-400 mb-2 uppercase">International Phone <span class="text-red-400 font-bold">*</span></label>
                       <div class="flex gap-2 border-b border-slate-700 pb-1">
                          <select v-model="form.countryCode" class="bg-transparent text-white text-xs outline-none cursor-pointer">
                              <option v-for="c in countries" :key="c.code" :value="c.code" class="bg-slate-900">{{ c.flag }} {{ c.code }}</option>
                          </select>
                          <input v-model="form.phoneBody" type="tel" class="flex-1 bg-transparent outline-none text-white" placeholder="12345678" />
                       </div>
                    </div>
                    <div class="md:col-span-2">
                       <label class="block text-xs text-slate-400 mb-2 uppercase">Full Address <span class="text-red-400 font-bold">*</span></label>
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
                此信载有名录，正穿过星河递往行政中心。<br/>
                请静候，花开之时即是相见之日。
            </p>

            <div class="flex justify-center pt-6">
              <div class="wax-seal animate-stamp">
                <span class="seal-v">V</span>
              </div>
            </div>

            <div class="pt-10">
              <button @click="showSuccessOverlay = false" class="text-[10px] uppercase tracking-[0.3em] text-slate-400 hover:text-purple-600 transition-colors">
                [ 关闭此函 ]
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
/**
 * 修正：火漆印章核心样式
 * 🔴 修复：align-items 修正，避免截图中的 "colon expected" 报错
 */
.wax-seal {
  width: 60px;
  height: 60px;
  background: radial-gradient(circle, #9b1c1c 0%, #7f1d1d 100%); /* 渐变红 */
  border-radius: 50%;
  box-shadow: 0 4px 10px rgba(0,0,0,0.3), inset 0 2px 5px rgba(255,255,255,0.2);
  display: flex;
  align-items: center;      /* 🔴 已修正：之前误写为 items-center */
  justify-content: center;
  position: relative;
  margin: 0 auto;
}

.seal-v {
  color: #fbbf24;
  font-family: 'Times New Roman', serif;
  font-size: 2rem;
  font-style: italic;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
  user-select: none;
}

/* 印章打击下落动画：从大变小并产生冲击感 */
.animate-stamp {
  animation: stamp-drop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
  opacity: 0;
}

@keyframes stamp-drop {
  0% { opacity: 0; transform: scale(3) rotate(15deg); filter: blur(4px); }
  100% { opacity: 1; transform: scale(1) rotate(0deg); filter: blur(0); }
}

/* 信笺滑动动画 */
.animate-letter-slide {
  animation: letter-in 0.8s ease-out forwards;
}

@keyframes letter-in {
  from { transform: translateY(100px) scale(0.9); opacity: 0; }
  to { transform: translateY(0) scale(1); opacity: 1; }
}

/* 花瓣飘落动画 */
.petal {
  position: absolute;
  width: 15px; height: 15px;
  background: #a78bfa;
  border-radius: 150% 0 150% 0;
  animation: falling 8s linear infinite;
  z-index: 101;
}

@keyframes falling {
  0% { transform: translateY(-10vh) rotate(0); }
  100% { transform: translateY(110vh) rotate(720deg); }
}

/* Vue 标准过渡动画 */
.fade-enter-active, .fade-leave-active { transition: opacity 0.5s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.typewriter {
  display: block;
  overflow: hidden;
  white-space: normal;
  animation: typing 3s steps(50, end);
}
</style>