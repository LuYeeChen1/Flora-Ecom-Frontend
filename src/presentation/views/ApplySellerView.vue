<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { useAuthStore } from '../store/authStore';
import { useSellerStore } from '../store/sellerStore';

const sellerStore = useSellerStore();
const authStore = useAuthStore();

// === 1. 计算属性：获取真实头像或首字母 ===
const userAvatar = computed(() => authStore.user?.avatarUrl); // 从数据库获取的真实头像
const userInitials = computed(() => {
  const name = authStore.user?.username || authStore.user?.email || 'User';
  return name.charAt(0).toUpperCase();
});
const userRole = computed(() => authStore.user?.role || 'GUEST');

// === 2. 身份切换逻辑 ===
const sellerType = ref<'INDIVIDUAL' | 'BUSINESS'>('INDIVIDUAL');

const form = reactive({
  realName: '',          
  idCardNumber: '',      
  tinNumber: '',         
  msicCode: '47733',     
  sstNumber: '',         
  phoneNumber: '',       
  address: ''            
});

watch(sellerType, (newType) => {
  if (newType === 'INDIVIDUAL') {
    form.tinNumber = '';
    form.sstNumber = '';
    form.msicCode = '47733';
  }
});

const isValidating = ref(false);
const isIdVerified = ref(false);

