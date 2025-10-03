# Andromeda Gigapixel Explorer - Frontend

React + TypeScript + Vite SPA for exploring a gigapixel image of the Andromeda galaxy with deep zoom, RA/Dec coordinate mapping, object discovery, and AI-powered chat.

## Features

- **OpenSeadragon Deep Zoom Viewer**: Smooth navigation of gigapixel imagery with touch and keyboard controls
- **RA/Dec Coordinate Projection**: Accurate mapping between celestial coordinates and image pixels using gnomonic and equirectangular projections
- **Dynamic Object Discovery**: Automatically fetches celestial objects (stars, galaxies, nebulae, etc.) based on the current viewport bounding box
- **Category Filtering**: Multi-select filters for object types with keyboard shortcuts (1-9)
- **Object Details Panel**: Rich metadata display including coordinates, magnitude, spectral type, redshift, and more
- **AI Chat Integration**: Ask questions about celestial objects with streaming responses via Server-Sent Events (SSE)
- **React Query Caching**: Efficient data fetching with automatic background refetching and cache management
- **Accessibility**: Full keyboard navigation, ARIA labels, focus management, and reduced motion support

## Tech Stack

- **React 18.3** with TypeScript 5.5 (strict mode)
- **Vite 5.4** for fast builds and HMR
- **OpenSeadragon 4.1** for deep zoom tile viewing
- **TanStack React Query 5.59** for server state management
- **Axios** for HTTP requests
- **Vitest + Testing Library** for component testing

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Backend API running on `http://localhost:3000` (see root README)
- Deep zoom tiles for the Andromeda image (see Tile Configuration below)

### Installation

```bash
cd frontend
npm install
```

### Environment Setup

Copy `.env.example` to `.env` and configure:

```env
# Backend API base URL
VITE_API_BASE_URL=http://localhost:3000

# OpenSeadragon tile source URL (must point to DZI/IIIF tiles)
VITE_TILES_URL=http://localhost:8080/andromeda.dzi

# Projection configuration (calibration for your specific image)
VITE_PROJECTION_TYPE=gnomonic
VITE_IMAGE_CENTER_RA=10.6847
VITE_IMAGE_CENTER_DEC=41.269
VITE_IMAGE_WIDTH_PX=20000
VITE_IMAGE_HEIGHT_PX=15000
VITE_PIXEL_SCALE_ARCSEC_PER_PX=0.5

# Optional: Enable SSE for streaming chat responses
VITE_ENABLE_SSE=true
```

### Development

```bash
npm run dev
```

Open http://localhost:5173 in your browser.

### Build

```bash
npm run build
npm run preview  # Preview production build
```

### Testing

```bash
npm test                 # Run tests in watch mode
npm run test:coverage    # Generate coverage report
```

## Tile Configuration

The viewer requires pre-generated deep zoom tiles. You can create these from a large source image using:

1. **OpenSeadragon's Image Creator** (Python): https://github.com/openseadragon/openseadragon-imaging
2. **libvips** (fast C library):
   ```bash
   vips dzsave input.jpg output --suffix .jpg[Q=90]
   ```
3. **IIIF Image Server** (e.g., Cantaloupe, IIPImage)

The tile source can be:
- **DZI format** (Deep Zoom Image): `andromeda.dzi` + `andromeda_files/` directory
- **IIIF endpoint**: `http://iiif.example.com/andromeda/info.json`

Serve tiles via HTTP (e.g., `npx http-server ./tiles -p 8080 --cors`) and set `VITE_TILES_URL` to the DZI or IIIF URL.

## Projection Calibration

The frontend maps celestial coordinates (RA/Dec) to image pixel coordinates. To calibrate:

1. **Identify Reference Point**: Find a known celestial object in your image and note its pixel position (x, y) and celestial coordinates (RA, Dec).
2. **Set Image Center**: Update `VITE_IMAGE_CENTER_RA` and `VITE_IMAGE_CENTER_DEC` to match the reference object's coordinates.
3. **Calculate Pixel Scale**: 
   - Measure the angular distance between two known objects in degrees.
   - Measure the pixel distance between the same objects.
   - Pixel scale (arcsec/px) = (angular distance in degrees × 3600) / pixel distance
   - Set `VITE_PIXEL_SCALE_ARCSEC_PER_PX` to this value.
