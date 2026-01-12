// src/infrastructure/api/HttpFlowerRepository.ts

// 1. 注意这里加了 type 关键字
import type { Flower } from '../../core/entities/Flower';
import type { FlowerRepository } from '../../core/interfaces/FlowerRepository';

export class HttpFlowerRepository implements FlowerRepository {
  async getFlowers(): Promise<Flower[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: 'violet-001',
            name: 'Sincere Violet',
            price: 1280,
            description: '“花名与你同名。” 这种花以此为名，象征着永远的诚挚与爱。适合想要传达无言心意的人。',
            imageUrl: 'https://images.unsplash.com/photo-1574635607323-9311630bb33f?q=80&w=800&auto=format&fit=crop',
            stock: 5,
            category: 'Legacy'
          },
          {
            id: 'camellia-002',
            name: 'White Camellia',
            price: 980,
            description: '洁白无瑕，如同雪原上的初见。象征着理想的爱与谦逊。',
            imageUrl: 'https://images.unsplash.com/photo-1594754563870-73898083897f?q=80&w=800&auto=format&fit=crop',
            stock: 12,
            category: 'Classic'
          },
          {
            id: 'rose-003',
            name: 'Royal Red Rose',
            price: 1520,
            description: '虽显陈词滥调，但热烈的红色永远是爱的直白诉说。',
            imageUrl: 'https://images.unsplash.com/photo-1548610762-7c6abc94c031?q=80&w=800&auto=format&fit=crop',
            stock: 20,
            category: 'Romantic'
          }
        ]);
      }, 300);
    });
  }

  // 2. 这里把 id 改成了 _id (下划线开头表示暂时不用这个参数)
  async getFlowerById(_id: string): Promise<Flower | null> {
    return null; 
  }
}