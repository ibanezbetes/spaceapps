# Quick Start Guide

Get the Andromeda Gigapixel Explorer running in 5 minutes!

## Prerequisites

- ✅ Node.js 18+ installed
- ✅ OpenAI API key (for chat features)
- ✅ Gigapixel image tiles (see step 3)

## Step 1: Backend Setup (2 minutes)

```bash
# Clone or navigate to project root
cd spaceapps

# Install dependencies
npm install

# Configure environment
cp .env.example .env

# Edit .env and add your OpenAI API key:
# OPENAI_API_KEY=sk-proj-your-key-here
# ENABLE_NASA_HUBBLE=true

# Start backend
npm run dev
```

✅ Backend now running on **http://localhost:3000**

Test it:
```bash
curl http://localhost:3000/objects?category=stars&limit=5
```

## Step 2: Frontend Setup (1 minute)

```bash
# In a new terminal, navigate to frontend
cd frontend

# Dependencies already installed ✅
# (If not: npm install)

# Configure environment
cp .env.example .env

# Edit .env - for now, use default tiles:
# VITE_API_BASE_URL=http://localhost:3000
# VITE_TILES_URL=https://openseadragon.github.io/example-images/highsmith/highsmith.dzi
```

## Step 3: Generate Tiles for Your Image (Optional)

If you have a gigapixel Andromeda image:

### Option A: Using libvips (fast, recommended)
```bash
# Install libvips (Ubuntu/Debian)
sudo apt install libvips-tools

# Or macOS
brew install vips

# Generate tiles
vips dzsave your-andromeda-image.jpg andromeda --suffix .jpg[Q=90]

# Serve tiles
npx http-server . -p 8080 --cors

# Update frontend/.env:
# VITE_TILES_URL=http://localhost:8080/andromeda.dzi
```

### Option B: Using Python
```bash
pip install deepzoom
python -m deepzoom your-andromeda-image.jpg andromeda
npx http-server . -p 8080 --cors
```

### Option C: Use Demo Tiles
For testing, the default config uses OpenSeadragon's demo tiles (no Andromeda, but works!).

## Step 4: Start Frontend (30 seconds)

```bash
# From frontend/ directory
npm run dev
```

✅ Frontend now running on **http://localhost:5173**

## Step 5: Explore! 🚀

1. Open http://localhost:5173 in your browser
2. Click category buttons (or press 1-9) to filter object types
3. Pan/zoom the viewer (mouse or keyboard arrows, +/-)
4. Click on markers to see object details
5. Click "Ask AI" to chat about the object

## Keyboard Shortcuts

- **1-9**: Toggle categories (Stars, Galaxies, Nebulae, etc.)
- **Arrow Keys**: Pan the viewer
- **+/-**: Zoom in/out
- **Escape**: Close panels

## Troubleshooting

### "Cannot connect to backend"
- Check backend is running on port 3000
- Verify `VITE_API_BASE_URL=http://localhost:3000` in frontend/.env

### "No objects appearing"
- Check browser console for errors
- Ensure at least one category is selected (blue highlight)
- Try panning/zooming - objects load based on viewport

### "Tiles not loading"
- Verify `VITE_TILES_URL` is accessible
- Check CORS is enabled on tile server
- Try default tiles: `https://openseadragon.github.io/example-images/highsmith/highsmith.dzi`

### "AI chat not working"
- Verify `OPENAI_API_KEY` is set in backend .env
- Check OpenAI API has credits available
- Look at backend console for error messages

## What's Next?

### Customize Projection for Your Image
Edit `frontend/.env`:
```env
# Find a known star in your image, note its pixel position and RA/Dec
VITE_IMAGE_CENTER_RA=10.6847      # RA of center object (degrees)
VITE_IMAGE_CENTER_DEC=41.269      # Dec of center object (degrees)
VITE_IMAGE_WIDTH_PX=20000         # Your image width in pixels
VITE_IMAGE_HEIGHT_PX=15000        # Your image height in pixels
VITE_PIXEL_SCALE_ARCSEC_PER_PX=0.5  # Angular size per pixel
```

See `frontend/README.md` for detailed calibration guide.

### Run Tests
```bash
# Backend tests
npm test

# Frontend tests
cd frontend && npm test
```

### Build for Production
```bash
# Backend
npm run build
NODE_ENV=production node dist/server.js

# Frontend
cd frontend
npm run build
npx http-server dist -p 5173
```

## Architecture Overview

```
┌─────────────────┐
│   Browser       │
│  (React SPA)    │
└────────┬────────┘
         │ HTTP/SSE
         ↓
┌─────────────────┐      ┌──────────────┐
│  Express API    │ ←──→ │  OpenAI LLM  │
│  (Node + TS)    │      └──────────────┘
└────────┬────────┘
         │
    ┌────┴────┬─────────┬─────────┐
    ↓         ↓         ↓         ↓
┌────────┐ ┌──────┐ ┌──────┐ ┌──────┐
│  NASA  │ │ MAST │ │ INPE │ │ CSA  │
│ Images │ │ /HST │ │(mock)│ │(mock)│
└────────┘ └──────┘ └──────┘ └──────┘
```

## Resources

- **Full Documentation**: `README.md`
- **Frontend Guide**: `frontend/README.md`
- **Completion Summary**: `COMPLETION_SUMMARY.md`
- **API Examples**: See `README.md` → API Documentation section

## Support

- Check `README.md` Troubleshooting section
- Review browser console and backend logs for errors
- Ensure all environment variables are set correctly

---

**You're all set!** Enjoy exploring the cosmos! 🌌
