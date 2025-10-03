import { useEffect, useState, useCallback, useRef } from 'react';
import type OpenSeadragon from 'openseadragon';
import { viewportToBBox } from '../lib/projection';
import { debounce } from '../lib/utils';
import type { BBox } from '../lib/types';

export function useBboxFromViewport(viewer: OpenSeadragon.Viewer | null, debounceMs = 300) {
  const [bbox, setBBox] = useState<BBox | null>(null);
  const bboxRef = useRef<BBox | null>(null);
  
  const updateBBox = useCallback(() => {
    if (!viewer) {
      return;
    }
    
    const bounds = viewer.viewport.getBounds();
    const viewportBounds = {
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      height: bounds.height,
    };
    
    const newBBox = viewportToBBox(viewportBounds);
    
    // Only update if bbox changed significantly (avoid micro-updates)
    const changed =
      !bboxRef.current ||
      Math.abs(newBBox.minRA - bboxRef.current.minRA) > 0.001 ||
      Math.abs(newBBox.maxRA - bboxRef.current.maxRA) > 0.001 ||
      Math.abs(newBBox.minDec - bboxRef.current.minDec) > 0.001 ||
      Math.abs(newBBox.maxDec - bboxRef.current.maxDec) > 0.001;
    
    if (changed) {
      bboxRef.current = newBBox;
      setBBox(newBBox);
    }
  }, [viewer]);
  
  const debouncedUpdate = useCallback(debounce(updateBBox, debounceMs), [updateBBox, debounceMs]);
  
  useEffect(() => {
    if (!viewer) {
      return;
    }
    
    // Initial bbox
    updateBBox();
    
    // Listen to viewport changes
    viewer.addHandler('animation', debouncedUpdate);
    viewer.addHandler('zoom', debouncedUpdate);
    viewer.addHandler('pan', debouncedUpdate);
    
    return () => {
      viewer.removeHandler('animation', debouncedUpdate);
      viewer.removeHandler('zoom', debouncedUpdate);
      viewer.removeHandler('pan', debouncedUpdate);
    };
  }, [viewer, updateBBox, debouncedUpdate]);
  
  return bbox;
}
