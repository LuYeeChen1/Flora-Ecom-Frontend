<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import apiClient from '../../infrastructure/api/apiClient';

const route = useRoute();
const router = useRouter();
const order = ref<any>(null);
const isLoading = ref(true);
const error = ref('');

const orderId = route.params.id;

// 加载详情
onMounted(async () => {
  try {
    // ✅ [修复] 去掉开头的 /api，防止变成 /api/api/...
    const res = await apiClient.get(`/seller/orders/${orderId}`);
    order.value = res.data;
  } catch (err: any) {
    error.value = "Failed to load order details.";
    console.error(err);
  } finally {
    isLoading.value = false;
  }
});

// 操作逻辑复用
const handleShip = async () => {
  if (!confirm('Confirm shipping?')) return;
  try {
    // ✅ [修复] 路径修正
    await apiClient.patch(`/seller/orders/${orderId}/ship`);
    alert('Shipped!');
    // 重新加载数据而不是刷新页面，体验更好
    const res = await apiClient.get(`/seller/orders/${orderId}`);
    order.value = res.data;
  } catch (err) { 
    alert('Failed to ship'); 
  }
};

const handleAudit = async (approved: boolean) => {
  const action = approved ? 'APPROVE' : 'REJECT';
  if (!confirm(`Confirm ${action}?`)) return;
  try {
    // ✅ [修复] 路径修正
    await apiClient.post(`/seller/orders/${orderId}/audit-cancel`, { approved });
    alert('Processed!');
    const res = await apiClient.get(`/seller/orders/${orderId}`);
    order.value = res.data;
  } catch (err) { 
    alert('Failed to process'); 
  }
};

const formatPrice = (val: number) => Number(val).toFixed(2);
const formatDate = (str: string) => new Date(str).toLocaleDateString('en-MY', { 
  year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' 
});
</script>

<template>
  <div class="min-h-screen bg-slate-50 font-serif p-8">
    <button @click="router.back()" class="mb-6 flex items-center text-slate-500 hover:text-slate-800 font-bold text-sm transition-colors">
      <span>&larr;</span> <span class="ml-2">Back to Dashboard</span>
    </button>

    <div v-if="isLoading" class="flex justify-center py-20">
      <div class="animate-spin text-3xl text-purple-600">❄️</div>
    </div>

    <div v-else-if="error" class="text-center py-20 bg-white rounded-xl shadow-sm">
      <div class="text-rose-500 font-bold mb-2">⚠️ Error</div>
      <p class="text-slate-600">{{ error }}</p>
    </div>

    <div v-else class="max-w-5xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      
      <div class="bg-slate-900 text-white px-8 py-6 flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold flex items-center gap-3">
            Order #{{ order.orderId }}
            <span v-if="order.status === 'CANCELLATION_REQUESTED'" class="text-xs bg-rose-500 text-white px-2 py-1 rounded">Action Needed</span>
          </h1>
          <p class="text-slate-400 text-sm mt-1">Placed on {{ formatDate(order.createdAt) }}</p>
        </div>
        <div class="flex flex-col items-end">
           <span class="text-xs text-slate-400 uppercase tracking-wider mb-1">Status</span>
           <div class="px-4 py-1.5 bg-white/10 rounded-lg border border-white/20 backdrop-blur-sm font-bold tracking-wide text-sm">
             {{ order.status }}
           </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3">
        
        <div class="lg:col-span-2 p-8 border-r border-slate-100">
          <h3 class="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-100 pb-2">Order Items</h3>
          <div class="space-y-6">
            <div v-for="(item, idx) in order.items" :key="idx" class="flex gap-6 items-start">
              <div class="w-20 h-20 rounded-lg overflow-hidden border border-slate-200 shrink-0">
                 <img :src="item.imageUrl" class="w-full h-full object-cover" />
              </div>
              <div class="flex-1">
                <h4 class="font-bold text-slate-800 text-lg font-serif">{{ item.flowerName }}</h4>
                <p class="text-slate-500 text-sm mt-1">Unit Price: RM {{ formatPrice(item.price) }}</p>
              </div>
              <div class="text-right">
                <p class="text-xs text-slate-400 uppercase font-bold mb-1">Qty</p>
                <p class="text-xl font-bold text-slate-800">x {{ item.quantity }}</p>
              </div>
              <div class="text-right w-24">
                <p class="text-xs text-slate-400 uppercase font-bold mb-1">Subtotal</p>
                <p class="text-xl font-bold text-emerald-600">RM {{ formatPrice(item.price * item.quantity) }}</p>
              </div>
            </div>
          </div>
          
          <div class="mt-8 pt-8 border-t border-slate-100 flex justify-between items-center">
            <span class="font-bold text-slate-500 text-sm">Total Revenue from this Order</span>
            <span class="text-3xl font-bold text-slate-900 font-serif">RM {{ formatPrice(order.totalPrice) }}</span>
          </div>
        </div>

        <div class="p-8 bg-slate-50">
          <div class="space-y-8">
            
            <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <h4 class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <span>👤</span> Customer
              </h4>
              <p class="font-bold text-slate-800 text-lg">{{ order.buyerName }}</p>
              <div class="mt-3 space-y-1 text-sm text-slate-600">
                 <p class="flex items-center gap-2"><span class="text-slate-400">✉️</span> {{ order.buyerEmail }}</p>
                 <p class="flex items-center gap-2"><span class="text-slate-400">📞</span> {{ order.buyerPhone }}</p>
              </div>
            </div>

            <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <h4 class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <span>📍</span> Shipping Address
              </h4>
              <p class="text-sm text-slate-700 leading-relaxed">
                {{ order.shippingAddress }}
              </p>
            </div>

            <div class="pt-6 border-t border-slate-200">
              <h4 class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Quick Actions</h4>
              
              <div v-if="order.status === 'PAID'">
                 <button @click="handleShip" class="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all mb-3 flex justify-center items-center gap-2">
                   <span>🚢</span> Ship Order
                 </button>
                 <p class="text-xs text-slate-400 text-center">Mark items as packed and shipped.</p>
              </div>

              <div v-else-if="order.status === 'CANCELLATION_REQUESTED'" class="bg-rose-50 p-4 rounded-xl border border-rose-100">
                <p class="text-rose-800 text-xs font-bold mb-3 text-center">Buyer requested cancellation</p>
                <div class="grid grid-cols-2 gap-3">
                  <button @click="handleAudit(false)" class="bg-white border border-slate-300 py-2.5 rounded-lg font-bold text-slate-600 hover:bg-slate-50 text-xs">Reject</button>
                  <button @click="handleAudit(true)" class="bg-rose-600 text-white py-2.5 rounded-lg font-bold hover:bg-rose-700 shadow-md text-xs">Approve</button>
                </div>
              </div>

              <div v-else-if="order.status === 'SHIPPED'" class="text-center p-4 bg-blue-50 text-blue-700 rounded-lg text-sm font-bold border border-blue-100">
                🚀 Item is on the way.
              </div>
              
              <div v-else-if="order.status === 'DELIVERED'" class="text-center p-4 bg-green-50 text-green-700 rounded-lg text-sm font-bold border border-green-100">
                ✅ Order Completed.
              </div>
              
              <div v-else-if="order.status === 'CANCELLED'" class="text-center p-4 bg-slate-100 text-slate-500 rounded-lg text-sm font-bold border border-slate-200">
                🚫 Order Cancelled.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>