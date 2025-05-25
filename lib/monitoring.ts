import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';

// Simple in-memory metrics storage
const metrics: {
  performance: Record<string, number[]>;
  errors: Array<{ message: string; timestamp: Date }>;
  api: Record<string, { count: number; avgResponseTime: number }>;
} = {
  performance: {},
  errors: [],
  api: {}
};

export async function trackPerformance(metric: string, value: number) {
  if (!metrics.performance[metric]) {
    metrics.performance[metric] = [];
  }
  metrics.performance[metric].push(value);
}

export async function logError(message: string) {
  metrics.errors.push({
    message,
    timestamp: new Date()
  });
}

export async function trackApiCall(endpoint: string, responseTime: number) {
  if (!metrics.api[endpoint]) {
    metrics.api[endpoint] = { count: 0, avgResponseTime: 0 };
  }
  const current = metrics.api[endpoint];
  current.count++;
  current.avgResponseTime = (current.avgResponseTime * (current.count - 1) + responseTime) / current.count;
}

export async function getMetrics() {
  return {
    performance: Object.entries(metrics.performance).reduce((acc, [key, values]) => ({
      ...acc,
      [key]: {
        avg: values.reduce((sum, val) => sum + val, 0) / values.length,
        min: Math.min(...values),
        max: Math.max(...values)
      }
    }), {}),
    errors: metrics.errors,
    api: metrics.api
  };
}

// API route for monitoring
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });

  if (req.method === 'POST') {
    const { type, data } = req.body;

    switch (type) {
      case 'performance':
        await trackPerformance(data.metric, data.value);
        break;
      case 'error':
        await logError(data.message);
        break;
      case 'api':
        await trackApiCall(data.endpoint, data.responseTime);
        break;
    }

    return res.status(200).json({ success: true });
  }

  if (req.method === 'GET') {
    const { type } = req.query;

    let data;
    switch (type) {
      case 'performance':
        data = await getMetrics();
        break;
      case 'error':
        data = metrics.errors;
        break;
      case 'api':
        data = metrics.api;
        break;
    }

    return res.status(200).json(data);
  }

  return res.status(405).json({ error: 'Method not allowed' });
} 