4. **Choose Projection**:
   - `gnomonic`: Accurate for wide-field images (tangent plane projection)
   - `equirectangular`: Simple linear projection for narrow fields

Test by clicking on known objects—the RA/Dec should match catalog values within ~1 arcminute.

## Architecture

```
src/
├── components/       # React components
│   ├── Viewer.tsx       # OpenSeadragon integration + marker overlays
│   ├── CategoryBar.tsx  # Category filter buttons
│   ├── ObjectPanel.tsx  # Object details sidebar
│   └── ChatBox.tsx      # AI chat interface with SSE
├── hooks/           # Custom React hooks
│   ├── useBboxFromViewport.ts  # Viewport → bbox tracking
│   ├── useObjectsQuery.ts      # React Query for objects/details
│   └── useSSE.ts               # EventSource for streaming
├── lib/            # Core utilities
│   ├── types.ts        # TypeScript type definitions
│   ├── api.ts          # Axios client + API functions
│   ├── projection.ts   # RA/Dec ↔ image coordinate conversion
│   └── utils.ts        # Helpers (debounce, formatting)
├── styles/         # Global CSS
├── config.ts       # App configuration from env
├── App.tsx         # Main app component
└── main.tsx        # React entry point
```

### Data Flow

1. **Viewport Change** → `useBboxFromViewport` → debounced bbox calculation
2. **Bbox Update** → `useObjectsQuery` → fetch from `/objects?category=...&bbox=...`
3. **Objects Response** → `Viewer` → render markers using `skyToImage` projection
4. **Marker Click** → `App` → open `ObjectPanel` → fetch `/objects/:id`
5. **"Ask AI" Click** → `App` → open `ChatBox` → POST `/chat` or SSE `/chat/stream`

## Keyboard Shortcuts

- **1-9**: Toggle category filters (Stars, Galaxies, Nebulae, etc.)
- **Arrow Keys**: Pan the viewer
- **+/-**: Zoom in/out
- **Escape**: Close panels

## API Integration

The frontend expects the following backend endpoints (see `src/lib/api.ts`):

- `GET /objects?category={cat}&bbox={minRa},{minDec},{maxRa},{maxDec}&limit={n}`: Fetch objects in viewport
- `GET /objects/:id`: Fetch detailed metadata for an object
- `POST /chat`: Send a question about an object (JSON response)
- `GET /chat/stream?objectId={id}&question={q}`: Streaming chat via SSE (optional)

See the root README for backend setup.

## Performance Notes

- **Marker Rendering**: Handles 1000+ markers with requestAnimationFrame-based batching
- **Debouncing**: Viewport changes debounced to 300ms to reduce API calls
- **React Query**: Automatic deduplication, caching (60s stale time), and background refetching
- **Lazy Rendering**: Markers outside viewport bounds are not rendered

## Accessibility

- Full keyboard navigation (Tab, Enter, Escape, Arrow keys)
- ARIA labels and roles on all interactive elements
- Focus management (auto-focus on panel open)
- `prefers-reduced-motion` support
- High contrast borders and focus indicators

## Troubleshooting

### Tiles Not Loading
- Verify `VITE_TILES_URL` is accessible (check browser network tab)
- Ensure CORS is enabled on the tile server
- Check DZI format: XML file should reference correct tile format (`.jpg`, `.png`)

### Objects Not Appearing
- Check browser console for API errors
- Verify backend is running on `VITE_API_BASE_URL`
- Ensure projection calibration is accurate (see above)
- Check category filters—at least one category must be selected

### Coordinates Misaligned
- Recalibrate projection parameters (`VITE_IMAGE_CENTER_*`, `VITE_PIXEL_SCALE_*`)
- Verify image dimensions (`VITE_IMAGE_WIDTH_PX`, `VITE_IMAGE_HEIGHT_PX`) match actual image
- Try switching projection type (`gnomonic` ↔ `equirectangular`)

### SSE Chat Not Streaming
- Set `VITE_ENABLE_SSE=true`
- Ensure backend supports `/chat/stream` endpoint
- Check browser console for EventSource errors
- Fallback to POST `/chat` if SSE unavailable

## License

MIT
