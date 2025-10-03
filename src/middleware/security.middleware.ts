import type helmet from 'helmet';

export function securityMiddleware(helmetLib: typeof helmet) {
  return helmetLib({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  });
}
