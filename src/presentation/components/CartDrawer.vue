<script setup lang="ts">
import { useCartStore } from '../store/cartStore';

const cartStore = useCartStore();

// 格式化金额 (RM)
const formatPrice = (val: number) => val.toFixed(2);
</script>

<template>
  <div class="relative z-[100]" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
    
    <Transition 
      enter-active-class="ease-in-out duration-500" 
      enter-from-class="opacity-0" 
      enter-to-class="opacity-100"
      leave-active-class="ease-in-out duration-500" 
      leave-from-class="opacity-100" 
      leave-to-class="opacity-0"
    >
      <div 
        v-if="cartStore.isCartOpen" 
        class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" 
        @click="cartStore.toggleCart"
      ></div>
    </Transition>

    <div class="fixed inset-0 overflow-hidden pointer-events-none">
      <div class="absolute inset-0 overflow-hidden">
        <div class="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
          
          <Transition
            enter-active-class="transform transition ease-in-out duration-500 sm:duration-700"
            enter-from-class="translate-x-full"
            enter-to-class="translate-x-0"
            leave-active-class="transform transition ease-in-out duration-500 sm:duration-700"
            leave-from-class="translate-x-0"
            leave-to-class="translate-x-full"
          >
            <div v-if="cartStore.isCartOpen" class="pointer-events-auto w-screen max-w-md">
              <div class="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
                
                <div class="flex items-start justify-between px-4 py-6 sm:px-6 border-b border-slate-100 bg-slate-50/50">
                  <h2 class="text-lg font-serif font-medium text-slate-900" id="slide-over-title">Shopping Cart</h2>
                  <div class="ml-3 flex h-7 items-center">
                    <button @click="cartStore.toggleCart" type="button" class="-m-2 p-2 text-slate-400 hover:text-slate-500">
                      <span class="sr-only">Close panel</span>
                      <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div class="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
                  
                  <div v-if="cartStore.isLoading && cartStore.items.length === 0" class="flex justify-center py-10">
                    <div class="animate-spin text-violet-600 text-2xl">❄️</div>
                  </div>

                  <div v-else-if="cartStore.items.length === 0" class="text-center py-20">
                    <div class="text-4xl mb-4 opacity-30">🛒</div>
                    <p class="text-slate-500 font-serif italic">Your cart is empty.</p>
                    <p class="text-xs text-slate-400 mt-2">Go pick some flowers!</p>
                    <button @click="cartStore.toggleCart" class="mt-6 text-violet-600 text-sm font-bold hover:underline">
                      Continue Shopping &rarr;
                    </button>
                  </div>

                  <ul v-else role="list" class="-my-6 divide-y divide-slate-100">
                    <li v-for="item in cartStore.items" :key="item.id" class="flex py-6">
                      <div class="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-slate-200">
                        <img :src="item.imageUrl" :alt="item.name" class="h-full w-full object-cover object-center" />
                      </div>

                      <div class="ml-4 flex flex-1 flex-col">
                        <div>
                          <div class="flex justify-between text-base font-medium text-slate-900">
                            <h3 class="font-serif"><a href="#">{{ item.name }}</a></h3>
                            <p class="ml-4 font-sans text-emerald-600">RM {{ formatPrice(item.price) }}</p>
                          </div>
                        </div>
                        <div class="flex flex-1 items-end justify-between text-sm">
                          <p class="text-slate-500">Qty {{ item.quantity }}</p>

                          <div class="flex">
                            <button 
                              @click="cartStore.removeItem(item.id)"
                              type="button" 
                              class="font-medium text-rose-500 hover:text-rose-700 transition-colors text-xs uppercase tracking-wider"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    </li>
                  </ul>
                </div>

                <div v-if="cartStore.items.length > 0" class="border-t border-slate-100 px-4 py-6 sm:px-6 bg-slate-50">
                  <div class="flex justify-between text-base font-medium text-slate-900 mb-4">
                    <p class="font-serif">Subtotal</p>
                    <p class="font-sans font-bold text-lg text-emerald-700">RM {{ formatPrice(cartStore.totalPrice) }}</p>
                  </div>
                  <p class="mt-0.5 text-xs text-slate-400 mb-6">Shipping and taxes calculated at checkout.</p>
                  <div class="mt-6">
                    <a href="#" class="flex items-center justify-center rounded-md border border-transparent bg-slate-900 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-slate-800 transition-all hover:shadow-lg">
                      Checkout
                    </a>
                  </div>
                  <div class="mt-6 flex justify-center text-center text-sm text-slate-500">
                    <p>
                      or 
                      <button @click="cartStore.toggleCart" type="button" class="font-medium text-violet-600 hover:text-violet-500">
                        Continue Shopping
                        <span aria-hidden="true"> &rarr;</span>
                      </button>
                    </p>
                  </div>
                </div>

              </div>
            </div>
          </Transition>
        </div>
      </div>
    </div>
  </div>
</template>