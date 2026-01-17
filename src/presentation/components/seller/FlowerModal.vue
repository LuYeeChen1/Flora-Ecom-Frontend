<script setup lang="ts">
import { reactive, ref, watch } from 'vue';
import type { FlowerData } from '../../../infrastructure/repositories/SellerFlowerRepository';

const props = defineProps<{
  show: boolean;
  editMode: boolean;
  initialData?: FlowerData;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'submit', payload: { form: FlowerData, file: File | null }): void;
}>();

const form = reactive<FlowerData>({
  name: '', description: '', price: 0, stock: 1, category: 'ROMANCE', imageUrl: ''
});
const previewImage = ref<string | null>(null);
const selectedFile = ref<File | null>(null);
const isSubmitting = ref(false);

// 监听 props 变化，初始化表单
watch(() => props.show, (newVal) => {
  if (newVal) {
    if (props.editMode && props.initialData) {
      Object.assign(form, props.initialData);
      // ✅ [修复] 使用 ?? null 处理 undefined 的情况
      previewImage.value = props.initialData.imageUrl ?? null;
    } else {
      Object.assign(form, { name: '', description: '', price: 0, stock: 1, category: 'ROMANCE', imageUrl: '' });
      previewImage.value = null;
    }
    selectedFile.value = null;
  }
});

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    const file = target.files[0];
    if (file.size > 5 * 1024 * 1024) { alert("File too large (Max 5MB)"); return; }
    selectedFile.value = file;
    previewImage.value = URL.createObjectURL(file);
  }
};

const handleSubmit = async () => {
  isSubmitting.value = true;
  // 为了避免响应式对象带来的副作用，提交时复制一份 form
  emit('submit', { form: { ...form }, file: selectedFile.value });
  isSubmitting.value = false;
};
</script>

<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-all">
     <div class="bg-white p-8 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div class="flex justify-between items-center mb-6">
           <h3 class="text-xl font-bold text-slate-800 font-serif">{{ editMode ? 'Edit Flower' : 'Add New Flower' }}</h3>
           <button @click="emit('close')" class="text-slate-400 hover:text-slate-600 font-bold text-xl">✕</button>
        </div>
        
        <form @submit.prevent="handleSubmit">
           <div class="flex justify-center mb-6">
              <div class="relative w-full h-48 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer overflow-hidden group">
                <input type="file" @change="handleFileChange" accept="image/*" class="absolute inset-0 opacity-0 cursor-pointer z-10" />
                <img v-if="previewImage" :src="previewImage" class="absolute inset-0 w-full h-full object-cover" />
                <div v-else class="text-center p-4">
                  <div class="text-4xl mb-3">📷</div>
                  <p class="text-sm text-slate-500 font-medium">Click to upload image</p>
                  <p class="text-xs text-slate-400 mt-1">JPG/PNG (Max 5MB)</p>
                </div>
              </div>
           </div>

           <div class="grid grid-cols-2 gap-6">
              <div class="col-span-2">
                <label class="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider">Flower Name</label>
                <input v-model="form.name" required class="w-full border p-2 rounded focus:ring-2 focus:ring-purple-500 outline-none transition-all" placeholder="e.g. Royal Red Rose" />
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider">Price (RM)</label>
                <input v-model="form.price" required type="number" min="0.01" step="0.01" class="w-full border p-2 rounded focus:ring-2 focus:ring-purple-500 outline-none transition-all" />
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider">Stock Qty</label>
                <input v-model="form.stock" required type="number" min="1" class="w-full border p-2 rounded focus:ring-2 focus:ring-purple-500 outline-none transition-all" />
              </div>
              <div class="col-span-2">
                <label class="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider">Category</label>
                <select v-model="form.category" class="w-full border p-2 rounded bg-white focus:ring-2 focus:ring-purple-500 outline-none transition-all">
                  <option value="ROMANCE">Romance & Love</option>
                  <option value="WEDDING">Wedding</option>
                  <option value="BIRTHDAY">Birthday</option>
                  <option value="SYMPATHY">Sympathy</option>
                </select>
              </div>
              <div class="col-span-2">
                <label class="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider">Description</label>
                <textarea v-model="form.description" required rows="3" class="w-full border p-2 rounded focus:ring-2 focus:ring-purple-500 outline-none transition-all" placeholder="Tell the story of this flower..."></textarea>
              </div>
           </div>

           <div class="mt-8 flex justify-end gap-4">
              <button type="button" @click="emit('close')" class="px-6 py-2.5 text-slate-500 hover:text-slate-800 font-medium transition-colors">Cancel</button>
              <button type="submit" :disabled="isSubmitting" class="px-8 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 font-bold shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                 {{ isSubmitting ? 'Saving...' : 'Save' }}
              </button>
           </div>
        </form>
     </div>
  </div>
</template>