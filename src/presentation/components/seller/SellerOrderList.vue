<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

// 接收订单数据
defineProps<{
  orders: any[]
}>();

// 定义操作事件
const emit = defineEmits<{
  (e: 'ship', orderId: number): void;
  (e: 'deliver', orderId: number): void;
  (e: 'audit', orderId: number, approved: boolean): void;
}>();

// 日期格式化
const formatDate = (str: string) => new Date(str).toLocaleDateString('en-MY', {
  year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
});

// 跳转详情页逻辑
const handleViewDetail = (orderId: number) => {
  router.push(`/seller/orders/${orderId}`);
};
</script>

<template>
  <div class="space-y-6">
    <div v-if="orders.length === 0" class="text-center py-16 bg-white rounded-xl border border-slate-200">
      <div class="text-4xl mb-4">📭</div>
      <p class="text-slate-500">No orders yet.</p>
    </div>

    <div v-for="order in orders" :key="order.orderId" class="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      
      <div class="bg-slate-50/80 px-6 py-4 flex flex-wrap justify-between items-center border-b border-slate-100 gap-4">
        <div class="text-sm flex items-center gap-4">
          <span class="font-bold text-slate-900">#{{ order.orderId }}</span>
          <span class="text-slate-300">|</span>
          <span class="text-slate-500">{{ formatDate(order.createdAt) }}</span>
          <span class="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ml-2 flex items-center gap-1">
            👤 {{ order.buyerName }}
          </span>
        </div>
        
        <div class="flex items-center gap-3">
           <span :class="{
             'bg-green-100 text-green-700 border-green-200': order.status === 'DELIVERED', 
             'bg-blue-100 text-blue-700 border-blue-200': order.status === 'SHIPPED', 
             'bg-yellow-100 text-yellow-700 border-yellow-200': order.status === 'PAID' || order.status === 'PENDING_PAYMENT',
             'bg-rose-100 text-rose-700 border-rose-200': order.status === 'CANCELLATION_REQUESTED',
             'bg-slate-100 text-slate-400 border-slate-200': order.status === 'CANCELLED'
           }" class="px-3 py-1 rounded-full text-xs font-bold border uppercase">
             {{ order.status.replace('_', ' ') }}
           </span>
           
           <button 
             @click="handleViewDetail(order.orderId)"
             class="text-xs font-bold text-slate-600 hover:text-purple-700 underline flex items-center gap-1 ml-2"
           >
             View Detail <span>→</span>
           </button>
        </div>
      </div>

      <div class="p-6 flex flex-col lg:flex-row gap-8">
        
        <div class="flex-1 space-y-4">
           <div v-for="(item, index) in order.items.slice(0, 2)" :key="index" class="flex items-start gap-4">
              <img :src="item.imageUrl" class="w-16 h-16 rounded-lg object-cover border border-slate-100" />
              <div>
                <p class="font-bold text-slate-800 font-serif">{{ item.flowerName }}</p>
                <p class="text-sm text-slate-500 mt-1">Qty: {{ item.quantity }} &times; RM {{ item.price }}</p>
              </div>
           </div>
           <p v-if="order.items.length > 2" class="text-xs text-slate-400 italic pl-2">...and {{ order.items.length - 2 }} more items.</p>
        </div>

        <div class="lg:w-1/3 lg:border-l lg:border-slate-100 lg:pl-8 flex flex-col justify-between">
           <div class="space-y-4">
             <div>
                <h4 class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Shipping To</h4>
                <p class="text-sm text-slate-600 truncate">{{ order.shippingAddress }}</p>
             </div>

             <div class="pt-4 border-t border-slate-50 space-y-3">
               <button v-if="order.status === 'PAID'" @click="emit('ship', order.orderId)" class="w-full bg-blue-900 text-white py-2.5 rounded-lg hover:bg-blue-800 font-bold text-sm shadow-md transition-all">
                 🚢 Ship Order
               </button>
               
               <div v-else-if="order.status === 'CANCELLATION_REQUESTED'" class="bg-rose-50 p-3 rounded-lg border border-rose-100 text-center">
                  <p class="text-rose-800 font-bold text-xs mb-2">⚠️ Cancellation Requested</p>
                  <div class="grid grid-cols-2 gap-2">
                     <button @click="emit('audit', order.orderId, false)" class="bg-white text-slate-600 border border-slate-300 py-1.5 rounded text-xs font-bold hover:bg-slate-50">Reject</button>
                     <button @click="emit('audit', order.orderId, true)" class="bg-rose-600 text-white py-1.5 rounded text-xs font-bold hover:bg-rose-700 shadow-sm">Approve</button>
                  </div>
               </div>

               <button v-else-if="order.status === 'SHIPPED'" @click="emit('deliver', order.orderId)" class="w-full bg-green-600 text-white py-2.5 rounded-lg hover:bg-green-700 font-bold text-sm shadow-md transition-all">
                 ✅ Mark Delivered
               </button>
               
               <div v-else-if="order.status === 'DELIVERED'" class="text-center text-xs text-slate-400 font-bold py-2 bg-slate-50 rounded">Order Completed</div>
               <div v-else-if="order.status === 'CANCELLED'" class="text-center text-xs text-slate-400 font-bold py-2 bg-slate-50 rounded">Order Cancelled</div>
             </div>
           </div>
        </div>
      </div>
    </div>
  </div>
</template>