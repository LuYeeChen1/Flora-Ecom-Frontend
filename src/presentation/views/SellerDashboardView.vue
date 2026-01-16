<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { SellerFlowerRepository, type FlowerData } from '../../infrastructure/repositories/SellerFlowerRepository';
import { useAuthStore } from '../store/authStore';

const router = useRouter();
const authStore = useAuthStore();

// --- UI 状态 ---
const showModal = ref(false);
const isEditMode = ref(false);
const editingId = ref<number | null>(null);
const previewImage = ref<string | null>(null);
const selectedFile = ref<File | null>(null);
const isLoadingInventory = ref(true);
const isSubmitting = ref(false);
const repo = new SellerFlowerRepository();

// --- 数据 ---
const myFlowers = ref<any[]>([]);

// 表单
const form = reactive<FlowerData>({
  name: '', description: '', price: 0, stock: 1, category: 'ROMANCE', imageUrl: ''
});

const stats = ref([
  { title: 'Total Flowers', value: '0', icon: '🌸', color: 'bg-purple-100 text-purple-600' },
  { title: 'Pending Orders', value: '0', icon: '📦', color: 'bg-blue-100 text-blue-600' },
  { title: 'Revenue', value: 'RM 0', icon: '💰', color: 'bg-green-100 text-green-600' },
  { title: 'Rating', value: '5.0', icon: '⭐', color: 'bg-yellow-100 text-yellow-600' },
]);

// --- 核心逻辑 ---
const loadInventory = async () => {
  if (!authStore.token) return;
  try {
    isLoadingInventory.value = true;
    myFlowers.value = await repo.getMyInventory();
    
    if (stats.value && stats.value[0]) {
      stats.value[0].value = myFlowers.value.length.toString();
    }
  } catch (error: any) {
    console.error("加载库存失败", error);
    if (error.response && error.response.status === 403) {
      alert("⚠️ 权限拒绝：请重新登录。");
    }
  } finally {
    isLoadingInventory.value = false;
  }
};

onMounted(() => {
  loadInventory();
});

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    const file = target.files[0];
    if (file.size > 5 * 1024 * 1024) {
      alert("文件过大 (Max 5MB)"); return;
    }
    selectedFile.value = file;
    previewImage.value = URL.createObjectURL(file);
  }
};

// 打开新增弹窗
const openAddModal = () => {
  isEditMode.value = false;
  editingId.value = null;
  form.name = ''; form.description = ''; form.price = 0; form.stock = 1; form.category = 'ROMANCE'; form.imageUrl = '';
  selectedFile.value = null; previewImage.value = null;
  showModal.value = true;
};

// ✅ 打开编辑弹窗
const openEditModal = (flower: any) => {
  isEditMode.value = true;
  editingId.value = flower.id;
  // 回显数据
  form.name = flower.name;
  form.description = flower.description;
  form.price = parseFloat(flower.price); // 确保是数字
  form.stock = flower.stock;
  form.category = flower.category;
  form.imageUrl = flower.imageUrl; // 保留原图URL
  
  previewImage.value = flower.imageUrl;
  selectedFile.value = null;
  showModal.value = true;
};

// ✅ 删除逻辑
const handleDelete = async (id: number) => {
  if (!confirm("Are you sure you want to delete this flower?")) return;
  try {
    await repo.deleteFlower(id);
    await loadInventory();
  } catch (err) {
    alert("Delete failed.");
  }
};

