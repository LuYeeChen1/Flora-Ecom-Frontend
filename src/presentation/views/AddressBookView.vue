<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { AddressRepository, type Address } from '../../infrastructure/repositories/AddressRepository';
import Navbar from '../components/Navbar.vue';

const router = useRouter();
const repo = new AddressRepository();

const addresses = ref<Address[]>([]);
const isLoading = ref(true);
const showForm = ref(false);
const isSubmitting = ref(false);

const form = reactive<Address>({
  recipientName: '',
  phoneNumber: '',
  fullAddress: '',
  default: false
});

// 加载地址列表
const loadAddresses = async () => {
  isLoading.value = true;
  try {
    addresses.value = await repo.getMyAddresses();
  } catch (err) {
    console.error("Failed to load addresses", err);
  } finally {
    isLoading.value = false;
  }
};

// 保存地址
const handleSave = async () => {
  if (!form.recipientName || !form.phoneNumber || !form.fullAddress) {
    alert("Please fill in all fields.");
    return;
  }

  isSubmitting.value = true;
  try {
    await repo.saveAddress({ ...form });
    // 重置表单
    form.recipientName = '';
    form.phoneNumber = '';
    form.fullAddress = '';
    form.default = false;
    showForm.value = false;
    
    await loadAddresses(); // 刷新列表
  } catch (err) {
    alert("Failed to save address.");
  } finally {
    isSubmitting.value = false;
  }
};

// 删除地址
const handleDelete = async (id: number) => {
  if (!confirm("Are you sure you want to delete this address?")) return;
  try {
    await repo.deleteAddress(id);
    await loadAddresses();
  } catch (err) {
    alert("Failed to delete address.");
  }
};

onMounted(loadAddresses);
</script>

<template>
  <div class="min-h-screen bg-slate-50 font-serif pb-20">
    <Navbar />
    
    <div class="max-w-3xl mx-auto px-4 py-10">
      <div class="flex justify-between items-center mb-8">
        <div class="flex items-center gap-4">
          <button @click="router.back()" class="text-sm text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-1">
            <span>&larr;</span> Back
          </button>
          <h1 class="text-3xl font-bold text-slate-900">Address Book</h1>
        </div>
        <button 
          v-if="!showForm"
          @click="showForm = true" 
          class="bg-slate-900 text-white px-5 py-2 rounded-lg hover:bg-slate-800 transition-colors text-sm font-bold shadow-lg"
        >
          + Add New Address
        </button>
      </div>

      <div v-if="showForm" class="bg-white p-6 rounded-xl shadow-lg border border-slate-100 mb-8 animation-slide-down">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-bold text-slate-800">New Shipping Address</h3>
          <button @click="showForm = false" class="text-slate-400 hover:text-slate-600">✕</button>
        </div>
        
        <div class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Receiver Name</label>
              <input v-model="form.recipientName" type="text" class="w-full border border-slate-300 rounded p-2 focus:border-purple-500 outline-none" placeholder="e.g. Chen Chen" />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Phone Number</label>
              <input v-model="form.phoneNumber" type="text" class="w-full border border-slate-300 rounded p-2 focus:border-purple-500 outline-none" placeholder="e.g. 012-3456789" />
            </div>
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Full Address</label>
            <textarea v-model="form.fullAddress" rows="3" class="w-full border border-slate-300 rounded p-2 focus:border-purple-500 outline-none" placeholder="Unit, Street, City, Postcode..."></textarea>
          </div>
          
          <div class="flex items-center gap-2">
            <input type="checkbox" v-model="form.default" id="isDefault" class="rounded text-purple-600 focus:ring-purple-500"/>
            <label for="isDefault" class="text-sm text-slate-600">Set as default address</label>
          </div>

          <div class="pt-2">
            <button 
              @click="handleSave" 
              :disabled="isSubmitting"
              class="w-full bg-purple-600 text-white py-2.5 rounded-lg font-bold hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              {{ isSubmitting ? 'Saving...' : 'Save Address' }}
            </button>
          </div>
        </div>
      </div>

      <div v-if="isLoading" class="text-center py-12">
        <div class="animate-spin text-2xl mb-2">❄️</div>
        <p class="text-slate-400">Loading your addresses...</p>
      </div>

      <div v-else-if="addresses.length === 0" class="text-center py-16 bg-white rounded-xl border-2 border-dashed border-slate-200">
        <div class="text-4xl mb-4">📍</div>
        <p class="text-slate-500">You haven't saved any addresses yet.</p>
        <button @click="showForm = true" class="mt-4 text-purple-600 font-bold hover:underline">Add your first address</button>
      </div>

      <div v-else class="space-y-4">
        <div v-for="addr in addresses" :key="addr.id" class="bg-white p-5 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all group relative">
          <div class="flex justify-between items-start">
            <div>
              <div class="flex items-center gap-3">
                <span class="font-bold text-slate-900 text-lg">{{ addr.recipientName }}</span>
                <span v-if="addr.default" class="bg-purple-100 text-purple-700 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">Default</span>
              </div>
              <p class="text-slate-500 text-sm mt-1">{{ addr.phoneNumber }}</p>
              <p class="text-slate-700 mt-2 text-sm leading-relaxed bg-slate-50 p-2 rounded border border-slate-100 max-w-xl">
                {{ addr.fullAddress }}
              </p>
            </div>
            
            <button 
              @click="handleDelete(addr.id!)"
              class="text-slate-400 hover:text-rose-500 p-2 rounded-full hover:bg-rose-50 transition-colors"
              title="Delete Address"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>