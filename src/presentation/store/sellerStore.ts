// src/presentation/store/sellerStore.ts

import { defineStore } from 'pinia';
import { ref } from 'vue';
// ✅ 核心修復：引入正確的 Repository (使用 apiClient 的那個)
import type { SellerApplication } from '../../domain/models/Seller';
import { SellerProfileRepository } from '../../infrastructure/repositories/SellerProfileRepository';

export const useSellerStore = defineStore('seller', () => {
  // 1. 初始化 Repository
  const repo = new SellerProfileRepository();

  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const successMessage = ref<string | null>(null);

  /**
   * 提交賣家申請
   */
  async function submitApplication(form: SellerApplication | any) {
    isLoading.value = true;
    error.value = null;
    successMessage.value = null;

    try {
      // ✅ 使用 Repository 發送請求，自動繼承生產環境網址
      await repo.submitApplication(form);
      successMessage.value = 'Application submitted successfully! Waiting for review.';
    } catch (err: any) {
      console.error('Store: Submit failed', err);
      // 處理後端返回的錯誤訊息
      const msg = err.response?.data?.message || err.response?.data || err.message || 'Failed to submit application.';
      error.value = msg;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * 獲取狀態 (如果你需要在 Store 裡管理狀態)
   */
  async function fetchStatus() {
    try {
      return await repo.getStatus();
    } catch (err) {
      return 'NONE';
    }
  }

  return {
    isLoading,
    error,
    successMessage,
    submitApplication,
    fetchStatus
  };
});