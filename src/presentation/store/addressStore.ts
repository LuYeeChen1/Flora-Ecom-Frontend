// src/presentation/store/addressStore.ts

import { defineStore } from 'pinia';
import { ref } from 'vue';
import apiClient from '../../infrastructure/api/apiClient';
import { useAuthStore } from './authStore';

export interface Address {
  id?: number;
  recipientName: string;
  phoneNumber: string;
  fullAddress: string;
  isDefault: boolean;
}

export const useAddressStore = defineStore('address', () => {
  const authStore = useAuthStore();
  const addresses = ref<Address[]>([]);
  const isLoading = ref(false);

  async function fetchAddresses() {
    if (!authStore.token) return;
    isLoading.value = true;
    try {
      // apiClient 會自動攔截請求加上 Token，但這裡顯式加也沒錯，雙重保險
      const res = await apiClient.get('/addresses');
      addresses.value = res.data;
    } catch (err) {
      console.error('Fetch addresses failed', err);
    } finally {
      isLoading.value = false;
    }
  }

  async function addAddress(addr: Address) {
    await apiClient.post('/addresses', addr);
    await fetchAddresses();
  }

  async function deleteAddress(id: number) {
    await apiClient.delete(`/addresses/${id}`);
    await fetchAddresses();
  }

  return { addresses, isLoading, fetchAddresses, addAddress, deleteAddress };
});