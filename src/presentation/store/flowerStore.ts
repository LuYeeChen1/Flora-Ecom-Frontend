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
   * 1. [公共] 获取所有鲜花列表 (适配分页接口)
   */
  async function fetchFlowers(params: any = {}) {
    isLoading.value = true;
    error.value = null;
    try {
      // ✅ 现在 publicRepo.getFlowers 支持传参了
      const data = await publicRepo.getFlowers(params);
      
      // 智能识别返回结构
      if (data && Array.isArray(data.list)) {
        flowers.value = data.list;
      } else if (Array.isArray(data)) {
        flowers.value = data;
      } else {
        console.warn("Unexpected flower data format:", data);
        flowers.value = [];
      }

    } catch (err: any) {
      console.error("Failed to fetch flowers:", err);
      error.value = "无法加载鲜花数据";
      flowers.value = [];
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
      // 检查登录状态
      if (!authStore.token) throw new Error("Unauthorized: Please login first.");

      // Step 1: 获取链接
      // ✅ [修复] 删除 authStore.token 参数 (apiClient 会自动处理)
      const { uploadUrl, key } = await sellerRepo.getUploadUrl(
        file.type, 
        file.name
      );

      // Step 2: 上传 S3 (这个通常是直接传 S3，不走 apiClient，所以保持原样)
      await sellerRepo.uploadToS3(uploadUrl, file);

      // Step 3: 保存数据
      const flowerData: FlowerData = {
        ...formData,
        imageUrl: key 
      };
      
      // ✅ [修复] 删除 authStore.token 参数
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