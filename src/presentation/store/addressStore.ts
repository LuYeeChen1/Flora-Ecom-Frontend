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
      const res = await apiClient.get('/addresses', {
        headers: { Authorization: `Bearer ${authStore.token}` }
      });
      addresses.value = res.data;
    } catch (err) {
      console.error(err);
    } finally {
      isLoading.value = false;
    }
  }

  async function addAddress(addr: Address) {
    await apiClient.post('/addresses', addr, {
      headers: { Authorization: `Bearer ${authStore.token}` }
    });
    await fetchAddresses();
  }

  async function deleteAddress(id: number) {
    await apiClient.delete(`/addresses/${id}`, {
      headers: { Authorization: `Bearer ${authStore.token}` }
    });
    await fetchAddresses();
  }

  return { addresses, isLoading, fetchAddresses, addAddress, deleteAddress };
});