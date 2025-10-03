import { config } from '../config';
import type { BBox, ViewportBounds } from './types';

/**
 * RA/Dec <-> Image Coordinate Projection
 * 
 * Supports gnomonic (tangent plane) and equirectangular projections.
 * Calibrate via config.projection params to match your actual tile pyramid.
 */

export interface Point {
  x: number;
  y: number;
}

export interface SkyCoord {
  ra: number;  // degrees
  dec: number; // degrees
}

const DEG_TO_RAD = Math.PI / 180;
const RAD_TO_DEG = 180 / Math.PI;

/**
 * Convert RA/Dec (sky coords) to normalized image coordinates [0,1]
 */
export function skyToImage(sky: SkyCoord): Point {
  const { centerRA, centerDec, scale, rotation } = config.projection;
  const projType = config.defaultProjection;
  
  if (projType === 'gnomonic') {
    return gnomonicSkyToImage(sky, centerRA, centerDec, scale, rotation);
  } else {
    return equirectangularSkyToImage(sky, centerRA, centerDec, scale, rotation);
  }
}

/**
 * Convert normalized image coords [0,1] to RA/Dec
 */
export function imageToSky(point: Point): SkyCoord {
  const { centerRA, centerDec, scale, rotation } = config.projection;
  const projType = config.defaultProjection;
  
  if (projType === 'gnomonic') {
    return gnomonicImageToSky(point, centerRA, centerDec, scale, rotation);
  } else {
    return equirectangularImageToSky(point, centerRA, centerDec, scale, rotation);
  }
}

/**
 * Convert viewport bounds to sky bbox
 */
export function viewportToBBox(viewport: ViewportBounds): BBox {
  const topLeft = imageToSky({ x: viewport.x, y: viewport.y });
  const bottomRight = imageToSky({
    x: viewport.x + viewport.width,
    y: viewport.y + viewport.height,
  });
  
  return {
    minRA: Math.min(topLeft.ra, bottomRight.ra),
    maxRA: Math.max(topLeft.ra, bottomRight.ra),
    minDec: Math.min(topLeft.dec, bottomRight.dec),
    maxDec: Math.max(topLeft.dec, bottomRight.dec),
  };
}

// Gnomonic (tangent plane) projection
function gnomonicSkyToImage(
  sky: SkyCoord,
  centerRA: number,
  centerDec: number,
  scale: number,
  rotation: number
): Point {
  const ra = sky.ra * DEG_TO_RAD;
  const dec = sky.dec * DEG_TO_RAD;
  const ra0 = centerRA * DEG_TO_RAD;
  const dec0 = centerDec * DEG_TO_RAD;
  
  const cosDec = Math.cos(dec);
  const sinDec = Math.sin(dec);
  const cosDec0 = Math.cos(dec0);
  const sinDec0 = Math.sin(dec0);
  const dRA = ra - ra0;
  
  const denominator = sinDec0 * sinDec + cosDec0 * cosDec * Math.cos(dRA);
  
  let xi = (cosDec * Math.sin(dRA)) / denominator;
  let eta = (cosDec0 * sinDec - sinDec0 * cosDec * Math.cos(dRA)) / denominator;
  
  // Apply rotation
  if (rotation !== 0) {
    const rotRad = rotation * DEG_TO_RAD;
    const cosRot = Math.cos(rotRad);
    const sinRot = Math.sin(rotRad);
    const xiRot = xi * cosRot - eta * sinRot;
    const etaRot = xi * sinRot + eta * cosRot;
    xi = xiRot;
    eta = etaRot;
  }
  
  // Convert to pixels (scale is arcsec/pixel)
  const pixelX = (xi * RAD_TO_DEG * 3600) / scale;
  const pixelY = -(eta * RAD_TO_DEG * 3600) / scale; // negative for image coords
  
  // Normalize to [0,1]
  return {
    x: 0.5 + pixelX / config.imageWidth,
    y: 0.5 + pixelY / config.imageHeight,
  };
}

function gnomonicImageToSky(
  point: Point,
  centerRA: number,
  centerDec: number,
  scale: number,
  rotation: number
): SkyCoord {
  // Denormalize
  const pixelX = (point.x - 0.5) * config.imageWidth;
  const pixelY = (point.y - 0.5) * config.imageHeight;
  
  // Convert to tangent plane coords
  let xi = (pixelX * scale) / (3600 * RAD_TO_DEG);
  let eta = -(pixelY * scale) / (3600 * RAD_TO_DEG);
  
  // Reverse rotation
  if (rotation !== 0) {
    const rotRad = -rotation * DEG_TO_RAD;
    const cosRot = Math.cos(rotRad);
    const sinRot = Math.sin(rotRad);
    const xiRot = xi * cosRot - eta * sinRot;
    const etaRot = xi * sinRot + eta * cosRot;
    xi = xiRot;
    eta = etaRot;
  }
  
  const ra0 = centerRA * DEG_TO_RAD;
  const dec0 = centerDec * DEG_TO_RAD;
  const rho = Math.sqrt(xi * xi + eta * eta);
  const c = Math.atan(rho);
  
  const dec = Math.asin(Math.cos(c) * Math.sin(dec0) + (eta * Math.sin(c) * Math.cos(dec0)) / rho);
  const ra = ra0 + Math.atan2(xi * Math.sin(c), rho * Math.cos(dec0) * Math.cos(c) - eta * Math.sin(dec0) * Math.sin(c));
  
  return {
    ra: ra * RAD_TO_DEG,
    dec: dec * RAD_TO_DEG,
  };
}

// Equirectangular projection (simpler, less accurate at poles)
function equirectangularSkyToImage(
  sky: SkyCoord,
  centerRA: number,
  centerDec: number,
  scale: number,
  _rotation: number
): Point {
  const dRA = sky.ra - centerRA;
  const dDec = sky.dec - centerDec;
  
  const pixelX = (dRA * 3600) / scale;
  const pixelY = -(dDec * 3600) / scale;
  
  return {
    x: 0.5 + pixelX / config.imageWidth,
    y: 0.5 + pixelY / config.imageHeight,
  };
}

function equirectangularImageToSky(
  point: Point,
  centerRA: number,
  centerDec: number,
  scale: number,
  _rotation: number
): SkyCoord {
  const pixelX = (point.x - 0.5) * config.imageWidth;
  const pixelY = (point.y - 0.5) * config.imageHeight;
  
  const dRA = (pixelX * scale) / 3600;
  const dDec = -(pixelY * scale) / 3600;
  
  return {
    ra: centerRA + dRA,
    dec: centerDec + dDec,
  };
}
