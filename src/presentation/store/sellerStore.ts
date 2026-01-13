// src/presentation/store/sellerStore.ts

import { defineStore } from 'pinia';
import { ref } from 'vue';

// 1. 引入具体的 Repository 实现 (相对路径)
import { sellerRepository } from '../../infrastructure/repositories/AxiosSellerRepository';
// 2. 引入 Model (相对路径)
import type { SellerApplication } from '../../domain/models/Seller';

export const useSellerStore = defineStore('seller', () => {
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const successMessage = ref<string | null>(null);

  async function submitApplication(form: SellerApplication) {
    isLoading.value = true;
    error.value = null;
    successMessage.value = null;

    try {
      // 调用 Repository
      await sellerRepository.apply(form);
      successMessage.value = 'Application submitted successfully! Waiting for review.';
    } catch (err: any) {
      console.error(err);
      // 获取后端返回的错误信息
      error.value = err.response?.data || err.message || 'Failed to submit application.';
    } finally {
      isLoading.value = false;
    }
  }

  return {
    isLoading,
    error,
    successMessage,
    submitApplication
  };
});