# Astronomy App - Andromeda Gigapixel Explorer

Full-stack TypeScript application for exploring a gigapixel image of the Andromeda galaxy with deep zoom, celestial object discovery, RA/Dec coordinate projection, and AI-powered chat.

## Architecture

- **Backend**: Node.js + Express + TypeScript with OpenAI LLM integration, NASA MAST/Hubble adapter, multi-source aggregation, caching, and SSE support
- **Frontend**: React + TypeScript + Vite SPA with OpenSeadragon deep zoom viewer, coordinate projection, category filtering, and AI chat

## Features

### Backend
- **Multi-Adapter System**: NASA Images API, NASA MAST/Hubble (with feature flag), AEB/INPE (mock), CSA (mock)
- **Intelligent Aggregation**: Position-based deduplication across data sources
- **Rich Metadata**: Normalized schema with RA/Dec, magnitude, redshift, spectral type, distance estimates, alternate names
- **OpenAI Chat**: LLM-powered Q&A about celestial objects with context injection
- **Performance**: LRU caching with TTL, streaming responses (SSE), ETag support
- **Categories**: Stars, star systems, galaxies, nebulae, clusters, constellations, planets, moons, asteroids, comets

### Frontend
- **OpenSeadragon Deep Zoom**: Smooth gigapixel image navigation with touch and keyboard support
- **RA/Dec Projection**: Gnomonic and equirectangular coordinate mapping for accurate sky → image conversion
- **Dynamic Discovery**: Fetches objects based on viewport bounding box with debouncing and caching
- **Category Filters**: Multi-select with keyboard shortcuts (1-9)
- **Object Details Panel**: Rich metadata display with "Ask AI" button
- **AI Chat**: Real-time streaming chat with context about selected objects
- **Accessibility**: Full keyboard navigation, ARIA labels, reduced motion support

## Quick Start

### Prerequisites
- Node.js 18+
- OpenAI API key (for LLM features)
- Optional: NASA MAST API access

### Backend Setup

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env: set OPENAI_API_KEY, optionally ENABLE_NASA_HUBBLE=true

# Run in development
npm run dev

# Run tests
npm test

# Build for production
npm run build
npm start
```

Backend runs on **http://localhost:3000**

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env: set VITE_TILES_URL to your OpenSeadragon tile source

# Run in development
npm run dev

# Build for production
npm run build
npm run preview
```

Frontend runs on **http://localhost:5173**

## Tile Generation

The frontend requires pre-generated deep zoom tiles. Create them from your source image:

**Using libvips** (fast, recommended):
```bash
vips dzsave andromeda.jpg andromeda --suffix .jpg[Q=90]
```

**Using OpenSeadragon Image Creator** (Python):
```bash
pip install deepzoom
python deepzoom.py andromeda.jpg
```

Serve tiles via HTTP:
```bash
npx http-server ./tiles -p 8080 --cors
```

Set `VITE_TILES_URL=http://localhost:8080/andromeda.dzi` in `frontend/.env`

## API Documentation

### GET /objects
Query celestial objects with filters:
```
GET /objects?category=stars,galaxies&bbox=10,40,20,50&limit=100
```

**Query Parameters:**
- `category`: Comma-separated list of categories
- `bbox`: Bounding box as `minRa,minDec,maxRa,maxDec` (degrees)
- `limit`: Max results (default 100)
- `fields`: Sparse fieldset (e.g., `id,name,ra,dec`)

**Response:**
```json
{
  "items": [
    {
      "id": "nasa:NGC 224",
      "name": "Andromeda Galaxy",
      "category": "galaxies",
      "ra": 10.6847,
      "dec": 41.269,
      "magnitude": 3.44,
      "redshift": -0.001,
      "objectType": "Spiral Galaxy",
      "source": "nasa:mast"
    }
  ],
  "total": 1,
  "category": ["galaxies"]
}
```

### GET /objects/:id
Get detailed metadata for a specific object:
```
GET /objects/nasa:NGC%20224
```

**Response:**
```json
{
  "id": "nasa:NGC 224",
  "name": "Andromeda Galaxy",
  "category": "galaxies",
  "ra": 10.6847,
  "dec": 41.269,
  "magnitude": 3.44,
  "description": "The Andromeda Galaxy is a barred spiral galaxy...",
  "redshift": -0.001,
  "spectralType": "Sb",
  "distance_ly_est": "2.5 million ly",
  "size_est": "220,000 ly diameter",
  "altNames": ["M31", "NGC 224"],
  "source": "nasa:mast"
}
```

### POST /chat
Ask AI about a celestial object:
```bash
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{"objectId": "nasa:NGC 224", "question": "What is special about this galaxy?"}'
```

**Response:**
```json
{
  "facts": [
    "Closest major galaxy to the Milky Way",
    "Visible to the naked eye",
    "On collision course with the Milky Way"
  ],
  "funFact": "Andromeda will merge with the Milky Way in ~4.5 billion years!",
  "answer": "The Andromeda Galaxy is special because..."
}
```

