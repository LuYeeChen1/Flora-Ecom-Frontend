<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { SellerFlowerRepository, type FlowerData } from '../../infrastructure/repositories/SellerFlowerRepository';
import { useAuthStore } from '../store/authStore';

const router = useRouter();
const authStore = useAuthStore();
const repo = new SellerFlowerRepository();

// --- 状态管理 ---
const activeTab = ref<'inventory' | 'orders'>('inventory');
const isLoading = ref(false);
const isSubmitting = ref(false);

// 数据源
const myFlowers = ref<any[]>([]);
const myOrders = ref<any[]>([]);

// 弹窗状态
const showModal = ref(false);
const isEditMode = ref(false);
const editingId = ref<number | null>(null);
const previewImage = ref<string | null>(null);
const selectedFile = ref<File | null>(null);

// 表单数据
const form = reactive<FlowerData>({
  name: '', description: '', price: 0, stock: 1, category: 'ROMANCE', imageUrl: ''
});

// --- 核心数据加载 ---
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
    }
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => loadAllData());

// --- 计算属性：实时统计 ---
const stats = computed(() => {
  const totalRevenue = myOrders.value.reduce((sum, order) => {
    // 简单计算总收入，如果后端直接返回总价更好，这里假设前端计算
    return sum + (order.totalPrice || 0); 
  }, 0);

  const pendingOrders = myOrders.value.filter(o => o.status === 'PAID').length;

  return [
    { title: 'Total Flowers', value: myFlowers.value.length.toString(), icon: '🌸', color: 'bg-purple-100 text-purple-600' },
    { title: 'Pending Orders', value: pendingOrders.toString(), icon: '📦', color: 'bg-blue-100 text-blue-600' },
    { title: 'Revenue', value: `RM ${totalRevenue.toFixed(0)}`, icon: '💰', color: 'bg-green-100 text-green-600' },
    { title: 'Rating', value: '5.0', icon: '⭐', color: 'bg-yellow-100 text-yellow-600' },
  ];
});

// --- 库存管理逻辑 ---
const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    const file = target.files[0];
    if (file.size > 5 * 1024 * 1024) { alert("File too large (Max 5MB)"); return; }
    selectedFile.value = file;
    previewImage.value = URL.createObjectURL(file);
  }
};

const openAddModal = () => {
  isEditMode.value = false;
  editingId.value = null;
  Object.assign(form, { name: '', description: '', price: 0, stock: 1, category: 'ROMANCE', imageUrl: '' });
  selectedFile.value = null; previewImage.value = null;
  showModal.value = true;
};

const openEditModal = (flower: any) => {
  isEditMode.value = true;
  editingId.value = flower.id;
  Object.assign(form, {
    name: flower.name,
    description: flower.description,
    price: Number(flower.price),
    stock: flower.stock,
    category: flower.category,
    imageUrl: flower.imageUrl
  });
  previewImage.value = flower.imageUrl;
  selectedFile.value = null;
  showModal.value = true;
};

const handleDeleteFlower = async (id: number) => {
  if (!confirm("Delete this flower? Operations cannot be undone.")) return;
  try {
    await repo.deleteFlower(id);
    await loadAllData();
  } catch (err) { alert("Delete failed."); }
};

const handleSubmit = async () => {
  try {
    isSubmitting.value = true;
    let finalKey = form.imageUrl;

    if (selectedFile.value) {
      const { uploadUrl, key } = await repo.getUploadUrl(selectedFile.value.type, selectedFile.value.name);
      await repo.uploadToS3(uploadUrl, selectedFile.value);
      finalKey = key;
    } else if (!isEditMode.value) {
      alert("Image is required."); isSubmitting.value = false; return;
    }

    const payload = { ...form, imageUrl: finalKey };

    if (isEditMode.value && editingId.value) {
      await repo.updateFlower(editingId.value, payload);
      alert("✅ Updated!");
    } else {
      await repo.createFlower(payload);
      alert("✅ Created!");
    }
    showModal.value = false;
    await loadAllData();
  } catch (err: any) {
    console.error(err);
    alert("Error: " + (err.response?.data?.message || "Failed"));
  } finally {
    isSubmitting.value = false;
  }
};