// 提交表单 (新增或更新)
const handleSubmit = async () => {
  try {
    isSubmitting.value = true;
    let finalImageUrl = form.imageUrl;

    // 1. 如果有新文件，先上传 S3
    if (selectedFile.value) {
      const { uploadUrl, key } = await repo.getUploadUrl(selectedFile.value.type, selectedFile.value.name);
      await repo.uploadToS3(uploadUrl, selectedFile.value);
      finalImageUrl = key; // 后端需要的是 Key
    } else if (!isEditMode.value) {
      // 新增模式必须有图
      alert("Please upload an image."); isSubmitting.value = false; return;
    }

    const payload = {
      name: form.name,
      description: form.description,
      price: form.price,
      stock: form.stock,
      category: form.category,
      imageUrl: finalImageUrl // 传 Key 或 URL 给后端 (Service会判断)
    };

    if (isEditMode.value && editingId.value) {
      await repo.updateFlower(editingId.value, payload);
      alert("✅ Updated successfully!");
    } else {
      await repo.createFlower(payload as FlowerData);
      alert("✅ Created successfully!");
    }

    showModal.value = false;
    await loadInventory();

  } catch (err: any) {
    console.error(err);
    alert("Operation failed: " + (err.response?.data?.message || err.message));
  } finally {
    isSubmitting.value = false;
  }
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
        <a href="#" class="flex items-center gap-3 px-4 py-3 bg-purple-600/20 text-purple-300 rounded-lg border border-purple-500/30">
          <span>📊</span> Dashboard
        </a>
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
          <h2 class="text-3xl text-slate-800">Dashboard</h2>
          <p class="text-slate-500 mt-1">Manage your inventory and orders.</p>
        </div>
        <button @click="openAddModal" class="bg-slate-900 text-white px-6 py-2 rounded-lg hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200/50">
          + Add New Flower
        </button>
      </header>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div v-for="stat in stats" :key="stat.title" class="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div class="flex justify-between items-start">
            <div>
              <p class="text-sm text-slate-500 uppercase tracking-wider font-sans">{{ stat.title }}</p>
              <h3 class="text-2xl font-bold text-slate-800 mt-2 font-sans">{{ stat.value }}</h3>
            </div>
            <div :class="`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`">{{ stat.icon }}</div>
          </div>
        </div>
      </div>

      <div class="mt-10">
        <div class="flex items-center justify-between mb-6">
           <h3 class="text-xl font-bold text-slate-800">我的花园库存</h3>
           <button @click="loadInventory" class="text-sm text-purple-600 hover:text-purple-800">↻ Refresh</button>
        </div>
        
        <div v-if="isLoadingInventory" class="text-center py-20">
          <div class="animate-spin text-3xl mb-2">🌸</div>
          <p class="text-slate-500">正在整理花圃...</p>
        </div>
        
        <div v-else-if="myFlowers.length === 0" class="text-center py-16 bg-white rounded-xl border border-dashed border-slate-300">
           <div class="text-4xl mb-4 opacity-50">🥀</div>
           <p class="text-slate-500">您还没有上传任何鲜花。</p>
           <button @click="openAddModal" class="mt-4 text-purple-600 font-medium hover:underline">立即上架第一朵花</button>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           <div v-for="flower in myFlowers" :key="flower.id" class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-lg transition-all group relative">
              <div class="h-56 overflow-hidden bg-slate-100 relative">
                <img :src="flower.imageUrl" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" />
                
                <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-sm">
                   <button @click="openEditModal(flower)" class="bg-white text-slate-900 px-4 py-2 rounded-full font-bold text-sm hover:bg-purple-50 transition-colors">Edit</button>
                   <button @click="handleDelete(flower.id)" class="bg-rose-500 text-white px-4 py-2 rounded-full font-bold text-sm hover:bg-rose-600 transition-colors">Delete</button>
                </div>
              </div>
              <div class="p-5">
                <div class="flex justify-between items-start mb-2">
                   <h4 class="font-bold text-slate-800 text-lg truncate pr-2">{{ flower.name }}</h4>
                   <span class="shrink-0 bg-purple-50 text-purple-700 text-[10px] uppercase font-bold px-2 py-1 rounded border border-purple-100">
                     {{ flower.category }}
                   </span>
                </div>
                <p class="text-slate-500 text-sm mb-4 line-clamp-2 min-h-[40px]">{{ flower.description }}</p>
                <div class="flex justify-between items-center border-t border-slate-50 pt-4 mt-2">
                   <div class="flex flex-col">
                     <span class="text-xs text-slate-400 uppercase">Price</span>
                     <span class="text-emerald-600 font-bold font-sans">RM {{ flower.price }}</span>
                   </div>
                   <div class="flex flex-col items-end">
                     <span class="text-xs text-slate-400 uppercase">Stock</span>
                     <span class="text-slate-700 font-medium font-sans">{{ flower.stock }}</span>
                   </div>
                </div>
              </div>
           </div>
        </div>
      </div>
    </main>

    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
       <div class="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
          <h3 class="text-xl font-bold text-slate-800">{{ isEditMode ? 'Edit Flower' : 'Add New Flower' }}</h3>
          <button @click="showModal = false" class="text-slate-400 hover:text-slate-600">✕</button>
        </div>
        <form @submit.prevent="handleSubmit" class="p-8 space-y-6">
          <div class="flex justify-center">
            <div class="relative w-full h-64 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer overflow-hidden">
              <input type="file" @change="handleFileChange" accept="image/*" class="absolute inset-0 opacity-0 cursor-pointer z-10" />
              <img v-if="previewImage" :src="previewImage" class="absolute inset-0 w-full h-full object-cover" />
              <div v-else class="text-center p-4">
                <div class="text-4xl mb-2">📷</div>
                <p class="text-sm text-slate-500 font-medium">Click or Drag to upload flower image</p>
                <p class="text-xs text-slate-400 mt-1">Supports JPG, PNG (Max 5MB)</p>
              </div>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-6">
            <div class="col-span-2">
              <label class="block text-xs font-bold text-slate-500 uppercase mb-2">Flower Name</label>
              <input v-model="form.name" required type="text" class="w-full border-b border-slate-300 py-2 focus:border-purple-500 outline-none transition-colors" placeholder="e.g. Red Rose Bouquet" />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase mb-2">Price (RM)</label>
              <input v-model="form.price" required type="number" min="0.01" step="0.01" class="w-full border-b border-slate-300 py-2 focus:border-purple-500 outline-none" />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase mb-2">Stock Qty</label>
              <input v-model="form.stock" required type="number" min="1" class="w-full border-b border-slate-300 py-2 focus:border-purple-500 outline-none" />
            </div>
            <div class="col-span-2">
              <label class="block text-xs font-bold text-slate-500 uppercase mb-2">Category</label>
              <select v-model="form.category" class="w-full border-b border-slate-300 py-2 focus:border-purple-500 outline-none bg-white">
                <option value="ROMANCE">Romance & Love</option>
                <option value="WEDDING">Wedding</option>
                <option value="BIRTHDAY">Birthday</option>
                <option value="SYMPATHY">Sympathy</option>
              </select>
            </div>
            <div class="col-span-2">
              <label class="block text-xs font-bold text-slate-500 uppercase mb-2">Description</label>
              <textarea v-model="form.description" required rows="3" class="w-full border border-slate-300 rounded p-3 text-sm focus:border-purple-500 outline-none" placeholder="Tell the story of this flower..."></textarea>
            </div>
          </div>
          <div class="pt-4 flex justify-end gap-4">
            <button type="button" @click="showModal = false" class="px-6 py-2 text-slate-500 hover:text-slate-800 transition-colors">Cancel</button>
            <button type="submit" :disabled="isSubmitting" class="px-8 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-all disabled:opacity-50">
               {{ isSubmitting ? 'Saving...' : (isEditMode ? 'Update' : 'Publish Item') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>