<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { AddressRepository, type Address } from '../../infrastructure/repositories/AddressRepository';
import { OrderRepository } from '../../infrastructure/repositories/OrderRepository';
import { useCartStore } from '../store/cartStore';

const cartStore = useCartStore();
const router = useRouter();
const orderRepo = new OrderRepository();
const addressRepo = new AddressRepository();
const formatPrice = (val: number) => val.toFixed(2);

// 状态
const savedAddresses = ref<Address[]>([]);
const selectedAddressId = ref<number | null>(null);
const isCheckingOut = ref(false);
const isLoadingAddresses = ref(true);

// 加载购物车和地址
onMounted(async () => {
  cartStore.fetchCart();
  try {
    savedAddresses.value = await addressRepo.getMyAddresses();
    
    if (savedAddresses.value.length > 0) {
      const defaultAddr = savedAddresses.value.find(a => a.default);
      const targetAddr = defaultAddr || savedAddresses.value[0];
      
      if (targetAddr && targetAddr.id !== undefined) {
        selectedAddressId.value = targetAddr.id;
      }
    }
  } catch (e) {
    console.error("Failed to load addresses");
  } finally {
    isLoadingAddresses.value = false;
  }
});

// 获取当前选中的地址对象
const currentAddress = computed(() => {
  return savedAddresses.value.find(a => a.id === selectedAddressId.value);
});

