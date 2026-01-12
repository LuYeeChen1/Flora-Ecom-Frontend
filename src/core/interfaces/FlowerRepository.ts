// src/core/interfaces/FlowerRepository.ts

import type { Flower } from '../entities/Flower';

export interface FlowerRepository {
  getFlowers(): Promise<Flower[]>;
  getFlowerById(id: string): Promise<Flower | null>;
}