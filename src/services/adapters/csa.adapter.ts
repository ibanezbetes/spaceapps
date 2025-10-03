// CSA (Canadian Space Agency) providers - mock/stub implementations
// Providers documented for future implementation:
// - CWFIS, GEO.ca, RADARSAT Constellation, MOPITT, ACE/SCISAT, OSIRIS
// For now, return synthetic objects around Andromeda bbox for demo/testing.

import { BBox, Category, ObjectSummary } from '../../domain/models';
import { CatalogAdapter } from '../types';

const synth = (category: Category, count = 20): ObjectSummary[] =>
  Array.from({ length: count }).map((_, i) => ({
    id: `CSA-${category}-${i}`,
    name: `CSA ${category} ${i}`,
    category,
    ra: 10.6847083 + Math.random() * 0.2 - 0.1,
    dec: 41.26875 + Math.random() * 0.2 - 0.1,
    source: 'csa:mock'
  }));

export const csaMockAdapter: CatalogAdapter = {
  id: 'csa-mock',
  async searchByCategory(category: Category, bbox?: BBox, _page = 1, limit = 50) {
    const base = synth(category, 30);
    const items = bbox
      ? base.filter((o) =>
          (!bbox || (o.ra >= bbox.minRA && o.ra <= bbox.maxRA && o.dec >= bbox.minDec && o.dec <= bbox.maxDec))
        )
      : base;
    return { items: items.slice(0, limit), total: items.length };
  },
  async getById(id: string) {
    if (!id.startsWith('CSA-')) {
      return null;
    }
    return {
      id,
      name: id,
      category: 'others',
      ra: 10.6847083,
      dec: 41.26875,
      source: 'csa:mock'
    };
  }
};
