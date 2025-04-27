import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
console.log('Loading environment variables from:', envPath);
dotenv.config({ path: envPath });

// Log raw environment variables for debugging
console.log('Raw environment variables:', {
  NODE_ENV: process.env.NODE_ENV,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  DATABASE_URL: process.env.DATABASE_URL,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
});

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  NEXTAUTH_URL: z.string().url().default('http://localhost:3000'),
  NEXTAUTH_SECRET: z.string().min(1, 'NEXTAUTH_SECRET is required'),
  GOOGLE_CLIENT_ID: z.string().min(1, 'GOOGLE_CLIENT_ID is required'),
  GOOGLE_CLIENT_SECRET: z.string().min(1, 'GOOGLE_CLIENT_SECRET is required'),
});

// Validate environment variables
const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Invalid environment variables:', _env.error.format());
  throw new Error('Invalid environment variables. Please check your .env.local file and make sure all required variables are set.');
}

// Export validated environment variables
export const env = _env.data; 