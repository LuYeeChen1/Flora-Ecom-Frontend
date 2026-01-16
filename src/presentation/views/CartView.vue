<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { OrderRepository } from '../../infrastructure/repositories/OrderRepository';
import { useCartStore } from '../store/cartStore';

const cartStore = useCartStore();
const router = useRouter();
const orderRepo = new OrderRepository();
const formatPrice = (val: number) => val.toFixed(2);

// ✅ 1. 改为手动填写表单，移除 AddressSelector
const form = ref({
  name: '',
  phone: '',
  address: ''
});

const isCheckingOut = ref(false);

onMounted(() => {
  cartStore.fetchCart();
});

// ✅ 2. 结账逻辑：带上表单数据
const handleCheckout = async () => {
  if (cartStore.items.length === 0) return;
  
  // 简单校验
  if (!form.value.name || !form.value.phone || !form.value.address) {
    alert("Please fill in all shipping details (Name, Phone, Address).");
    return;
  }

  isCheckingOut.value = true;
  try {
    // 调用 Repository，传入详细信息
    // 注意：email 由后端从 Token 自动提取，前端不需要传
    const response = await orderRepo.checkout({
      receiverName: form.value.name,
      receiverPhone: form.value.phone,
      shippingAddress: form.value.address
    });

    alert(`🎉 Order placed successfully! Order ID: ${response.orderId}`);
    router.push('/'); // 跳转回首页
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
        <p class="text-slate-500 mb-8">Looks like you haven't made your choice yet.</p>
        <router-link to="/" class="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-slate-900 hover:bg-slate-800 transition-all shadow-lg">
          Continue Shopping
        </router-link>
      </div>

      <div v-else class="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
        
        <section class="lg:col-span-7">
          <ul role="list" class="border-t border-b border-slate-200 divide-y divide-slate-200">
            <li v-for="item in cartStore.items" :key="item.id" class="flex py-6 sm:py-10">
              
              <div class="flex-shrink-0">
                <img :src="item.imageUrl" :alt="item.name" class="h-24 w-24 rounded-lg object-cover object-center sm:h-32 sm:w-32 border border-slate-100" />
              </div>

              <div class="ml-4 flex flex-1 flex-col justify-between sm:ml-6">
                <div class="relative pr-9 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:pr-0">
                  <div>
                    <div class="flex justify-between">
                      <h3 class="text-sm">
                        <a href="#" class="font-medium text-slate-700 hover:text-violet-600 text-lg">{{ item.name }}</a>
                      </h3>
                    </div>
                    <p class="mt-1 text-sm font-medium text-emerald-600">RM {{ formatPrice(item.price) }}</p>
                  </div>

                  <div class="mt-4 sm:mt-0 sm:pr-9">
                    <div class="flex items-center border border-slate-200 rounded-lg overflow-hidden w-fit bg-slate-50">
                      <button 
                        @click="cartStore.changeQuantity(item.id, item.quantity, -1)"
                        class="px-3 py-1 hover:bg-slate-200 text-slate-600 transition-colors border-r border-slate-200"
                      >
                        <span class="text-lg">−</span>
                      </button>

                      <input 
                        type="number" 
                        :value="item.quantity" 
                        readonly
                        class="w-12 text-center border-0 bg-transparent py-1 text-sm font-bold text-slate-900 focus:ring-0"
                      />

                      <button 
                        @click="cartStore.changeQuantity(item.id, item.quantity, 1)"
                        class="px-3 py-1 hover:bg-slate-200 text-slate-600 transition-colors border-l border-slate-200"
                      >
                        <span class="text-lg">+</span>
                      </button>
                    </div>

                    <div class="absolute top-0 right-0">
                      <button @click="cartStore.removeItem(item.id)" type="button" class="-m-2 inline-flex p-2 text-slate-400 hover:text-rose-500 transition-colors">
                        <span class="sr-only">Remove</span>
                        <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fill-rule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clip-rule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </section>

        <section class="mt-16 bg-white rounded-xl px-4 py-6 shadow-sm border border-slate-100 sm:p-6 lg:col-span-5 lg:mt-0 lg:p-8">
          <h2 class="text-xl font-bold text-slate-900 font-serif mb-6">Shipping Details</h2>

          <form @submit.prevent="handleCheckout" class="space-y-5">
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Receiver Name</label>
              <input v-model="form.name" required type="text" placeholder="e.g. Chen Chen" class="w-full rounded-md border border-slate-300 px-4 py-2.5 text-sm focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-shadow" />
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Phone Number</label>
              <input v-model="form.phone" required type="tel" placeholder="e.g. 012-3456789" class="w-full rounded-md border border-slate-300 px-4 py-2.5 text-sm focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-shadow" />
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Full Address</label>
              <textarea v-model="form.address" required rows="3" placeholder="Street, Unit, City, Postcode..." class="w-full rounded-md border border-slate-300 px-4 py-2.5 text-sm focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-shadow"></textarea>
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
              type="submit"
              :disabled="isCheckingOut || cartStore.isLoading"
              class="w-full rounded-lg border border-transparent bg-slate-900 px-4 py-3.5 text-base font-bold text-white shadow-lg hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              <span v-if="isCheckingOut">Processing...</span>
              <span v-else>Confirm & Pay</span>
            </button>
          </form>
          
          <div class="mt-4 text-center text-xs text-slate-400">
             Secure Checkout powered by FlowerShop
          </div>
        </section>
      </div>
    </div>
  </div>
</template>