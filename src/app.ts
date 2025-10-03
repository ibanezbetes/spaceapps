import express from 'express';
import compression from 'compression';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import { corsMiddleware } from './middleware/cors.middleware';
import { securityMiddleware } from './middleware/security.middleware';
import { errorMiddleware } from './middleware/error.middleware';
import objectsRouter from './routes/objects.routes';
import chatRouter from './routes/chat.routes';
import { logger } from './utils/logger';

const app = express();

// Trust proxy for rate-limiting and IPs if behind proxy
app.set('trust proxy', 1);
app.set('etag', 'strong');

// Core middleware
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(corsMiddleware(cors, env));
app.use(securityMiddleware(helmet));

// Rate limiting
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

// Simple request logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info({ method: req.method, path: req.originalUrl, status: res.statusCode, duration }, 'request');
  });
  next();
});

// Routes
app.use('/objects', objectsRouter);
app.use('/chat', chatRouter);

// Health
app.get('/healthz', (_req, res) => {
  res.json({ ok: true });
});

// Errors
app.use(errorMiddleware);

export default app;
