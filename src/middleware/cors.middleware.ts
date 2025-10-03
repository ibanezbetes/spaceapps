import type { CorsOptions } from 'cors';
import type cors from 'cors';
import { env } from '../config/env';

export function corsMiddleware(corsLib: typeof cors, _env = env) {
  const origin = _env.CORS_ORIGIN || '*';
  const options: CorsOptions = {
    origin: origin === '*' ? true : origin.split(','),
    credentials: false,
    maxAge: 600
  };
  return corsLib(options);
}
