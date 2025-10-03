import { BBox, Category, ObjectSummary } from '../domain/models';
import { CatalogAdapter } from './types';
import { cache } from './cache.service';
import { filterByBBox } from './tiling.service';
import { nasaImagesAdapter } from './adapters/nasa.adapter';
import { aebInpeAdapter } from './adapters/aeb.adapter';
import { csaMockAdapter } from './adapters/csa.adapter';
import { env } from '../config/env';
import { nasaHubbleAdapter } from './adapters/nasa-hubble.adapter';

export class AdapterRegistry {
  private adapters: CatalogAdapter[] = [];

  register(adapter: CatalogAdapter) {
    this.adapters.push(adapter);
  }

  listAdapters() {
    return this.adapters.map((a) => a.id);
  }

  async search(category: Category, bbox?: BBox, page = 1, limit = 50): Promise<{ items: ObjectSummary[]; total: number; sources: string[] }> {
    const key = `search:${category}:${bbox ? `${bbox.minRA},${bbox.minDec},${bbox.maxRA},${bbox.maxDec}` : 'none'}:${page}:${limit}`;
    const cached = cache.get<{ items: ObjectSummary[]; total: number; sources: string[] }>(key);
    if (cached) {
      return cached;
    }

    const results = await Promise.all(
      this.adapters.map(async (a) => {
        try {
          const r = await a.searchByCategory(category, bbox, page, limit);
          const items = bbox ? filterByBBox(r.items, bbox) : r.items;
          return { items, total: r.total ?? items.length, source: a.id };
        } catch {
          return { items: [] as ObjectSummary[], total: 0, source: a.id };
        }
      })
    );

    // Merge and paginate across adapters with dedupe by rounded RA/Dec hash
    const seen = new Set<string>();
    const allItems: ObjectSummary[] = [];
    for (const r of results) {
      for (const it of r.items) {
        const keyPos = `${it.category}:${it.name}:${it.ra.toFixed(5)},${it.dec.toFixed(5)}`;
        if (!seen.has(keyPos)) {
          seen.add(keyPos);
          allItems.push(it);
        }
      }
    }
    const total = allItems.length;
    const start = (page - 1) * limit;
    const end = start + limit;
    const paged = allItems.slice(start, end);
    const sources = results.map((r) => r.source);

    const value = { items: paged, total, sources };
    cache.set(key, value);
    return value;
  }

  async getById(id: string): Promise<{ item: ObjectSummary | null; sources: string[] }> {
    const key = `getById:${id}`;
    const cached = cache.get<{ item: ObjectSummary | null; sources: string[] }>(key);
    if (cached) {
      return cached;
    }

    for (const a of this.adapters) {
      try {
        const item = await a.getById(id);
        if (item) {
          const value = { item, sources: [a.id] };
          cache.set(key, value);
          return value;
        }
      } catch {
        // continue
      }
    }
    const value = { item: null, sources: [] as string[] };
    cache.set(key, value);
    return value;
  }
}

export const registry = new AdapterRegistry();
// Register adapters (at least two real-ish or mock in tests)
if (env.NODE_ENV !== 'test') {
  registry.register(nasaImagesAdapter);
}
registry.register(aebInpeAdapter);
// Register Hubble/MAST with medium priority after INPE (feature-flagged)
if (env.ENABLE_NASA_HUBBLE) {
  registry.register(nasaHubbleAdapter);
}
// Additional mock provider
registry.register(csaMockAdapter);
