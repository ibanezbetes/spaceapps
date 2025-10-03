export type Category =
  | 'stars'
  | 'galaxies'
  | 'nebulae'
  | 'clusters'
  | 'planets'
  | 'moons'
  | 'asteroids'
  | 'comets'
  | 'star-systems'
  | 'constellations'
  | 'others';

export interface BBox {
  minRA: number;
  minDec: number;
  maxRA: number;
  maxDec: number;
}

export interface ObjectSummary {
  id: string;
  name: string;
  category: Category;
  ra: number;
  dec: number;
  magnitude?: number;
  redshift?: number;
  objectType?: string;
  thumbUrl?: string;
  previewUrl?: string;
  source: string;
}

export interface ObjectDetails extends ObjectSummary {
  description?: string;
  spectralType?: string;
  distance_ly_est?: string;
  size_est?: string;
  altNames?: string[];
  sources?: string[];
}

export interface ChatResponse {
  facts: {
    name: string;
    type: string;
    distance_ly: string;
    size_km_or_ly: string;
    coordinates: { ra: number; dec: number };
  };
  funFact: string;
  answer?: string;
  sources?: string[];
}

export interface ObjectsResponse {
  items: ObjectSummary[];
  page: number;
  total: number;
  hasMore: boolean;
}

export interface ViewportBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}
