<script setup lang="ts">
import { onMounted } from 'vue';
import Navbar from '../components/Navbar.vue';
import { useCartStore } from '../store/cartStore';

const cartStore = useCartStore();
const formatPrice = (val: number) => val.toFixed(2);

onMounted(() => {
  cartStore.fetchCart();
});
</script>

<template>
  <div class="min-h-screen bg-slate-50 font-serif">
    <Navbar />

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 class="text-3xl font-bold text-slate-900 mb-8 font-serif">Shopping Cart</h1>

      <div v-if="cartStore.isLoading" class="flex justify-center py-20">
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
                    <label :for="`quantity-${item.id}`" class="sr-only">Quantity</label>
                    <div class="flex items-center border border-slate-300 rounded-md w-24">
                       <span class="pl-3 text-slate-500 text-xs">Qty</span>
                       <input 
                         type="number" 
                         :value="item.quantity" 
                         readonly
                         class="block w-full border-0 py-1.5 pl-2 text-slate-900 sm:text-sm bg-transparent focus:ring-0"
                       />
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

        <section class="mt-16 bg-white rounded-lg px-4 py-6 shadow-sm border border-slate-100 sm:p-6 lg:col-span-5 lg:mt-0 lg:p-8">
          <h2 class="text-lg font-medium text-slate-900 font-serif">Order summary</h2>

          <dl class="mt-6 space-y-4">
            <div class="flex items-center justify-between">
              <dt class="text-sm text-slate-600">Subtotal</dt>
              <dd class="text-sm font-medium text-slate-900">RM {{ formatPrice(cartStore.totalPrice) }}</dd>
            </div>
            <div class="flex items-center justify-between border-t border-slate-200 pt-4">
              <dt class="text-base font-medium text-slate-900">Order total</dt>
              <dd class="text-xl font-bold text-emerald-600">RM {{ formatPrice(cartStore.totalPrice) }}</dd>
            </div>
          </dl>

          <div class="mt-6">
            <button type="button" class="w-full rounded-md border border-transparent bg-slate-900 px-4 py-3 text-base font-medium text-white shadow-sm hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-slate-50 transition-all">
              Checkout
            </button>
          </div>
          
          <div class="mt-4 text-center text-xs text-slate-400">
             Shipping and taxes calculated at checkout.
          </div>
        </section>
      </div>
    </div>
  </div>
</template>