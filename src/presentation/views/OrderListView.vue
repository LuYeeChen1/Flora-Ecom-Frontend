<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { OrderRepository, type Order } from '../../infrastructure/repositories/OrderRepository';

const orderRepo = new OrderRepository();
const orders = ref<Order[]>([]);
const isLoading = ref(true);

// 格式化日期 (例如: 15 January 2026, 09:30 AM)
const formatDate = (dateString: string) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-MY', {
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });
};

// 格式化价格
const formatPrice = (val: number) => val.toFixed(2);

// 状态颜色映射
const getStatusColor = (status: string) => {
  switch (status) {
    case 'PAID': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'PENDING': return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'SHIPPED': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'CANCELLED': return 'bg-slate-100 text-slate-500 border-slate-200';
    default: return 'bg-slate-50 text-slate-600 border-slate-200';
  }
};

onMounted(async () => {
  try {
    orders.value = await orderRepo.getMyOrders();
  } catch (err) {
    console.error("Failed to load orders:", err);
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <div class="min-h-screen bg-slate-50 font-serif pb-20">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-bold text-slate-900 font-serif">My Orders</h1>
        <router-link to="/" class="text-sm text-violet-600 hover:underline font-sans">
          &larr; Continue Shopping
        </router-link>
      </div>

      <div v-if="isLoading" class="flex justify-center py-20">
        <div class="animate-spin text-3xl text-violet-600">❄️</div>
      </div>

      <div v-else-if="orders.length === 0" class="text-center py-20 bg-white rounded-xl border border-slate-100 shadow-sm">
        <div class="text-6xl mb-4">📦</div>
        <h2 class="text-xl font-medium text-slate-900 mb-2">No orders yet</h2>
        <p class="text-slate-500 mb-6">Discover our beautiful collection and place your first order.</p>
        <router-link to="/" class="inline-flex items-center px-6 py-2 bg-slate-900 text-white rounded-full hover:bg-slate-800 transition-colors">
          Browse Flowers
        </router-link>
      </div>

      <div v-else class="space-y-6">
        <div 
          v-for="order in orders" 
          :key="order.id" 
          class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow duration-300"
        >
          <div class="bg-slate-50/80 px-6 py-4 border-b border-slate-100 flex flex-wrap gap-4 justify-between items-center">
            <div class="flex gap-6 text-sm">
              <div>
                <p class="text-xs text-slate-500 uppercase tracking-wider font-semibold">Order Placed</p>
                <p class="font-medium text-slate-900 mt-0.5">{{ formatDate(order.createdAt) }}</p>
              </div>
              <div>
                <p class="text-xs text-slate-500 uppercase tracking-wider font-semibold">Order ID</p>
                <p class="font-medium text-slate-900 mt-0.5">#{{ order.id }}</p>
              </div>
            </div>
            
            <div class="flex items-center gap-4">
               <div class="text-right">
                <p class="text-xs text-slate-500 uppercase tracking-wider font-semibold">Total Amount</p>
                <p class="font-bold text-slate-900 mt-0.5 text-lg">RM {{ formatPrice(order.totalPrice) }}</p>
              </div>
              <span :class="['px-3 py-1 rounded-full text-xs font-bold border', getStatusColor(order.status)]">
                {{ order.status }}
              </span>
            </div>
          </div>

          <div class="px-6 py-4">
            <div class="space-y-4">
              <div v-for="item in order.items" :key="item.id" class="flex justify-between items-center group">
                <div class="flex items-center gap-4">
                  <div class="h-12 w-12 rounded bg-violet-50 text-violet-400 flex items-center justify-center text-xl border border-violet-100">
                    🌸
                  </div>
                  <div>
                    <p class="text-sm font-bold text-slate-900 group-hover:text-violet-700 transition-colors">{{ item.flowerName }}</p>
                    <p class="text-xs text-slate-500">Qty: {{ item.quantity }} &times; RM {{ formatPrice(item.priceAtPurchase) }}</p>
                  </div>
                </div>
                <p class="text-sm font-medium text-slate-700">RM {{ formatPrice(item.priceAtPurchase * item.quantity) }}</p>
              </div>
            </div>
            
            <div class="mt-6 pt-4 border-t border-slate-100 flex justify-between items-start text-xs text-slate-500">
              <div class="flex gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
                </svg>
                <div>
                  <span class="font-semibold text-slate-700">Shipping Address:</span>
                  <p class="mt-0.5 max-w-md">{{ order.shippingAddress }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>