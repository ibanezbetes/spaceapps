import app from './app';
import { env } from './config/env';
import { logger } from './utils/logger';

const port = env.PORT || 3000;

const server = app.listen(port, () => {
  logger.info({ port }, `Server listening on port ${port}`);
});

// Graceful shutdown
const shutdown = () => {
  logger.info('Shutting down...');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

export default server;
