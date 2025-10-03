import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.string().transform((v) => parseInt(v, 10)).default('3000'),
  OPENAI_API_KEY: z.string().min(1, 'OPENAI_API_KEY is required').optional(),
  LLM_MODEL: z.string().default('gpt-4.1'),
  ENABLE_SSE: z.string().default('true'),
  ENABLE_NASA_HUBBLE: z.string().default('false'),
  MAST_BASE_URL: z.string().optional(),
  CORS_ORIGIN: z.string().optional()
});

const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
  // Do not throw for OPENAI missing during dev/test; warn instead.
  // However, fail hard if other required fields are invalid
  const errors = parsed.error.flatten().fieldErrors;
  const criticalErrors = Object.entries(errors)
    .filter(([k]) => k !== 'OPENAI_API_KEY')
    .flatMap(([, v]) => v || []);
  if (criticalErrors.length) {
    throw new Error(`Invalid environment variables: ${criticalErrors.join(', ')}`);
  }
}

export const env = {
  NODE_ENV: parsed.success ? parsed.data.NODE_ENV : 'development',
  PORT: parsed.success ? (parsed.data.PORT as number) : 3000,
  OPENAI_API_KEY: parsed.success ? parsed.data.OPENAI_API_KEY : process.env.OPENAI_API_KEY,
  LLM_MODEL: parsed.success ? parsed.data.LLM_MODEL : process.env.LLM_MODEL || 'gpt-4.1',
  ENABLE_SSE: (parsed.success ? parsed.data.ENABLE_SSE : process.env.ENABLE_SSE || 'true') === 'true',
  ENABLE_NASA_HUBBLE:
    (parsed.success ? parsed.data.ENABLE_NASA_HUBBLE : process.env.ENABLE_NASA_HUBBLE || 'false') ===
    'true',
  MAST_BASE_URL: parsed.success ? parsed.data.MAST_BASE_URL : process.env.MAST_BASE_URL,
  CORS_ORIGIN: parsed.success ? parsed.data.CORS_ORIGIN : process.env.CORS_ORIGIN
};
