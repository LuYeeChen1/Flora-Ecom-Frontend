<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import apiClient from '../../infrastructure/api/apiClient';
import { SellerFlowerRepository, type FlowerData } from '../../infrastructure/repositories/SellerFlowerRepository';
import { useAuthStore } from '../store/authStore';

import FlowerModal from '../components/seller/FlowerModal.vue';
import SellerInventory from '../components/seller/SellerInventory.vue';
import SellerOrderList from '../components/seller/SellerOrderList.vue';

const router = useRouter();
const authStore = useAuthStore();
const repo = new SellerFlowerRepository();

const activeTab = ref<'inventory' | 'orders'>('inventory');
const isLoading = ref(false);
const myFlowers = ref<any[]>([]);
const myOrders = ref<any[]>([]);

const showModal = ref(false);
const isEditMode = ref(false);
const editingId = ref<number | null>(null);
const currentFlowerData = ref<FlowerData | undefined>(undefined);

const loadAllData = async () => {
  if (!authStore.token) return;
  try {
    isLoading.value = true;
    const [flowers, orders] = await Promise.all([
      repo.getMyInventory(),
      repo.getIncomingOrders()
    ]);
    myFlowers.value = flowers;
    myOrders.value = orders;
  } catch (error: any) {
    console.error("Data load failed", error);
    if (error.response?.status === 403) {
      alert("⚠️ Access Denied: Please re-login.");
      authStore.logout();
      router.push('/login');
    }
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => loadAllData());

const stats = computed(() => {
  const totalRevenue = myOrders.value.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
  const pendingOrders = myOrders.value.filter(o => o.status === 'PAID').length;
  return [
    { title: 'Total Flowers', value: myFlowers.value.length.toString(), icon: '🌸', color: 'bg-purple-100 text-purple-600' },
    { title: 'Pending Orders', value: pendingOrders.toString(), icon: '📦', color: 'bg-blue-100 text-blue-600' },
    { title: 'Revenue', value: `RM ${totalRevenue.toFixed(0)}`, icon: '💰', color: 'bg-green-100 text-green-600' },
    { title: 'Rating', value: '5.0', icon: '⭐', color: 'bg-yellow-100 text-yellow-600' },
  ];
});

const openAddModal = () => {
  isEditMode.value = false;
  editingId.value = null;
  currentFlowerData.value = undefined;
  showModal.value = true;
};

const openEditModal = (flower: any) => {
  isEditMode.value = true;
  editingId.value = flower.id;
  currentFlowerData.value = { ...flower, price: Number(flower.price) };
  showModal.value = true;
};

const handleDeleteFlower = async (id: number) => {
  if (!confirm("Delete this flower? Operations cannot be undone.")) return;
  try { await repo.deleteFlower(id); await loadAllData(); } catch (err) { alert("Delete failed."); }
};

const handleModalSubmit = async ({ form, file }: { form: FlowerData, file: File | null }) => {
  try {
    let finalKey = form.imageUrl;
    if (file) {
      const { uploadUrl, key } = await repo.getUploadUrl(file.type, file.name);
      await repo.uploadToS3(uploadUrl, file);
      finalKey = key;
    } else if (!isEditMode.value) {
      alert("Image is required."); return;
    }
    
    const payload = { ...form, imageUrl: finalKey };
    if (isEditMode.value && editingId.value) {
      await repo.updateFlower(editingId.value, payload);
    } else {
      await repo.createFlower(payload);
    }
    showModal.value = false;
    await loadAllData();
  } catch (err: any) {
    alert("Error: " + (err.response?.data?.message || "Failed"));
  }
};

const handleShipItems = async (orderId: number) => {
  if (!confirm(`Confirm shipping for Order #${orderId}?`)) return;
  try {
    await repo.shipOrder(orderId);
    await loadAllData();
    alert("✅ Items marked as shipped!");
  } catch (err: any) {
    alert("Failed: " + err.response?.data?.error);
  }
};

const handleDeliverOrder = async (orderId: number) => {
  if (!confirm(`Mark Order #${orderId} as Delivered?`)) return;
  try {
    await repo.updateOrderStatus(orderId, 'DELIVERED');
    await loadAllData();
  } catch (err: any) {
    alert("Failed: " + err.response?.data?.error);
  }
};

// ✅ [修复] 移除路径中的 /api 前缀
const handleAudit = async (orderId: number, approved: boolean) => {
  const actionText = approved ? "APPROVE" : "REJECT";
  if (!confirm(`Are you sure you want to ${actionText}?`)) return;
  try {
    // 修正：从 '/api/seller/...' 改为 '/seller/...'
    await apiClient.post(`/seller/orders/${orderId}/audit-cancel`, { approved });
    alert("✅ Processed successfully!");
    await loadAllData();
  } catch (err: any) {
    alert("Failed: " + (err.response?.data?.message || "Error"));
  }
};
</script>

<template>
  <div class="min-h-screen bg-slate-50 flex font-serif">
    
    <aside class="w-64 bg-slate-900 text-slate-300 flex flex-col fixed left-0 top-20 h-[calc(100vh-5rem)] shadow-2xl z-20">
      <div class="p-8 border-b border-slate-800">
        <h1 class="text-xl text-white font-italic tracking-widest">Merchant Center</h1>
      </div>
      <nav class="flex-1 p-4 space-y-2">
        <button @click="activeTab = 'inventory'" :class="activeTab === 'inventory' ? 'bg-purple-600/20 text-purple-300 border-purple-500/30' : 'hover:bg-white/5 hover:text-white border-transparent'" class="flex w-full items-center gap-3 px-4 py-3 rounded-lg border transition-all"><span>🌸</span> Inventory</button>
        <button @click="activeTab = 'orders'" :class="activeTab === 'orders' ? 'bg-purple-600/20 text-purple-300 border-purple-500/30' : 'hover:bg-white/5 hover:text-white border-transparent'" class="flex w-full items-center gap-3 px-4 py-3 rounded-lg border transition-all"><span>📦</span> Orders</button>
      </nav>
      <div class="p-4 border-t border-slate-800">
        <button @click="router.push('/profile')" class="flex items-center gap-3 px-4 py-3 w-full hover:bg-white/5 text-slate-400 hover:text-white"><span>←</span> Back to Profile</button>
      </div>
    </aside>

    <main class="flex-1 ml-64 p-8">
      <header class="flex justify-between items-center mb-10">
        <h2 class="text-3xl text-slate-800 font-serif">{{ activeTab === 'inventory' ? 'My Garden' : 'Incoming Orders' }}</h2>
        <button v-if="activeTab === 'inventory'" @click="openAddModal" class="bg-slate-900 text-white px-6 py-2.5 rounded-lg hover:bg-slate-800 shadow-lg flex items-center gap-2"><span>+</span> Add New Flower</button>
      </header>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div v-for="stat in stats" :key="stat.title" class="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
           <p class="text-xs text-slate-400 font-bold uppercase">{{ stat.title }}</p>
           <h3 class="text-2xl font-bold text-slate-800 mt-2">{{ stat.value }}</h3>
        </div>
      </div>

      <div v-if="isLoading" class="text-center py-20">
        <div class="animate-spin text-3xl mb-2 text-purple-600">❄️</div>
        <p class="text-slate-500">Loading Dashboard...</p>
      </div>

      <template v-else>
        <SellerInventory 
          v-if="activeTab === 'inventory'"
          :flowers="myFlowers"
          @edit="openEditModal"
          @delete="handleDeleteFlower"
          @add="openAddModal"
        />

        <SellerOrderList 
          v-else-if="activeTab === 'orders'"
          :orders="myOrders"
          @ship="handleShipItems"
          @deliver="handleDeliverOrder"
          @audit="handleAudit"
        />
      </template>
    </main>

    <FlowerModal 
      :show="showModal"
      :edit-mode="isEditMode"
      :initial-data="currentFlowerData"
      @close="showModal = false"
      @submit="handleModalSubmit"
    />
  </div>
</template>