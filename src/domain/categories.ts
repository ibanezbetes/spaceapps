import { Category } from './models';

export const CATEGORIES: Category[] = [
  'stars',
  'galaxies',
  'nebulae',
  'clusters',
  'planets',
  'moons',
  'asteroids',
  'comets',
  'star-systems',
  'constellations',
  'others'
];

export const isCategory = (value: string): value is Category => {
  return (CATEGORIES as string[]).includes(value);
};
