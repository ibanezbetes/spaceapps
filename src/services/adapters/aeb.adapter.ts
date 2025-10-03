import axios from 'axios';
import { BBox, Category, ObjectSummary } from '../../domain/models';
import { CatalogAdapter } from '../types';

// AEB/INPE Image Catalog mock-ish adapter
// Public docs: https://www.dgi.inpe.br/catalogo/ (no public, stable JSON documented; we'll simulate)

export const aebInpeAdapter: CatalogAdapter = {
  id: 'aeb-inpe',
  async searchByCategory(category: Category, bbox?: BBox, _page = 1, limit = 50) {
    // Since INPE public JSON isn't stable, mock some Andromeda-related entries
    const base: ObjectSummary[] = Array.from({ length: 40 }).map((_, i) => ({
      id: `INPE-${category}-${i}`,
      name: `INPE ${category} ${i}`,
      category,
      ra: 10.6847083 + Math.random() * 0.2 - 0.1,
      dec: 41.26875 + Math.random() * 0.2 - 0.1,
      magnitude: undefined,
      thumbUrl: undefined,
      source: 'aeb:inpe'
    }));
    const items = bbox
      ? base.filter((o) =>
          (!bbox || (o.ra >= bbox.minRA && o.ra <= bbox.maxRA && o.dec >= bbox.minDec && o.dec <= bbox.maxDec))
        )
      : base;
    return { items: items.slice(0, limit), total: items.length };
  },
  async getById(id: string) {
    if (!id.startsWith('INPE-')) {
      return null;
    }
    return {
      id,
      name: id,
      category: 'others',
      ra: 10.6847083,
      dec: 41.26875,
      source: 'aeb:inpe'
    } as ObjectSummary;
  }
};
