import { useEffect, useRef, useState } from 'react';
import OpenSeadragon from 'openseadragon';
import { config } from '../config';
import { skyToImage } from '../lib/projection';
import { useBboxFromViewport } from '../hooks/useBboxFromViewport';
import { useObjectsQuery } from '../hooks/useObjectsQuery';
import type { Category } from '../lib/types';
import './Viewer.css';

interface ViewerProps {
  categories: Category[];
  onObjectSelect: (id: string) => void;
  onViewerReady: (viewer: OpenSeadragon.Viewer) => void;
}

export function Viewer({ categories, onObjectSelect, onViewerReady }: ViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<OpenSeadragon.Viewer | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  
  // Track viewport bounding box
  const bbox = useBboxFromViewport(viewerRef.current);
  
  // Fetch objects based on categories and bbox
  const { data: objectsResponse } = useObjectsQuery(categories, bbox);
  const objects = objectsResponse?.items || [];
  
  // Initialize OpenSeadragon
  useEffect(() => {
    if (!containerRef.current || viewerRef.current) {
      return;
    }
    
    const viewer = OpenSeadragon({
      element: containerRef.current,
      tileSources: config.tilesUrl,
      prefixUrl: 'https://cdnjs.cloudflare.com/ajax/libs/openseadragon/4.1.0/images/',
      showNavigationControl: true,
      animationTime: 0.5,
      blendTime: 0.1,
      constrainDuringPan: true,
      maxZoomPixelRatio: 2,
      minZoomLevel: 0.8,
      visibilityRatio: 1,
      zoomPerScroll: 1.2,
      gestureSettingsMouse: {
        clickToZoom: false,
      },
    });
    
    viewerRef.current = viewer;
    onViewerReady(viewer);
    
    return () => {
      viewer.destroy();
      viewerRef.current = null;
    };
  }, [onViewerReady]);
  
  // Render markers as overlay
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) {
      return;
    }
    
    // Remove existing overlays
    viewer.clearOverlays();
    
    // Add marker for each object
    objects.forEach((obj) => {
      const imageCoords = skyToImage({ ra: obj.ra, dec: obj.dec });
      
      // Create marker element
      const marker = document.createElement('div');
      marker.className = `object-marker ${obj.id === hoveredId ? 'hovered' : ''}`;
      marker.dataset.id = obj.id;
      marker.dataset.category = obj.category;
      marker.title = `${obj.name} (${obj.category})${obj.magnitude ? ` mag: ${obj.magnitude.toFixed(1)}` : ''}`;
      
      marker.addEventListener('click', (e) => {
        e.stopPropagation();
        onObjectSelect(obj.id);
      });
      
      marker.addEventListener('mouseenter', () => setHoveredId(obj.id));
      marker.addEventListener('mouseleave', () => setHoveredId(null));
      
      viewer.addOverlay({
        element: marker,
        location: new OpenSeadragon.Point(imageCoords.x, imageCoords.y),
        placement: OpenSeadragon.Placement.CENTER,
      });
    });
  }, [objects, hoveredId, onObjectSelect]);
  
  return (
    <div className="viewer-container">
      <div ref={containerRef} className="viewer" />
    </div>
  );
}
