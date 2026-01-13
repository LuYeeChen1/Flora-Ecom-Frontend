// src/presentation/store/flowerStore.ts
import { defineStore } from 'pinia';
import type { FlowerRepository } from '../../domain/interfaces/FlowerRepository';
import type { Flower } from '../../domain/models/Flower';

export const useFlowerStore = defineStore('flower', {
  state: () => ({
    flowers: [] as Flower[],
    loading: false
  }),
  actions: {
    /**
     * 接收任何实现了 FlowerRepository 接口的对象
     * 这样在测试时可以传入 MockRepo，在生产时传入 HttpRepo
     */
    async fetchFlowers(repo: FlowerRepository) {
      this.loading = true;
      try {
        // 核心修复：使用传入的 repo 实例获取数据
        this.flowers = await repo.getFlowers();
      } catch (error) {
        console.error('Failed to fetch flowers from repository:', error);
        // 这里可以添加错误处理逻辑，比如设置 error 状态给 UI 展示
      } finally {
        this.loading = false;
      }
    }
  }
});