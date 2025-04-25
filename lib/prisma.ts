import { PrismaClient } from '@prisma/client';
import { env } from './env-loader';

declare global {
  var prisma: PrismaClient | undefined;
}

// Log database URL (without password) for debugging
const dbUrl = new URL(env.DATABASE_URL);
console.log('Database connection:', {
  protocol: dbUrl.protocol,
  host: dbUrl.host,
  database: dbUrl.pathname,
  user: dbUrl.username,
});

export const prisma = global.prisma || new PrismaClient({
  log: ['query', 'error', 'warn'],
  datasources: {
    db: {
      url: env.DATABASE_URL,
    },
  },
});

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
} 