const handleValidate = () => {
  if (!form.idCardNumber) {
    alert("Please enter ID/BRN Number.");
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
    phoneNumber: form.phoneNumber,
    address: form.address
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

  await sellerStore.submitApplication(payload);
};
</script>

<template>
  <div class="min-h-screen bg-[url('https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=2094&auto=format&fit=crop')] bg-cover bg-center bg-fixed flex items-center justify-center p-4">
    <div class="absolute inset-0 bg-slate-900/70 z-0"></div>

    <div class="relative z-10 w-full max-w-7xl bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden text-slate-200 font-serif flex flex-col lg:flex-row min-h-[700px]">
      
      <div class="lg:w-1/3 bg-black/30 p-8 border-r border-white/10 flex flex-col relative">
         <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-60"></div>
         
         <div class="mt-8 mb-6 flex justify-center">
           <div class="w-28 h-28 rounded-full border-2 border-purple-400/30 p-1 shadow-[0_0_20px_rgba(168,85,247,0.2)] flex items-center justify-center overflow-hidden bg-slate-800">
             
             <img v-if="userAvatar" :src="userAvatar" class="w-full h-full object-cover" />
             
             <span v-else class="text-4xl text-purple-200 font-serif italic">
               {{ userInitials }}
             </span>
             
           </div>
         </div>

         <div class="text-center mb-8">
           <h2 class="text-xl tracking-widest text-white break-all px-4">
             {{ authStore.user?.username || 'Unknown User' }}
           </h2>
           <div class="mt-2">
             <span class="px-3 py-0.5 rounded-full text-[10px] uppercase tracking-widest border border-purple-500/30 text-purple-300 bg-purple-500/10">
               {{ userRole }}
             </span>
           </div>
         </div>
         
         <div class="space-y-4 px-4 text-xs text-slate-400 font-sans tracking-wide">
            <div class="flex justify-between border-b border-white/5 pb-2">
              <span class="uppercase text-slate-600">Email Link</span>
              <span class="text-slate-300 truncate max-w-[150px]">{{ authStore.user?.email }}</span>
            </div>
            <div class="flex justify-between border-b border-white/5 pb-2">
              <span class="uppercase text-slate-600">System ID</span>
              <span class="text-slate-500 font-mono">{{ authStore.user?.id?.substring(0, 8) }}...</span>
            </div>
         </div>

         <div class="mt-auto p-4 bg-white/5 border-l-2 border-purple-500 text-xs italic text-slate-400 font-serif leading-relaxed">
           <span v-if="sellerType === 'INDIVIDUAL'">"Each flower carries a soul. Welcome, independent artist."</span>
           <span v-else>"Formalizing your business builds trust and legacy."</span>
         </div>
      </div>

      <div class="lg:w-2/3 p-8 lg:p-12 relative overflow-y-auto">
        <div class="flex justify-between items-end mb-8 border-b border-white/10 pb-4">
          <div>
            <h1 class="text-3xl text-white tracking-widest mb-2">MERCHANT REGISTRY</h1>
            <p class="text-xs text-purple-400 uppercase tracking-[0.2em]">Select Entity Type</p>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-6 mb-10">
          <div @click="sellerType = 'INDIVIDUAL'"
               class="cursor-pointer border p-4 rounded-lg transition-all duration-300 relative overflow-hidden group"
               :class="sellerType === 'INDIVIDUAL' ? 'bg-purple-900/40 border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.2)]' : 'bg-slate-800/30 border-slate-700 hover:border-slate-500'">
             <div class="flex items-center gap-3 mb-2">
               <span class="text-2xl">🌿</span>
               <h3 class="text-sm uppercase tracking-widest text-white">Individual</h3>
             </div>
             <p class="text-[10px] text-slate-400">For freelance florists. Requires NRIC only.</p>
             <div v-if="sellerType === 'INDIVIDUAL'" class="absolute top-2 right-2 text-purple-400 text-xs">● Active</div>
          </div>

          <div @click="sellerType = 'BUSINESS'"
               class="cursor-pointer border p-4 rounded-lg transition-all duration-300 relative overflow-hidden group"
               :class="sellerType === 'BUSINESS' ? 'bg-purple-900/40 border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.2)]' : 'bg-slate-800/30 border-slate-700 hover:border-slate-500'">
             <div class="flex items-center gap-3 mb-2">
               <span class="text-2xl">🏢</span>
               <h3 class="text-sm uppercase tracking-widest text-white">Business</h3>
             </div>
             <p class="text-[10px] text-slate-400">For registered companies. Requires BRN & TIN.</p>
          </div>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-8">
            <div class="space-y-6">
                <h3 class="text-sm text-slate-500 uppercase tracking-widest border-l-2 border-purple-500 pl-3">
                  {{ sellerType === 'INDIVIDUAL' ? 'I. Personal Verification' : 'I. Company Verification' }}
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div class="md:col-span-2">
                    <label class="block text-xs text-slate-400 mb-2">
                       {{ sellerType === 'INDIVIDUAL' ? 'Full Name (as per NRIC)' : 'Registered Company Name' }} <span class="text-red-400">*</span>
                    </label>
                    <input v-model="form.realName" type="text" class="w-full bg-transparent border-b border-slate-700 py-2 focus:border-purple-500 focus:outline-none text-white placeholder-slate-600" />
                  </div>
                  <div class="md:col-span-2">
                    <label class="block text-xs text-slate-400 mb-2">
                      {{ sellerType === 'INDIVIDUAL' ? 'NRIC Number' : 'Business Registration No. (BRN)' }} <span class="text-red-400">*</span>
                    </label>
                    <div class="flex gap-4">
                       <input v-model="form.idCardNumber" type="text" class="flex-1 bg-transparent border-b border-slate-700 py-2 focus:border-purple-500 focus:outline-none text-white placeholder-slate-600" />
                       <button v-if="sellerType === 'INDIVIDUAL'" type="button" @click="handleValidate" :disabled="isValidating || isIdVerified"
                               class="px-6 py-1 border border-purple-500/30 text-xs text-purple-300 uppercase tracking-wider hover:bg-purple-500/10 transition-all disabled:opacity-50">
                          {{ isValidating ? 'Verifying...' : (isIdVerified ? 'Verified ✓' : 'Verify NRIC') }}
                       </button>
                    </div>
                  </div>
                </div>
            </div>

            <div v-if="sellerType === 'BUSINESS'" class="space-y-6 animate-fade-in-down">
                 <h3 class="text-sm text-slate-500 uppercase tracking-widest border-l-2 border-purple-500 pl-3">II. Tax Compliance</h3>
                 <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div class="md:col-span-2">
                     <label class="block text-xs text-slate-400 mb-2">Tax Identification Number (TIN) <span class="text-red-400">*</span></label>
                     <div class="flex gap-4">
                       <input v-model="form.tinNumber" type="text" class="flex-1 bg-transparent border-b border-slate-700 py-2 focus:border-purple-500 focus:outline-none text-white" />
                       <button type="button" @click="handleValidate" :disabled="isValidating || isIdVerified"
                               class="px-6 py-1 border border-purple-500/30 text-xs text-purple-300 uppercase tracking-wider hover:bg-purple-500/10 transition-all disabled:opacity-50">
                          {{ isValidating ? 'Checking LHDN...' : (isIdVerified ? 'Verified ✓' : 'Validate TIN') }}
                       </button>
                     </div>
                   </div>
                        <div class="md:col-span-2 space-y-2">
                        <div class="flex items-center gap-2">
                            <label class="block text-xs text-slate-400 uppercase tracking-widest">
                            MSIC Code <span class="text-red-400">*</span>
                            </label>
                            <div class="group relative inline-block cursor-help">
                            <span class="text-[10px] bg-white/10 text-purple-300 w-4 h-4 rounded-full flex items-center justify-center border border-purple-500/30">?</span>
                            <div class="absolute left-6 top-0 w-64 p-3 bg-slate-900 border border-white/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none shadow-2xl">
                                <p class="text-[10px] text-slate-300 italic leading-relaxed">
                                "The MSIC (Malaysia Standard Industrial Classification) is a 5-digit code identifying your business nature. 
                                For flower retailers, commonly used is <span class='text-purple-400'>47733</span>."
                                </p>
                            </div>
                            </div>
                        </div>

                        <input 
                            v-model="form.msicCode" 
                            type="text" 
                            maxlength="5"
                            class="w-full bg-transparent border-b border-slate-700 py-2 focus:border-purple-500 focus:outline-none transition-colors text-white placeholder-slate-700" 
                            placeholder="Enter 5-digit code (e.g. 47733)" 
                        />
                        <p class="text-[9px] text-slate-500 italic">Please refer to your SSM business profile for the correct code.</p>
                        </div>
                   <div>
                      <label class="block text-xs text-slate-400 mb-2">SST No. (Optional)</label>
                      <input v-model="form.sstNumber" type="text" class="w-full bg-transparent border-b border-slate-700 py-2 focus:border-purple-500 focus:outline-none text-white" />
                   </div>
                 </div>
            </div>

            <div class="space-y-6">
                 <h3 class="text-sm text-slate-500 uppercase tracking-widest border-l-2 border-purple-500 pl-3">
                    {{ sellerType === 'INDIVIDUAL' ? 'II. Contact Info' : 'III. Business Address' }}
                 </h3>
                 <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                       <label class="block text-xs text-slate-400 mb-2">Phone Number <span class="text-red-400">*</span></label>
                       <input v-model="form.phoneNumber" type="text" class="w-full bg-transparent border-b border-slate-700 py-2 focus:border-purple-500 focus:outline-none text-white" />
                    </div>
                    <div class="md:col-span-2">
                       <label class="block text-xs text-slate-400 mb-2">Full Address <span class="text-red-400">*</span></label>
                       <textarea v-model="form.address" rows="2" class="w-full bg-slate-800/30 border border-slate-700 rounded p-2 text-white focus:outline-none focus:border-purple-500 text-sm resize-none"></textarea>
                    </div>
                 </div>
            </div>

            <div class="pt-6 flex justify-between border-t border-white/5 items-center">
                 <div class="text-xs text-red-400">{{ sellerStore.error }}</div>
                 <button type="submit" :disabled="!isIdVerified || sellerStore.isLoading"
                         class="px-8 py-3 bg-purple-600/20 text-purple-200 border border-purple-500/50 hover:bg-purple-600/40 transition-all disabled:grayscale disabled:cursor-not-allowed">
                    {{ sellerStore.isLoading ? 'Processing...' : 'Submit Application →' }}
                 </button>
            </div>
        </form>
      </div>

    </div>
  </div>
</template>