// ✅ 核心逻辑：双重确认下单
const handleCheckout = async () => {
  if (cartStore.items.length === 0) return;
  
  if (!currentAddress.value) {
    alert("Please select a shipping address.");
    return;
  }

  // Double Confirmation
  const confirmed = window.confirm(
    `Confirm Checkout?\n\n` +
    `Total: RM ${formatPrice(cartStore.totalPrice)}\n` + 
    `Items: ${cartStore.items.length}\n\n` +
    `Click OK to place your order.`
  );
  
  if (!confirmed) return;

  isCheckingOut.value = true;
  try {
    const response = await orderRepo.checkout({
      receiverName: currentAddress.value.recipientName,
      receiverPhone: currentAddress.value.phoneNumber,
      shippingAddress: currentAddress.value.fullAddress
    });

    alert(`🎉 Order placed successfully! Order ID: ${response.orderId}`);
    router.push('/orders'); 
  } catch (err: any) {
    console.error(err);
    alert("Checkout Failed: " + (err.response?.data?.error || "Unknown error"));
  } finally {
    isCheckingOut.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen bg-slate-50 font-serif">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-bold text-slate-900 font-serif">Shopping Cart</h1>
        <router-link to="/" class="text-sm text-violet-600 hover:underline font-sans">
          &larr; Back to Shop
        </router-link>
      </div>

      <div v-if="cartStore.isLoading && cartStore.items.length === 0" class="flex justify-center py-20">
        <div class="animate-spin text-3xl text-violet-600">❄️</div>
      </div>

      <div v-else-if="cartStore.items.length === 0" class="text-center py-24 bg-white rounded-2xl shadow-sm border border-slate-100">
        <div class="text-6xl mb-6">🛒</div>
        <h2 class="text-2xl font-medium text-slate-900 mb-2">Your cart is currently empty.</h2>
        <router-link to="/" class="mt-6 inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-slate-900 hover:bg-slate-800 shadow-lg">
          Continue Shopping
        </router-link>
      </div>

      <div v-else class="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
        
        <section class="lg:col-span-7">
          <ul role="list" class="border-t border-b border-slate-200 divide-y divide-slate-200">
            <li v-for="item in cartStore.items" :key="item.id" class="flex py-6 sm:py-10">
              <div class="flex-shrink-0">
                <img :src="item.imageUrl" :alt="item.name" class="h-24 w-24 rounded-lg object-cover border border-slate-100" />
              </div>
              <div class="ml-4 flex flex-1 flex-col justify-between sm:ml-6">
                <div>
                  <div class="flex justify-between">
                    <h3 class="text-sm font-bold text-slate-800">{{ item.name }}</h3>
                  </div>
                  <p class="mt-1 text-sm text-emerald-600 font-medium">RM {{ formatPrice(item.price) }}</p>
                </div>
                <div class="flex justify-between items-end">
                   <div class="flex items-center border rounded bg-white shadow-sm">
                      <button @click="cartStore.changeQuantity(item.id, item.quantity, -1)" class="px-3 py-1 hover:bg-slate-100 text-slate-500">-</button>
                      <span class="px-2 text-sm font-bold text-slate-700 min-w-[1.5rem] text-center">{{ item.quantity }}</span>
                      <button @click="cartStore.changeQuantity(item.id, item.quantity, 1)" class="px-3 py-1 hover:bg-slate-100 text-slate-500">+</button>
                   </div>
                   <button @click="cartStore.removeItem(item.id)" class="text-rose-500 text-xs font-bold hover:underline">Remove</button>
                </div>
              </div>
            </li>
          </ul>
        </section>

        <section class="mt-16 bg-white rounded-xl px-4 py-6 shadow-sm border border-slate-100 sm:p-6 lg:col-span-5 lg:mt-0 lg:p-8 sticky top-24">
          <div class="flex justify-between items-center mb-4">
             <h2 class="text-xl font-bold text-slate-900 font-serif">Shipping Details</h2>
             <router-link to="/address-book" class="text-xs font-bold text-violet-600 hover:underline flex items-center gap-1">
               <span>⚙️</span> Manage Addresses
             </router-link>
          </div>

          <div v-if="isLoadingAddresses" class="text-center py-4 text-slate-400">Loading addresses...</div>

          <div v-else-if="savedAddresses.length === 0" class="text-center py-8 bg-slate-50 rounded-lg border border-dashed border-slate-300">
             <p class="text-sm text-slate-500 mb-3">No saved addresses found.</p>
             <router-link to="/address-book" class="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded text-sm font-bold hover:bg-slate-50 shadow-sm transition-all">
               + Add New Address
             </router-link>
          </div>

          <div v-else class="space-y-3 mb-6 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
             <div 
               v-for="addr in savedAddresses" 
               :key="addr.id" 
               @click="selectedAddressId = addr.id!"
               :class="[
                 'cursor-pointer border p-3 rounded-xl transition-all relative',
                 selectedAddressId === addr.id 
                   ? 'border-purple-500 bg-purple-50/50 ring-1 ring-purple-500 shadow-sm' 
                   : 'border-slate-200 hover:border-purple-300 hover:bg-slate-50'
               ]"
             >
                <div class="flex justify-between items-start">
                   <div class="flex items-center gap-2">
                     <span class="font-bold text-slate-800 text-sm">{{ addr.recipientName }}</span>
                     <span v-if="addr.default" class="bg-purple-200 text-purple-800 text-[9px] px-1.5 py-0.5 rounded font-bold">DEFAULT</span>
                   </div>
                   <div v-if="selectedAddressId === addr.id" class="text-purple-600 bg-white rounded-full p-0.5 shadow-sm">
                     <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
                   </div>
                </div>
                <div class="text-xs text-slate-500 mt-1">{{ addr.phoneNumber }}</div>
                <div class="text-xs text-slate-600 mt-2 leading-relaxed p-1.5 rounded border border-transparent" :class="selectedAddressId === addr.id ? 'bg-white/60' : 'bg-slate-100'">
                  {{ addr.fullAddress }}
                </div>
             </div>
          </div>

          <div class="pt-6 border-t border-slate-100">
            <dl class="space-y-4">
              <div class="flex items-center justify-between">
                <dt class="text-sm text-slate-600">Subtotal</dt>
                <dd class="text-sm font-medium text-slate-900">RM {{ formatPrice(cartStore.totalPrice) }}</dd>
              </div>
              <div class="flex items-center justify-between">
                <dt class="text-base font-bold text-slate-900">Total</dt>
                <dd class="text-xl font-bold text-emerald-600">RM {{ formatPrice(cartStore.totalPrice) }}</dd>
              </div>
            </dl>
          </div>

          <button 
            @click="handleCheckout"
            :disabled="isCheckingOut || cartStore.isLoading || !selectedAddressId"
            class="w-full rounded-lg border border-transparent bg-slate-900 px-4 py-3.5 text-base font-bold text-white shadow-lg hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-6 flex justify-center items-center gap-2"
          >
            <span v-if="isCheckingOut" class="animate-spin text-white">❄️</span>
            <span>{{ isCheckingOut ? 'Processing...' : 'Confirm & Pay' }}</span>
          </button>
          
          <div class="mt-4 text-center text-xs text-slate-400">
             Secure Checkout powered by FlowerShop
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f1f1; 
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1; 
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #94a3b8; 
}
</style>