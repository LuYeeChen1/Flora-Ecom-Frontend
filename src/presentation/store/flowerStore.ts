import { defineStore } from 'pinia';
import { ref } from 'vue';
import { HttpFlowerRepository } from '../../infrastructure/repositories/HttpFlowerRepository';
import { SellerFlowerRepository, type FlowerData } from '../../infrastructure/repositories/SellerFlowerRepository';
import { useAuthStore } from './authStore';

export const useFlowerStore = defineStore('flower', () => {
  const sellerRepo = new SellerFlowerRepository();
  const publicRepo = new HttpFlowerRepository();
  const authStore = useAuthStore();

  const flowers = ref<any[]>([]); // 公共列表
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const successMessage = ref<string | null>(null);

  /**
   * 1. [公共] 获取所有鲜花列表
   */
  async function fetchFlowers() {
    isLoading.value = true;
    error.value = null;
    try {
      const data = await publicRepo.getFlowers();
      flowers.value = data;
    } catch (err: any) {
      console.error("Failed to fetch flowers:", err);
      error.value = "无法加载鲜花数据";
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * 2. [卖家] 上架鲜花
   */
  async function addFlower(file: File, formData: Omit<FlowerData, 'imageUrl'>) {
    isLoading.value = true;
    error.value = null;
    successMessage.value = null;

    try {
      if (!authStore.token) throw new Error("Unauthorized: Please login first.");

      // Step 1: 获取链接
      const { uploadUrl, key } = await sellerRepo.getUploadUrl(
        authStore.token, 
        file.type, 
        file.name
      );

      // Step 2: 上传 S3
      await sellerRepo.uploadToS3(uploadUrl, file);

      // Step 3: 保存数据
      const flowerData: FlowerData = {
        ...formData,
        imageUrl: key 
      };
      
      await sellerRepo.createFlower(authStore.token, flowerData);
      
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