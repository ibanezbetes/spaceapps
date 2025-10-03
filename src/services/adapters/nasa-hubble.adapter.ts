import axios, { AxiosError } from 'axios';
import { BBox, Category, ObjectDetails, ObjectSummary } from '../../domain/models';
import { CatalogAdapter } from '../types';
import { cache } from '../cache.service';
import { filterByBBox } from '../tiling.service';
import { env } from '../../config/env';

// MAST APIs: https://mast.stsci.edu/api
// We'll use the MAST Catalogs service (e.g., HSC, HLA) via a generic cone/search.
// For demo purposes, we query MAST portal API with RA/Dec constraints when bbox provided.

const MAST_BASE_URL = (process.env.MAST_BASE_URL || 'https://mast.stsci.edu/api/v0.1').replace(/\/$/, '');

const CATEGORY_TO_MAST: Record<string, { q: string; missions?: string[] }> = {
  'star-systems': { q: 'star system' },
  stars: { q: 'star' },
  planets: { q: 'exoplanet' },
  constellations: { q: 'constellation' },
  nebulae: { q: 'nebula' },
  clusters: { q: 'cluster' },
  galaxies: { q: 'galaxy' },
  comets: { q: 'comet' },
  asteroids: { q: 'asteroid' }
};

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function withRetry<T>(fn: () => Promise<T>, retries = 2, baseDelay = 300): Promise<T> {
  try {
    return await fn();
  } catch (e) {
    const err = e as AxiosError;
    if (retries > 0 && (err.response?.status === 429 || (err.response?.status || 500) >= 500)) {
      await sleep(baseDelay * (3 - retries));
      return withRetry(fn, retries - 1, baseDelay);
    }
    throw e;
  }
}

function bboxHash(b?: BBox) {
  if (!b) {
    return 'none';
  }
  return `${b.minRA.toFixed(5)},${b.minDec.toFixed(5)},${b.maxRA.toFixed(5)},${b.maxDec.toFixed(5)}`;
}

function normalize(item: any, category: Category): ObjectSummary {
  // Attempt to map common MAST fields
  const id = String(item?.obsid || item?.obsid_a || item?.objID || item?.obsid_hst || item?.obsid_hla || item?.name || item?.target_name || item?.obs_id || item?.obsid_jwst || item?.sourcename || item?.matchID || Math.random());
  const name = String(item?.target_name || item?.title || item?.name || id);
  const ra = Number(item?.s_ra ?? item?.ra ?? item?.ra_mean ?? item?.ra_targ ?? item?.ra_center ?? 10.6847083);
  const dec = Number(item?.s_dec ?? item?.dec ?? item?.dec_mean ?? item?.dec_targ ?? item?.dec_center ?? 41.26875);
  const mag = item?.mag ? Number(item.mag) : undefined;
  const z = item?.redshift ? Number(item.redshift) : undefined;
  const objectType = item?.objType || item?.sptype || item?.obs_collection || undefined;
  const thumbUrl = item?.previewURL || item?.jpegURL || item?.jpg_url || undefined;
  const previewUrl = item?.dataURL || item?.fitsURL || item?.quicklook || thumbUrl;
  const source: ObjectSummary['source'] = item?.obs_collection?.toLowerCase().includes('hst') ? 'nasa:hst' : 'nasa:mast';
  return { id, name, category, ra, dec, magnitude: mag, redshift: z, objectType, thumbUrl, previewUrl, source };
}

export const nasaHubbleAdapter: CatalogAdapter = {
  id: 'nasa-hubble',
  async searchByCategory(category: Category, bbox?: BBox, page = 1, limit = 50) {
    const enabled = process.env.ENABLE_NASA_HUBBLE === 'true' || env.NODE_ENV === 'test';
    if (!enabled) {
      return { items: [], total: 0 };
    }

    const cat = CATEGORY_TO_MAST[category] ? category : 'stars';
    const q = CATEGORY_TO_MAST[cat].q;
    const key = `adapter:nasa-hubble:search:${cat}:${bboxHash(bbox)}:${page}:${limit}`;
    const cached = cache.get<{ items: ObjectSummary[]; total: number }>(key);
    if (cached) {
      return cached;
    }

    // Use MAST Portal search with name/q parameter; fallback to simple target name search
    const params: Record<string, string> = {
      q,
      page: String(page),
      pagesize: String(limit)
    };
    if (bbox) {
      // Provide RA/Dec constraints if supported by endpoint (we'll filter again after)
      params['ra'] = String(((bbox.minRA + bbox.maxRA) / 2).toFixed(6));
      params['dec'] = String(((bbox.minDec + bbox.maxDec) / 2).toFixed(6));
      params['radius'] = '2'; // degrees (coarse), still filtered precisely client-side
    }
    const url = `${MAST_BASE_URL}/portal/search?${new URLSearchParams(params).toString()}`;
    const { data } = await withRetry(() => axios.get(url, { timeout: 8000 }));
    const rawItems: any[] = Array.isArray(data?.results) ? data.results : Array.isArray(data) ? data : [];
    let items = rawItems.map((r) => normalize(r, category));
    if (bbox) {
      items = filterByBBox(items, bbox);
    }
    const result = { items: items.slice(0, limit), total: items.length };
    cache.set(key, result);
    return result;
  },
  async getById(id: string) {
    const enabled = process.env.ENABLE_NASA_HUBBLE === 'true' || env.NODE_ENV === 'test';
    if (!enabled) {
      return null;
    }
    const key = `adapter:nasa-hubble:get:${id}`;
    const cached = cache.get<ObjectSummary>(key);
    if (cached) {
      return cached;
    }
    const url = `${MAST_BASE_URL}/portal/observation?obsid=${encodeURIComponent(id)}`;
    try {
      const { data } = await withRetry(() => axios.get(url, { timeout: 8000 }));
      const item = Array.isArray(data) ? data[0] : data?.observation || data;
      if (!item) {
        return null;
      }
      const normalized = normalize(item, 'others');
      cache.set(key, normalized);
      return normalized;
    } catch {
      return null;
    }
  }
};
