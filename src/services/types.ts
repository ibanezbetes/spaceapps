import { BBox, Category, ObjectSummary } from '../domain/models';

export interface CatalogAdapter {
  id: string; // adapter id e.g., 'nasa-images', 'nasa-worldview', 'aeb-inpe'
  searchByCategory: (
    category: Category,
    bbox?: BBox,
    page?: number,
    limit?: number
  ) => Promise<{ items: ObjectSummary[]; total?: number }>;
  getById: (id: string) => Promise<ObjectSummary | null>;
}
