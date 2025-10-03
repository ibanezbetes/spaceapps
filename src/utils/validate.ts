import { z } from 'zod';

export function parseOrThrow<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const res = schema.safeParse(data);
  if (!res.success) {
    throw new Error('Validation error');
  }
  return res.data;
}
