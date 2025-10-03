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
  minRA: number; // degrees [0,360)
  minDec: number; // degrees [-90,90]
  maxRA: number; // degrees [0,360)
  maxDec: number; // degrees [-90,90]
}

export interface ObjectSummary {
  id: string;
  name: string;
  category: Category;
  ra: number; // Right Ascension in degrees
  dec: number; // Declination in degrees
  magnitude?: number;
  redshift?: number;
  objectType?: string;
  thumbUrl?: string;
  previewUrl?: string;
  source: 'nasa:mast' | 'nasa:hst' | string;
}

export interface ObjectDetails extends ObjectSummary {
  description?: string;
  spectralType?: string;
  distance_ly_est?: string;
  size_est?: string;
  altNames?: string[];
  sources?: string[]; // provenance strings or URLs
}

export interface ChatResponse {
  facts: {
    name: string;
    type: string;
    distance_ly: string; // ~value|range|unknown
    size_km_or_ly: string; // ~value|range|unknown
    coordinates: { ra: number; dec: number };
  };
  funFact: string;
  answer?: string;
  sources?: string[];
}