// --- 订单管理逻辑 ---
const formatDate = (str: string) => new Date(str).toLocaleDateString('en-MY', {
  year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
});

const handleShipOrder = async (orderId: number) => {
  if (!confirm("Mark order #" + orderId + " as Shipped?")) return;
  try {
    await repo.shipOrder(orderId);
    await loadAllData();
  } catch (err) { alert("Operation failed."); }
};
</script>

<template>
  <div class="min-h-screen bg-slate-50 flex font-serif">
    
    <aside class="w-64 bg-slate-900 text-slate-300 flex flex-col fixed left-0 top-20 h-[calc(100vh-5rem)] shadow-2xl z-20">
      <div class="p-8 border-b border-slate-800">
        <h1 class="text-xl text-white font-italic tracking-widest">Merchant Center</h1>
        <p class="text-xs text-purple-400 mt-2 uppercase tracking-wider">Seller Dashboard</p>
      </div>
      <nav class="flex-1 p-4 space-y-2">
        <button 
          @click="activeTab = 'inventory'"
          :class="activeTab === 'inventory' ? 'bg-purple-600/20 text-purple-300 border-purple-500/30' : 'hover:bg-white/5 hover:text-white border-transparent'"
          class="flex w-full items-center gap-3 px-4 py-3 rounded-lg border transition-all"
        >
          <span>🌸</span> Inventory
        </button>
        <button 
          @click="activeTab = 'orders'"
          :class="activeTab === 'orders' ? 'bg-purple-600/20 text-purple-300 border-purple-500/30' : 'hover:bg-white/5 hover:text-white border-transparent'"
          class="flex w-full items-center gap-3 px-4 py-3 rounded-lg border transition-all"
        >
          <span>📦</span> Orders
          <span v-if="stats[1] && stats[1].value !== '0'" class="ml-auto bg-purple-500 text-white text-[10px] px-1.5 rounded-full">{{ stats[1].value }}</span>
        </button>
      </nav>
      <div class="p-4 border-t border-slate-800">
        <button @click="router.push('/profile')" class="flex items-center gap-3 px-4 py-3 w-full hover:bg-white/5 text-slate-400 hover:text-white rounded-lg transition-all text-sm">
          <span>←</span> Back to Profile
        </button>
      </div>
    </aside>

    <main class="flex-1 ml-64 p-8">
      
      <header class="flex justify-between items-center mb-10">
        <div>
          <h2 class="text-3xl text-slate-800 font-serif">{{ activeTab === 'inventory' ? 'My Garden' : 'Incoming Orders' }}</h2>
          <p class="text-slate-500 mt-1 text-sm">Overview of your business performance.</p>
        </div>
        <button v-if="activeTab === 'inventory'" @click="openAddModal" class="bg-slate-900 text-white px-6 py-2.5 rounded-lg hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200/50 flex items-center gap-2">
          <span>+</span> Add New Flower
        </button>
      </header>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div v-for="stat in stats" :key="stat.title" class="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div class="flex justify-between items-start">
            <div>
              <p class="text-xs text-slate-400 uppercase tracking-wider font-sans font-bold">{{ stat.title }}</p>
              <h3 class="text-2xl font-bold text-slate-800 mt-2 font-sans">{{ stat.value }}</h3>
            </div>
            <div :class="`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`">{{ stat.icon }}</div>
          </div>
        </div>
      </div>

      <div v-if="isLoading" class="text-center py-20">
        <div class="animate-spin text-3xl mb-2 text-purple-600">❄️</div>
        <p class="text-slate-500">Loading Dashboard...</p>
      </div>

      <div v-else-if="activeTab === 'inventory'">
        <div v-if="myFlowers.length === 0" class="text-center py-16 bg-white rounded-xl border-2 border-dashed border-slate-200">
           <div class="text-4xl mb-4 opacity-50">🥀</div>
           <p class="text-slate-500">Your garden is empty.</p>
           <button @click="openAddModal" class="mt-4 text-purple-600 font-medium hover:underline">Plant your first flower</button>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           <div v-for="flower in myFlowers" :key="flower.id" class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl transition-all group relative duration-300">
              <div class="h-56 overflow-hidden bg-slate-100 relative">
                <img :src="flower.imageUrl" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" />
                <div class="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[2px]">
                   <button @click="openEditModal(flower)" class="bg-white text-slate-900 px-4 py-2 rounded-full font-bold text-xs uppercase tracking-wide hover:bg-purple-50 transition-colors shadow-lg">Edit</button>
                   <button @click="handleDeleteFlower(flower.id)" class="bg-rose-500 text-white px-4 py-2 rounded-full font-bold text-xs uppercase tracking-wide hover:bg-rose-600 transition-colors shadow-lg">Delete</button>
                </div>
              </div>
              <div class="p-5">
                <div class="flex justify-between items-start mb-2">
                   <h4 class="font-bold text-slate-800 text-lg truncate pr-2 font-serif">{{ flower.name }}</h4>
                   <span class="shrink-0 bg-purple-50 text-purple-700 text-[10px] uppercase font-bold px-2 py-1 rounded border border-purple-100">
                     {{ flower.category }}
                   </span>
                </div>
                <p class="text-slate-500 text-sm mb-4 line-clamp-2 min-h-[40px] leading-relaxed">{{ flower.description }}</p>
                <div class="flex justify-between items-center border-t border-slate-50 pt-4 mt-2">
                   <div class="flex flex-col">
                     <span class="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Price</span>
                     <span class="text-emerald-600 font-bold font-sans text-lg">RM {{ flower.price }}</span>
                   </div>
                   <div class="flex flex-col items-end">
                     <span class="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Stock</span>
                     <span class="text-slate-700 font-medium font-sans text-lg">{{ flower.stock }}</span>
                   </div>
                </div>
              </div>
           </div>
        </div>
      </div>

      <div v-else-if="activeTab === 'orders'">
        <div v-if="myOrders.length === 0" class="text-center py-16 bg-white rounded-xl border border-slate-200">
           <div class="text-4xl mb-4">📭</div>
           <p class="text-slate-500">No orders yet.</p>
        </div>

        <div v-else class="space-y-6">
          <div v-for="order in myOrders" :key="order.orderId" class="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            
            <div class="bg-slate-50/80 px-6 py-4 flex flex-wrap justify-between items-center border-b border-slate-100 gap-4">
              <div class="text-sm flex items-center gap-4">
                <span class="font-bold text-slate-900">#{{ order.orderId }}</span>
                <span class="text-slate-300">|</span>
                <span class="text-slate-500">{{ formatDate(order.createdAt) }}</span>
                
                <span class="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ml-2 flex items-center gap-1">
                  👤 {{ order.buyerName }}
                </span>
              </div>
              
              <div>
                 <span :class="{'bg-green-100 text-green-700 border-green-200': order.status === 'SHIPPED', 'bg-yellow-100 text-yellow-700 border-yellow-200': order.status === 'PAID', 'bg-blue-100 text-blue-700 border-blue-200': order.status === 'COMPLETED'}" class="px-3 py-1 rounded-full text-xs font-bold border">
                   {{ order.status }}
                 </span>
              </div>
            </div>

            <div class="p-6 flex flex-col lg:flex-row gap-8">
              <div class="flex-1 space-y-4">
                 <div v-for="item in order.items" :key="item.flowerName" class="flex items-start gap-4">
                    <img :src="item.imageUrl" class="w-16 h-16 rounded-lg object-cover border border-slate-100" />
                    <div>
                      <p class="font-bold text-slate-800 font-serif">{{ item.flowerName }}</p>
                      <p class="text-sm text-slate-500 mt-1">Qty: {{ item.quantity }} &times; RM {{ item.price }}</p>
                    </div>
                 </div>
              </div>

              <div class="lg:w-1/3 lg:border-l lg:border-slate-100 lg:pl-8 flex flex-col justify-between">
                 <div class="space-y-6">
                   
                   <div>
                     <h4 class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                       <span>📧</span> Contact Info
                     </h4>
                     <div class="text-sm text-slate-700 font-medium">email: {{ order.buyerEmail }}</div>
                     <div class="text-sm text-slate-500 mt-1">phone: {{ order.buyerPhone }}</div>
                   </div>

                   <div>
                     <h4 class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                       <span>📍</span> Shipping Address
                     </h4>
                     <div class="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed">
                       {{ order.shippingAddress }}
                     </div>
                   </div>
                 </div>
                 
                 <div class="mt-6 pt-6 border-t border-slate-50">
                   <button 
                     v-if="order.status === 'PAID'"
                     @click="handleShipOrder(order.orderId)"
                     class="w-full bg-slate-900 text-white py-3 rounded-lg hover:bg-slate-700 transition-all font-bold text-sm flex justify-center items-center gap-2 shadow-lg hover:shadow-xl"
                   >
                     <span>🚢</span> Mark as Shipped
                   </button>
                   <button v-else disabled class="w-full bg-slate-100 text-slate-400 py-3 rounded-lg font-bold text-sm border border-slate-200 cursor-not-allowed">
                     Item Shipped
                   </button>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </main>

    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-all">
       <div class="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
          <h3 class="text-xl font-bold text-slate-800 font-serif">{{ isEditMode ? 'Edit Flower' : 'Add New Flower' }}</h3>
          <button @click="showModal = false" class="text-slate-400 hover:text-slate-600 transition-colors">✕</button>
        </div>
        
        <form @submit.prevent="handleSubmit" class="p-8 space-y-6">
          <div class="flex justify-center">
            <div class="relative w-full h-64 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer overflow-hidden group">
              <input type="file" @change="handleFileChange" accept="image/*" class="absolute inset-0 opacity-0 cursor-pointer z-10" />
              <img v-if="previewImage" :src="previewImage" class="absolute inset-0 w-full h-full object-cover" />
              <div v-else class="text-center p-4 transition-transform group-hover:scale-105">
                <div class="text-4xl mb-3">📷</div>
                <p class="text-sm text-slate-500 font-medium">Click to upload image</p>
                <p class="text-xs text-slate-400 mt-1">JPG/PNG (Max 5MB)</p>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-6">
            <div class="col-span-2">
              <label class="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider">Flower Name</label>
              <input v-model="form.name" required class="w-full border-b border-slate-300 py-2 focus:border-purple-500 outline-none transition-colors text-lg font-serif placeholder-slate-300" placeholder="e.g. Royal Red Rose" />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider">Price (RM)</label>
              <input v-model="form.price" required type="number" min="0.01" step="0.01" class="w-full border-b border-slate-300 py-2 focus:border-purple-500 outline-none font-sans" />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider">Stock Qty</label>
              <input v-model="form.stock" required type="number" min="1" class="w-full border-b border-slate-300 py-2 focus:border-purple-500 outline-none font-sans" />
            </div>
            <div class="col-span-2">
              <label class="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider">Category</label>
              <select v-model="form.category" class="w-full border-b border-slate-300 py-2 focus:border-purple-500 outline-none bg-white font-sans">
                <option value="ROMANCE">Romance & Love</option>
                <option value="WEDDING">Wedding</option>
                <option value="BIRTHDAY">Birthday</option>
                <option value="SYMPATHY">Sympathy</option>
              </select>
            </div>
            <div class="col-span-2">
              <label class="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider">Description</label>
              <textarea v-model="form.description" required rows="3" class="w-full border border-slate-300 rounded-lg p-3 text-sm focus:border-purple-500 outline-none transition-shadow focus:shadow-sm" placeholder="Tell the story of this flower..."></textarea>
            </div>
          </div>

          <div class="pt-4 flex justify-end gap-4">
            <button type="button" @click="showModal = false" class="px-6 py-2.5 text-slate-500 hover:text-slate-800 font-medium transition-colors">Cancel</button>
            <button type="submit" :disabled="isSubmitting" class="px-8 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-all disabled:opacity-50 font-bold tracking-wide shadow-lg hover:shadow-xl">
               {{ isSubmitting ? 'Saving...' : (isEditMode ? 'Update Flower' : 'Publish to Shop') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>