### GET /chat/stream (SSE)
Streaming chat responses:
```
GET /chat/stream?objectId=nasa:NGC%20224&question=Tell%20me%20about%20this%20galaxy
```

Returns Server-Sent Events with progressive LLM output.

## Environment Variables

### Backend (.env)
```env
PORT=3000
NODE_ENV=development

# OpenAI (required for chat)
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4-turbo-preview

# NASA MAST adapter (optional, feature-flagged)
ENABLE_NASA_HUBBLE=true
MAST_BASE_URL=https://mast.stsci.edu

# Cache settings
CACHE_MAX_SIZE=500
CACHE_TTL_MS=300000

# Logging
LOG_LEVEL=info
```

### Frontend (frontend/.env)
```env
# Backend API
VITE_API_BASE_URL=http://localhost:3000

# OpenSeadragon tiles
VITE_TILES_URL=http://localhost:8080/andromeda.dzi

# Projection calibration (adjust for your image)
VITE_PROJECTION_TYPE=gnomonic
VITE_IMAGE_CENTER_RA=10.6847
VITE_IMAGE_CENTER_DEC=41.269
VITE_IMAGE_WIDTH_PX=20000
VITE_IMAGE_HEIGHT_PX=15000
VITE_PIXEL_SCALE_ARCSEC_PER_PX=0.5

# Features
VITE_ENABLE_SSE=true
```

## Project Structure

```
├── src/                    # Backend source
│   ├── config/            # Environment + config
│   ├── domain/            # Domain models + categories
│   ├── services/          # Business logic
│   │   └── adapters/      # Data source adapters
│   ├── controllers/       # HTTP handlers
│   ├── routes/            # Express routes
│   ├── middleware/        # Express middleware
│   └── server.ts          # Entry point
├── test/                  # Backend tests
├── frontend/              # Frontend SPA
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── hooks/         # Custom hooks
│   │   ├── lib/           # Core utilities
│   │   └── styles/        # Global CSS
│   └── README.md          # Frontend docs
└── README.md              # This file
```

## Testing

### Backend
```bash
npm test                    # Run all tests
npm run test:watch          # Watch mode
npm run test:coverage       # Coverage report
```

**Test Suites:**
- Unit tests: NASA adapters, cache service, LLM service
- E2E tests: `/objects` and `/chat` endpoints with supertest

### Frontend
```bash
cd frontend
npm test                    # Run all tests
npm run test:coverage       # Coverage report
```

**Test Coverage:**
- Component tests: Viewer, CategoryBar, ObjectPanel, ChatBox
- Hook tests: useBboxFromViewport, useObjectsQuery
- Projection utility tests: skyToImage, imageToSky accuracy

## Development Workflow

1. **Start Backend**:
   ```bash
   npm run dev  # Runs on :3000 with hot reload
   ```

2. **Start Frontend**:
   ```bash
   cd frontend && npm run dev  # Runs on :5173 with HMR
   ```

3. **Test Changes**:
   - Backend: `npm test`
   - Frontend: `cd frontend && npm test`

4. **Build for Production**:
   ```bash
   npm run build             # Backend to dist/
   cd frontend && npm run build  # Frontend to dist/
   ```

## Deployment

### Backend
- Build: `npm run build`
- Run: `NODE_ENV=production node dist/server.js`
- Environment: Set all required env vars (OPENAI_API_KEY, etc.)

### Frontend
- Build: `cd frontend && npm run build`
- Serve: Use any static file server (Nginx, Caddy, Vercel, Netlify)
- Environment: Vite inlines `VITE_*` vars at build time—set before building

### Tiles
- Host tiles on CDN or static server with CORS enabled
- Update `VITE_TILES_URL` to CDN URL

## Troubleshooting

### Backend Issues
- **OpenAI errors**: Check `OPENAI_API_KEY` is valid and has credits
- **NASA MAST timeout**: Set `ENABLE_NASA_HUBBLE=false` to disable
- **Empty results**: Check bbox coordinates (RA: 0-360, Dec: -90 to 90)

### Frontend Issues
- **Tiles not loading**: Verify `VITE_TILES_URL` is accessible, CORS enabled
- **Objects not appearing**: Check browser console for API errors, verify backend is running
- **Coordinates misaligned**: Recalibrate projection params in `.env` (see frontend/README.md)

## License

MIT

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Run tests: `npm test` (backend) and `cd frontend && npm test`
4. Commit changes: `git commit -am 'Add my feature'`
5. Push: `git push origin feature/my-feature`
6. Open a Pull Request

## Roadmap

- [ ] Real-time multi-user collaboration (WebSockets)
- [ ] User annotations and bookmarks
- [ ] Export to FITS/CSV
- [ ] Mobile app (React Native)
- [ ] Additional data sources (ESA, JAXA)
- [ ] Advanced filters (magnitude range, redshift, spectral class)
- [ ] 3D visualization mode
