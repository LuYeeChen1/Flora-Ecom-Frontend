<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import apiClient from '../../infrastructure/api/apiClient';
import { OrderRepository, type Order } from '../../infrastructure/repositories/OrderRepository';

const router = useRouter();
const orderRepo = new OrderRepository();
const orders = ref<Order[]>([]);
const isLoading = ref(true);

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-MY', {
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });
};

const formatPrice = (val: number) => val.toFixed(2);

const getStatusColor = (status: string) => {
  switch (status) {
    case 'PAID': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'PENDING': return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'SHIPPED': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'DELIVERED': return 'bg-green-100 text-green-800 border-green-200';
    case 'CANCELLATION_REQUESTED': return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'CANCELLED': return 'bg-slate-100 text-slate-500 border-slate-200';
    default: return 'bg-slate-50 text-slate-600 border-slate-200';
  }
};

const hasHistoryToClear = computed(() => {
  return orders.value.some(o => o.status === 'DELIVERED' || o.status === 'CANCELLED');
});

const loadOrders = async () => {
  isLoading.value = true;
  try {
    orders.value = await orderRepo.getMyOrders();
  } catch (err) {
    console.error("Failed to load orders:", err);
  } finally {
    isLoading.value = false;
  }
};

const handleRequestCancel = async (orderId: number) => {
  if (!confirm("⚠️ Request cancellation for this order?")) return;
  try {
    await apiClient.post(`/orders/${orderId}/cancel-request`);
    alert("✅ Cancellation requested.");
    await loadOrders(); 
  } catch (err: any) {
    alert("Failed: " + (err.response?.data?.message || "Error"));
  }
};

// ✅ [新增] 删除单个历史
const handleDeleteHistory = async (orderId: number) => {
  if (!confirm("🗑️ Remove this order from your history?")) return;
  try {
    await apiClient.delete(`/orders/${orderId}`);
    await loadOrders(); 
  } catch (err: any) {
    alert("Failed: " + (err.response?.data?.message || "Error"));
  }
};

// ✅ [新增] 一键清空
const handleClearHistory = async () => {
  if (!confirm("🗑️ Clear ALL completed and cancelled orders from history?")) return;
  try {
    await apiClient.delete(`/orders/history`);
    await loadOrders();
  } catch (err: any) {
    alert("Failed: " + (err.response?.data?.message || "Error"));
  }
};

onMounted(() => {
  loadOrders();
});
</script>

<template>
  <div class="min-h-screen bg-slate-50 font-serif pb-20">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-bold text-slate-900 font-serif">My Orders</h1>
        
        <div class="flex gap-4">
          <button 
            v-if="hasHistoryToClear"
            @click="handleClearHistory"
            class="text-xs font-bold text-slate-500 hover:text-rose-600 transition-colors flex items-center gap-1"
          >
            🗑️ Clear History
          </button>
          
          <router-link to="/" class="text-sm text-violet-600 hover:underline font-sans">
            &larr; Continue Shopping
          </router-link>
        </div>
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
                {{ order.status.replace('_', ' ') }}
              </span>
              
              <button 
                v-if="order.status === 'DELIVERED' || order.status === 'CANCELLED'"
                @click="handleDeleteHistory(order.id)"
                class="ml-2 text-slate-400 hover:text-rose-500 transition-colors p-1"
                title="Remove from history"
              >
                🗑️
              </button>
            </div>
          </div>

          <div class="px-6 py-4">
            <div class="space-y-4">
              <div v-for="item in order.items" :key="item.id" class="flex justify-between items-center group">
                <div class="flex items-center gap-4">
                  <div class="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-slate-200">
                    <img v-if="item.imageUrl" :src="item.imageUrl" class="h-full w-full object-cover object-center" />
                    <div v-else class="h-full w-full bg-slate-100 flex items-center justify-center text-slate-400">🌸</div>
                  </div>
                  <div>
                    <p class="text-sm font-bold text-slate-900 group-hover:text-violet-700 transition-colors">{{ item.flowerName }}</p>
                    <p class="text-xs text-slate-500 mt-1">Qty: {{ item.quantity }} &times; RM {{ formatPrice(item.priceAtPurchase) }}</p>
                  </div>
                </div>
                <p class="text-sm font-medium text-slate-700">RM {{ formatPrice(item.priceAtPurchase * item.quantity) }}</p>
              </div>
            </div>
            
            <div class="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center">
              <div class="flex gap-2 items-center text-xs text-slate-500">
                <span class="font-semibold text-slate-700">Ship To:</span>
                <span class="truncate max-w-xs">{{ order.shippingAddress }}</span>
              </div>

              <button 
                v-if="order.status === 'PAID'"
                @click="handleRequestCancel(order.id)"
                class="text-xs font-bold text-rose-600 border border-rose-200 bg-rose-50 px-4 py-2 rounded-lg hover:bg-rose-100 transition-colors"
              >
                Request Cancellation
              </button>
              
              <div v-else-if="order.status === 'CANCELLATION_REQUESTED'" class="text-xs font-medium text-orange-600 flex items-center gap-1">
                 ⏳ Waiting for seller approval
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>