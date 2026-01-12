// 简单的检查一下，确保是这样的
import { defineStore } from 'pinia';
import type { Flower } from '../../core/entities/Flower';
import { HttpFlowerRepository } from '../../infrastructure/api/HttpFlowerRepository';

const flowerRepo = new HttpFlowerRepository();

export const useFlowerStore = defineStore('flower', {
  state: () => ({
    flowers: [] as Flower[],
    loading: false
  }),
  actions: {
    async fetchFlowers() {
      this.loading = true;
      try {
        this.flowers = await flowerRepo.getFlowers();
      } finally {
        this.loading = false;
      }
    }
  }
});