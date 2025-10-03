import { BBox, ObjectSummary } from '../domain/models';

export const pointInBBox = (ra: number, dec: number, bbox: BBox): boolean => {
  const inRA = bbox.minRA <= bbox.maxRA ? ra >= bbox.minRA && ra <= bbox.maxRA : ra >= bbox.minRA || ra <= bbox.maxRA;
  const inDec = dec >= bbox.minDec && dec <= bbox.maxDec;
  return inRA && inDec;
};

export const filterByBBox = (items: ObjectSummary[], bbox: BBox): ObjectSummary[] => {
  return items.filter((i) => pointInBBox(i.ra, i.dec, bbox));
};
