import { NextApiResponse } from 'next';

interface RateLimitOptions {
  interval: number;
  uniqueTokenPerInterval: number;
}

interface RateLimitStore {
  [key: string]: {
    tokens: number;
    lastReset: number;
  };
}

const store: RateLimitStore = {};

export function rateLimit({ interval, uniqueTokenPerInterval }: RateLimitOptions) {
  return {
    check: (res: NextApiResponse, limit: number, token: string) => {
      const now = Date.now();
      const resetTime = now + interval;

      if (!store[token]) {
        store[token] = {
          tokens: limit - 1,
          lastReset: now,
        };
        return;
      }

      if (now > store[token].lastReset + interval) {
        store[token] = {
          tokens: limit - 1,
          lastReset: now,
        };
        return;
      }

      if (store[token].tokens <= 0) {
        res.setHeader('X-RateLimit-Limit', limit);
        res.setHeader('X-RateLimit-Remaining', 0);
        res.setHeader('X-RateLimit-Reset', resetTime);
        throw new Error('Rate limit exceeded');
      }

      store[token].tokens -= 1;
      res.setHeader('X-RateLimit-Limit', limit);
      res.setHeader('X-RateLimit-Remaining', store[token].tokens);
      res.setHeader('X-RateLimit-Reset', resetTime);
    },
  };
} 