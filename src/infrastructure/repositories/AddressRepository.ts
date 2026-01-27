import apiClient from '../api/apiClient';

export interface Address {
  id?: number;
  recipientName: string;
  phoneNumber: string;
  fullAddress: string;
  default?: boolean; // 对应后端的 isDefault
}

export class AddressRepository {
  // 获取我的地址列表
  async getMyAddresses(): Promise<Address[]> {
    const response = await apiClient.get('/addresses');
    return response.data;
  }

  // 添加或更新地址
  async saveAddress(address: Address) {
    await apiClient.post('/addresses', address);
  }

  // 删除地址
  async deleteAddress(id: number) {
    await apiClient.delete(`/addresses/${id}`);
  }
}