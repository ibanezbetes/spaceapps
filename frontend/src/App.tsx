import { useState, useEffect, useCallback } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import OpenSeadragon from 'openseadragon';
import { Viewer } from './components/Viewer';
import { CategoryBar } from './components/CategoryBar';
import { ObjectPanel } from './components/ObjectPanel';
import { ChatBox } from './components/ChatBox';
import type { Category } from './lib/types';
import './styles/globals.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      refetchOnWindowFocus: false,
    },
  },
});

function AppContent() {
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([
    'stars',
    'galaxies',
    'nebulae',
  ]);
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [chatObjectId, setChatObjectId] = useState<string | null>(null);
  const [viewerInstance, setViewerInstance] = useState<OpenSeadragon.Viewer | null>(null);

  const handleToggleCategory = useCallback((category: Category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  }, []);

  const handleObjectSelect = useCallback((objectId: string) => {
    setSelectedObjectId(objectId);
  }, []);

  const handleClosePanel = useCallback(() => {
    setSelectedObjectId(null);
  }, []);

  const handleAskAI = useCallback((objectId: string) => {
    setChatObjectId(objectId);
  }, []);

  const handleCloseChat = useCallback(() => {
    setChatObjectId(null);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Number keys 1-9 for category selection
      if (e.key >= '1' && e.key <= '9' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const categoryMap: Category[] = [
          'stars',
          'star-systems',
          'galaxies',
          'nebulae',
          'clusters',
          'constellations',
          'planets',
          'moons',
          'comets',
        ];
        const index = parseInt(e.key, 10) - 1;
        if (index < categoryMap.length) {
          e.preventDefault();
          handleToggleCategory(categoryMap[index]);
        }
      }

      // Escape to close panels
      if (e.key === 'Escape') {
        if (chatObjectId) {
          handleCloseChat();
        } else if (selectedObjectId) {
          handleClosePanel();
        }
      }

      // Arrow keys for viewer navigation
      if (viewerInstance && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        const viewport = viewerInstance.viewport;
        const delta = 0.1;
        const center = viewport.getCenter();

        switch (e.key) {
          case 'ArrowUp':
            viewport.panTo(new OpenSeadragon.Point(center.x, center.y - delta));
            break;
          case 'ArrowDown':
            viewport.panTo(new OpenSeadragon.Point(center.x, center.y + delta));
            break;
          case 'ArrowLeft':
            viewport.panTo(new OpenSeadragon.Point(center.x - delta, center.y));
            break;
          case 'ArrowRight':
            viewport.panTo(new OpenSeadragon.Point(center.x + delta, center.y));
            break;
        }
      }

      // +/- for zoom
      if (viewerInstance && (e.key === '+' || e.key === '=' || e.key === '-')) {
        e.preventDefault();
        const viewport = viewerInstance.viewport;
        const zoomFactor = e.key === '-' ? 0.8 : 1.25;
        viewport.zoomBy(zoomFactor);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    selectedObjectId,
    chatObjectId,
    viewerInstance,
    handleToggleCategory,
    handleClosePanel,
    handleCloseChat,
  ]);

  return (
    <div className="app">
      <CategoryBar
        selectedCategories={selectedCategories}
        onToggleCategory={handleToggleCategory}
      />

      <Viewer
        categories={selectedCategories}
        onObjectSelect={handleObjectSelect}
        onViewerReady={setViewerInstance}
      />

      {selectedObjectId && (
        <ObjectPanel
          objectId={selectedObjectId}
          onClose={handleClosePanel}
          onAskAI={handleAskAI}
        />
      )}

      {chatObjectId && (
        <ChatBox objectId={chatObjectId} onClose={handleCloseChat} />
      )}

      <div className="keyboard-shortcuts" role="complementary" aria-label="Keyboard shortcuts">
        <details>
          <summary>Keyboard Shortcuts</summary>
          <dl>
            <dt>1-9</dt>
            <dd>Toggle category filters</dd>
            <dt>Arrow Keys</dt>
            <dd>Pan the viewer</dd>
            <dt>+/-</dt>
            <dd>Zoom in/out</dd>
            <dt>Escape</dt>
            <dd>Close panels</dd>
          </dl>
        </details>
      </div>
    </div>
  );
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}
