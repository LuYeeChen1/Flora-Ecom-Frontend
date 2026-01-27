<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useAddressStore, type Address } from '../store/addressStore';

const props = defineProps<{
  isOpen: boolean
}>();

const emit = defineEmits(['close', 'select']);
const addressStore = useAddressStore();

const showAddForm = ref(false);
const newAddress = ref<Address>({
  recipientName: '',
  phoneNumber: '',
  fullAddress: '',
  isDefault: false
});

onMounted(() => {
  addressStore.fetchAddresses();
});

const handleSave = async () => {
  await addressStore.addAddress(newAddress.value);
  showAddForm.value = false;
  // 重置表单
  newAddress.value = { recipientName: '', phoneNumber: '', fullAddress: '', isDefault: false };
};

const selectAddress = (addr: Address) => {
  // 拼接一个完整字符串返回给 Checkout 流程
  const formatAddr = `${addr.recipientName} (${addr.phoneNumber}), ${addr.fullAddress}`;
  emit('select', formatAddr);
};
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
    <div class="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
      
      <div class="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
        <h3 class="text-lg font-bold text-slate-800">Select Address</h3>
        <button @click="$emit('close')" class="text-slate-400 hover:text-slate-600">✕</button>
      </div>

      <div class="p-6 max-h-[60vh] overflow-y-auto">
        
        <div v-if="!showAddForm">
          <div v-if="addressStore.addresses.length === 0" class="text-center text-slate-500 py-4">
            No saved addresses.
          </div>
          
          <ul class="space-y-3">
            <li 
              v-for="addr in addressStore.addresses" 
              :key="addr.id"
              @click="selectAddress(addr)"
              class="border border-slate-200 rounded-lg p-4 hover:border-violet-500 hover:bg-violet-50 cursor-pointer transition-all group"
            >
              <div class="flex justify-between items-start">
                <div>
                  <div class="font-bold text-slate-800 flex items-center gap-2">
                    {{ addr.recipientName }}
                    <span class="text-xs font-normal text-slate-500">{{ addr.phoneNumber }}</span>
                    <span v-if="addr.isDefault" class="bg-violet-100 text-violet-700 text-[10px] px-1.5 py-0.5 rounded">Default</span>
                  </div>
                  <p class="text-sm text-slate-600 mt-1">{{ addr.fullAddress }}</p>
                </div>
                <button 
                  @click.stop="addressStore.deleteAddress(addr.id!)" 
                  class="text-rose-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                >
                  🗑
                </button>
              </div>
            </li>
          </ul>

          <button 
            @click="showAddForm = true"
            class="mt-6 w-full py-2 border-2 border-dashed border-slate-300 text-slate-500 rounded-lg hover:border-violet-500 hover:text-violet-600 font-medium transition-colors"
          >
            + Add New Address
          </button>
        </div>

        <div v-else>
          <form @submit.prevent="handleSave" class="space-y-4">
            <div>
              <label class="block text-xs font-medium text-slate-700 mb-1">Recipient Name</label>
              <input v-model="newAddress.recipientName" required class="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-violet-500 focus:border-violet-500" placeholder="e.g. John Doe">
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-700 mb-1">Phone Number</label>
              <input v-model="newAddress.phoneNumber" required class="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-violet-500 focus:border-violet-500" placeholder="e.g. 012-3456789">
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-700 mb-1">Address</label>
              <textarea v-model="newAddress.fullAddress" required rows="3" class="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-violet-500 focus:border-violet-500" placeholder="Street, City, State, Postcode"></textarea>
            </div>
            <div class="flex items-center gap-2">
              <input type="checkbox" v-model="newAddress.isDefault" id="def" class="text-violet-600 focus:ring-violet-500 rounded border-slate-300">
              <label for="def" class="text-sm text-slate-600">Set as default</label>
            </div>

            <div class="flex gap-3 mt-6">
              <button type="button" @click="showAddForm = false" class="flex-1 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-md">Cancel</button>
              <button type="submit" class="flex-1 py-2 text-sm bg-violet-600 text-white rounded-md hover:bg-violet-700">Save Address</button>
            </div>
          </form>
        </div>

      </div>
    </div>
  </div>
</template>