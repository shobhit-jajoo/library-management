import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('3000').transform((val) => parseInt(val, 10)),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 characters'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  SESSION_INACTIVITY_MINUTES: z.string().default('15').transform((val) => parseInt(val, 10)),
  CORS_ORIGIN: z.string().default('*'),
  RATE_LIMIT_WINDOW_MS: z.string().default('900000').transform((val) => parseInt(val, 10)),
  RATE_LIMIT_MAX: z.string().default('1000').transform((val) => parseInt(val, 10)),
  SEED_ADMIN_EMAIL: z.string().email().default('admin@library.local'),
  SEED_ADMIN_PASSWORD: z.string().default('AdminPassword123!'),
  SEED_LIBRARIAN_PASSWORD: z.string().default('LibrarianPassword123!'),
  SEED_USER_PASSWORD: z.string().default('UserPassword123!'),
});

const parseEnv = () => {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error('FATAL: Environment validation failed:', result.error.format());
    process.exit(1);
  }
  return result.data;
};

export const env = parseEnv();
