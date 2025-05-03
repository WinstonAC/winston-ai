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

export default function rateLimit({ interval, uniqueTokenPerInterval }: RateLimitOptions) {
  return {
    check: (res: NextApiResponse, limit: number, token: string) =>
      new Promise<void>((resolve, reject) => {
        const now = Date.now();
        const resetTime = (store[token]?.lastReset || 0) + interval;

        if (now > resetTime) {
          store[token] = {
            tokens: limit - 1,
            lastReset: now,
          };
          return resolve();
        }

        if (!store[token]) {
          store[token] = {
            tokens: limit - 1,
            lastReset: now,
          };
          return resolve();
        }

        if (store[token].tokens <= 0) {
          res.setHeader('X-RateLimit-Limit', limit);
          res.setHeader('X-RateLimit-Remaining', 0);
          res.setHeader('X-RateLimit-Reset', resetTime);
          return reject(new Error('Rate limit exceeded'));
        }

        store[token].tokens -= 1;
        res.setHeader('X-RateLimit-Limit', limit);
        res.setHeader('X-RateLimit-Remaining', store[token].tokens);
        res.setHeader('X-RateLimit-Reset', resetTime);
        return resolve();
      }),
  };
} 