<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { SellerFlowerRepository } from '../../infrastructure/repositories/SellerFlowerRepository';

const repo = new SellerFlowerRepository();
const orders = ref<any[]>([]);
const isLoading = ref(true);

const formatDate = (str: string) => new Date(str).toLocaleDateString();

const loadOrders = async () => {
  isLoading.value = true;
  try {
    orders.value = await repo.getIncomingOrders();
  } catch (err) {
    console.error(err);
  } finally {
    isLoading.value = false;
  }
};

const handleShip = async (orderId: number) => {
  if(!confirm("Mark this order as Shipped?")) return;
  await repo.shipOrder(orderId);
  await loadOrders(); // 刷新状态
};

onMounted(() => loadOrders());
</script>

<template>
  <div class="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
    <h2 class="text-2xl font-bold text-slate-800 mb-6">Incoming Orders</h2>

    <div v-if="isLoading" class="text-center py-10">Loading...</div>
    <div v-else-if="orders.length === 0" class="text-center py-10 text-slate-500">No orders yet.</div>

    <div v-else class="space-y-6">
      <div v-for="order in orders" :key="order.orderId" class="border border-slate-200 rounded-lg overflow-hidden">
        <div class="bg-slate-50 px-6 py-3 flex justify-between items-center border-b border-slate-200">
          <div class="text-sm text-slate-600">
            <span class="font-bold">Order #{{ order.orderId }}</span> • {{ formatDate(order.createdAt) }}
            <span class="mx-2">|</span> 
            Buyer: <span class="font-medium text-slate-900">{{ order.buyerName || 'Guest' }}</span>
          </div>
          <div>
             <span :class="{'bg-green-100 text-green-700': order.status==='SHIPPED', 'bg-yellow-100 text-yellow-700': order.status==='PAID'}" class="px-3 py-1 rounded-full text-xs font-bold">
               {{ order.status }}
             </span>
          </div>
        </div>

        <div class="p-6">
          <div class="flex flex-col md:flex-row gap-6">
            <div class="flex-1 space-y-4">
               <div v-for="item in order.items" :key="item.flowerName" class="flex items-center gap-4">
                  <img :src="item.imageUrl" class="w-12 h-12 rounded object-cover border border-slate-100"/>
                  <div>
                    <p class="font-bold text-slate-800">{{ item.flowerName }}</p>
                    <p class="text-xs text-slate-500">Qty: {{ item.quantity }} x RM {{ item.price }}</p>
                  </div>
               </div>
            </div>

            <div class="md:w-1/3 border-l border-slate-100 md:pl-6">
               <h4 class="text-xs font-bold text-slate-400 uppercase mb-2">Shipping Address</h4>
               <p class="text-sm text-slate-600 mb-6">{{ order.shippingAddress }}</p>
               
               <button 
                 v-if="order.status === 'PAID'"
                 @click="handleShip(order.orderId)"
                 class="w-full bg-slate-900 text-white py-2 rounded hover:bg-slate-700 transition-colors text-sm font-bold"
               >
                 Mark as Shipped
               </button>
               <button v-else disabled class="w-full bg-slate-100 text-slate-400 py-2 rounded cursor-not-allowed text-sm">
                 {{ order.status }}
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>