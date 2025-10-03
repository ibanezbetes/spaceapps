/**
 * Servidor Express principal para Bug Lightyear
 */

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Importar rutas
import searchRouter from './routes/search';
import cutoutsRouter from './routes/cutouts';
import catalogsRouter from './routes/catalogs';

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

// ============================================================================
// Middleware
// ============================================================================

// CORS (permite requests desde frontend)
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

// Logging HTTP
app.use(morgan('dev'));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============================================================================
// Rutas
// ============================================================================

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API routes
app.use('/api/search', searchRouter);
app.use('/api/cutout', cutoutsRouter);
app.use('/api/catalogs', catalogsRouter);

// Metadata endpoint (layers y bookmarks)
app.get('/api/metadata', (req, res) => {
  const layers = require('./data/layers.json');
  res.json(layers);
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint no encontrado',
    path: req.path,
  });
});

// Error handler global
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[ERROR]', err);
  res.status(500).json({
    error: 'Error interno del servidor',
    message: err.message,
  });
});

// ============================================================================
// Iniciar servidor
// ============================================================================

app.listen(PORT, () => {
  console.log('');
  console.log('🚀 Bug Lightyear - Backend');
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log('');
  console.log('📡 Endpoints disponibles:');
  console.log(`   GET  /health                     - Health check`);
  console.log(`   GET  /api/metadata               - Layers y bookmarks`);
  console.log(`   GET  /api/search?q=...           - Búsqueda unificada`);
  console.log(`   GET  /api/cutout/irsa            - IRSA image cutouts`);
  console.log(`   GET  /api/cutout/skyview         - SkyView cutouts`);
  console.log(`   GET  /api/catalogs/cone          - Simple Cone Search`);
  console.log(`   POST /api/catalogs/tap           - TAP ADQL queries`);
  console.log('');
  console.log('🔍 Ejemplos:');
  console.log(`   curl "http://localhost:${PORT}/api/search?q=Cygnus%20X"`);
  console.log(`   curl "http://localhost:${PORT}/api/cutout/skyview?ra=266.41&dec=-29&size=4&survey=DSS2%20Red"`);
  console.log(`   curl "http://localhost:${PORT}/api/catalogs/cone?ra=83.82&dec=-5.39&radius=0.2"`);
  console.log('');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  process.exit(0);
});
