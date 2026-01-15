import { defineStore } from 'pinia';
import { ref } from 'vue';
import { SellerFlowerRepository, type FlowerData } from '../../infrastructure/repositories/SellerFlowerRepository';
import { useAuthStore } from './authStore';

export const useFlowerStore = defineStore('flower', () => {
  const flowerRepo = new SellerFlowerRepository();
  const authStore = useAuthStore();

  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const successMessage = ref<string | null>(null);

  /**
   * 核心动作：上架鲜花
   * @param file 用户选择的图片文件
   * @param formData 表单填写的鲜花信息 (不含 imageUrl)
   */
  async function addFlower(file: File, formData: Omit<FlowerData, 'imageUrl'>) {
    isLoading.value = true;
    error.value = null;
    successMessage.value = null;

    try {
      if (!authStore.token) throw new Error("Unauthorized: Please login first.");

      // Step 1: 找后端要上传链接
      console.log('1. Requesting upload URL...');
      const { uploadUrl, key } = await flowerRepo.getUploadUrl(
        authStore.token, 
        file.type, 
        file.name
      );

      // Step 2: 上传图片到 S3
      console.log('2. Uploading to S3...', uploadUrl);
      await flowerRepo.uploadToS3(uploadUrl, file);

      // Step 3: 保存数据到后端
      console.log('3. Saving metadata to Backend...');
      const flowerData: FlowerData = {
        ...formData,
        imageUrl: key // 关键：存入数据库的是 S3 Key (不是完整的 URL)
      };
      
      await flowerRepo.createFlower(authStore.token, flowerData);
      
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
    isLoading,
    error,
    successMessage,
    addFlower
  };
});