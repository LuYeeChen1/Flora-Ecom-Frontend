// src/presentation/store/flowerStore.ts

import { defineStore } from 'pinia';
import { ref } from 'vue';
import { HttpFlowerRepository } from '../../infrastructure/repositories/HttpFlowerRepository';
import { SellerFlowerRepository, type FlowerData } from '../../infrastructure/repositories/SellerFlowerRepository';
import { useAuthStore } from './authStore';

export const useFlowerStore = defineStore('flower', () => {
  const sellerRepo = new SellerFlowerRepository();
  const publicRepo = new HttpFlowerRepository();
  const authStore = useAuthStore();

  const flowers = ref<any[]>([]); 
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const successMessage = ref<string | null>(null);

  /**
   * 1. [公共] 獲取所有鮮花列表
   */
  async function fetchFlowers(params: any = {}) {
    isLoading.value = true;
    error.value = null;
    try {
      const data = await publicRepo.getFlowers(params);
      
      if (data && Array.isArray(data.list)) {
        flowers.value = data.list;
      } else if (Array.isArray(data)) {
        flowers.value = data;
      } else {
        console.warn("Unexpected data format:", data);
        flowers.value = [];
      }

    } catch (err: any) {
      console.error("Failed to fetch flowers:", err);
      error.value = "無法加載鮮花數據";
      flowers.value = [];
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * 2. [賣家] 上架鮮花
   */
  async function addFlower(file: File, formData: Omit<FlowerData, 'imageUrl'>) {
    isLoading.value = true;
    error.value = null;
    successMessage.value = null;

    try {
      if (!authStore.token) throw new Error("Unauthorized: Please login first.");

      // apiClient 會自動處理 baseURL，這裡只需關注業務
      const { uploadUrl, key } = await sellerRepo.getUploadUrl(file.type, file.name);

      // 上傳 S3 (直傳，不走後端)
      await sellerRepo.uploadToS3(uploadUrl, file);

      const flowerData: FlowerData = {
        ...formData,
        imageUrl: key 
      };
      
      await sellerRepo.createFlower(flowerData);
      
      successMessage.value = "Flower listed successfully!";
      return true;

    } catch (err: any) {
      console.error(err);
      error.value = err.response?.data || err.message || "Failed to add flower.";
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  return {
    flowers,
    isLoading,
    error,
    successMessage,
    fetchFlowers,
    addFlower
  };
});