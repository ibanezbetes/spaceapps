import pino from 'pino';

const isProd = process.env.NODE_ENV === 'production';
const isTest = process.env.NODE_ENV === 'test';

export const logger = pino({
  level: isProd ? 'info' : 'debug'
  // Avoid pretty transport in tests to prevent resolver issues
}, isTest ? undefined : pino.destination(1));
