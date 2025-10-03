import axios from 'axios';
import { BBox, Category, ObjectSummary } from '../../domain/models';
import { CatalogAdapter } from '../types';

// NASA Images and Video Library API (limited astronomical metadata)
// https://images.nasa.gov/docs/images.nasa.gov_api_docs.pdf

const CATEGORY_MAP: Record<Category, string[]> = {
  stars: ['star', 'stellar'],
  galaxies: ['galaxy', 'galaxies'],
  nebulae: ['nebula', 'nebulosity'],
  clusters: ['cluster', 'open cluster', 'globular'],
  planets: ['planet', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'mercury', 'venus', 'earth'],
  moons: ['moon', 'luna', 'io', 'europa', 'ganymede', 'callisto', 'titan', 'enceladus'],
  asteroids: ['asteroid'],
  comets: ['comet'],
  'star-systems': ['star system', 'binary star', 'multiple star'],
  constellations: ['constellation'],
  others: ['andromeda', 'm31']
};

export const nasaImagesAdapter: CatalogAdapter = {
  id: 'nasa-images',
  async searchByCategory(category: Category, _bbox?: BBox, page = 1, limit = 50) {
    const q = CATEGORY_MAP[category]?.[0] || 'andromeda';
    const params = new URLSearchParams({ q, media_type: 'image', page: String(page) });
    const url = `https://images-api.nasa.gov/search?${params.toString()}`;
    const { data } = await axios.get(url, { timeout: 8000 });
    const items: ObjectSummary[] = (data?.collection?.items || []).slice(0, limit).map((it: any) => {
      const meta = it?.data?.[0];
      const links = it?.links?.[0];
      const id = meta?.nasa_id || meta?.title;
      const title = meta?.title || 'Unknown';
      const thumbUrl = links?.href;
      // Without RA/Dec, we default to Andromeda approximate coords if related, else unknown randomization within bounds for demo
      const ra = 10.6847083; // Andromeda RA deg
      const dec = 41.26875; // Andromeda Dec deg
      return {
        id,
        name: title,
        category,
        ra,
        dec,
        thumbUrl,
        source: 'nasa:images'
      } as ObjectSummary;
    });
    return { items, total: items.length };
  },
  async getById(id: string) {
    const url = `https://images-api.nasa.gov/search?nasa_id=${encodeURIComponent(id)}`;
    const { data } = await axios.get(url, { timeout: 8000 });
    const it = data?.collection?.items?.[0];
    if (!it) {
      return null;
    }
    const meta = it?.data?.[0];
    const links = it?.links?.[0];
    const title = meta?.title || id;
    const thumbUrl = links?.href;
    return {
      id,
      name: title,
      category: 'others',
      ra: 10.6847083,
      dec: 41.26875,
      thumbUrl,
      source: 'nasa:images'
    } as ObjectSummary;
  }
};
