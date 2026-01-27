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
    // ✅ [修复] 修正路径
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
    // ✅ [修复] 修正路径
    await apiClient.patch(`/seller/orders/${orderId}/ship`);
    alert('Shipped!');
    const res = await apiClient.get(`/seller/orders/${orderId}`);
    order.value = res.data;
  } catch (err) { alert('Failed to ship'); }
};

const handleAudit = async (approved: boolean) => {
  const action = approved ? 'APPROVE' : 'REJECT';
  if (!confirm(`Confirm ${action}?`)) return;
  try {
    // ✅ [修复] 修正路径
    await apiClient.post(`/seller/orders/${orderId}/audit-cancel`, { approved });
    alert('Processed!');
    const res = await apiClient.get(`/seller/orders/${orderId}`);
    order.value = res.data;
  } catch (err) { alert('Failed to process'); }
};

const formatPrice = (val: number) => Number(val).toFixed(2);
const formatDate = (str: string) => new Date(str).toLocaleDateString('en-MY', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
</script>

<template>
  <div class="min-h-screen bg-slate-50 font-serif p-8">
    <button @click="router.back()" class="mb-6 flex items-center text-slate-500 hover:text-slate-800 font-bold text-sm">
      ← Back to Dashboard
    </button>

    <div v-if="isLoading" class="text-center py-20">Loading...</div>
    <div v-else-if="error" class="text-center py-20 text-rose-500 font-bold">{{ error }}</div>

    <div v-else class="max-w-5xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div class="bg-slate-900 text-white px-8 py-6 flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold">Order #{{ order.orderId }}</h1>
          <p class="text-slate-400 text-sm mt-1">Placed on {{ formatDate(order.createdAt) }}</p>
        </div>
        <div class="px-4 py-2 bg-white/10 rounded-lg border border-white/20 backdrop-blur-sm font-bold tracking-wide">
          {{ order.status }}
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3">
        <div class="lg:col-span-2 p-8 border-r border-slate-100">
          <h3 class="text-lg font-bold text-slate-800 mb-6 border-b pb-2">Order Items</h3>
          <div class="space-y-6">
            <div v-for="(item, idx) in order.items" :key="idx" class="flex gap-6 items-center">
              <img :src="item.imageUrl" class="w-20 h-20 rounded-lg object-cover border border-slate-200" />
              <div class="flex-1">
                <h4 class="font-bold text-slate-800 text-lg">{{ item.flowerName }}</h4>
                <p class="text-slate-500">Unit Price: RM {{ formatPrice(item.price) }}</p>
              </div>
              <div class="text-right">
                <p class="text-xs text-slate-400 uppercase font-bold">Quantity</p>
                <p class="text-xl font-bold text-slate-800">x {{ item.quantity }}</p>
              </div>
              <div class="text-right w-24">
                <p class="text-xs text-slate-400 uppercase font-bold">Total</p>
                <p class="text-xl font-bold text-emerald-600">RM {{ formatPrice(item.price * item.quantity) }}</p>
              </div>
            </div>
          </div>
          
          <div class="mt-8 pt-8 border-t flex justify-between items-center">
            <span class="font-bold text-slate-500">Total Revenue from this Order</span>
            <span class="text-3xl font-bold text-slate-900">RM {{ formatPrice(order.totalPrice) }}</span>
          </div>
        </div>

        <div class="p-8 bg-slate-50">
          <div class="space-y-8">
            <div>
              <h4 class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Customer Details</h4>
              <p class="font-bold text-slate-800">{{ order.buyerName }}</p>
              <p class="text-sm text-slate-600 mt-1">{{ order.buyerEmail }}</p>
              <p class="text-sm text-slate-600">{{ order.buyerPhone }}</p>
            </div>

            <div>
              <h4 class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Shipping Address</h4>
              <p class="text-sm text-slate-700 leading-relaxed bg-white p-4 rounded border border-slate-200">
                {{ order.shippingAddress }}
              </p>
            </div>

            <div class="pt-6 border-t border-slate-200">
              <h4 class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Actions</h4>
              
              <button v-if="order.status === 'PAID'" @click="handleShip" class="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 shadow-lg mb-3">
                Ship Order
              </button>

              <div v-if="order.status === 'CANCELLATION_REQUESTED'" class="grid grid-cols-2 gap-3">
                <button @click="handleAudit(false)" class="bg-white border border-slate-300 py-3 rounded-lg font-bold text-slate-600 hover:bg-slate-50">Reject Cancel</button>
                <button @click="handleAudit(true)" class="bg-rose-600 text-white py-3 rounded-lg font-bold hover:bg-rose-700 shadow-lg">Approve Cancel</button>
              </div>

              <div v-if="order.status === 'SHIPPED'" class="text-center p-4 bg-blue-50 text-blue-700 rounded-lg text-sm font-bold">
                Item is on the way.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>