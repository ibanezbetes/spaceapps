import { BBox, Category, ObjectDetails } from '../domain/models';
import { registry } from './adapter-registry';

export const catalogService = {
  async search(category: Category, bbox?: BBox, page = 1, limit = 50) {
    return registry.search(category, bbox, page, limit);
  },
  async getById(id: string): Promise<{ item: ObjectDetails | null }> {
    const { item, sources } = await registry.getById(id);
    if (!item) {
      return { item: null };
    }
    return { item: { ...item, sources } as ObjectDetails };
  }
};
