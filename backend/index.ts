import express, { type Response } from 'express';
import type { Request } from 'express';
import { createClient } from 'redis';
import type { RedisClientType } from 'redis';
import { Counter, Registry, collectDefaultMetrics } from 'prom-client';

const app = express();
const PORT = process.env.PORT || 3000;

// Prometheus metrics
const register = new Registry();
collectDefaultMetrics({ register });

const httpRequestCounter = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status'] as const,
  registers: [register],
});

const visitCounter = new Counter({
  name: 'page_visits_total',
  help: 'Total page visits',
  registers: [register],
});

// Redis client
const redisClient: RedisClientType = createClient({
  url: `redis://${process.env.REDIS_HOST || 'localhost'}:6379`,
});

redisClient.connect().catch(console.error);

app.use(express.json());

// Health check
app.get('/health', (req: Request, res: Response) => {
  httpRequestCounter.inc({ method: 'GET', route: '/health', status: 200 });
  res.json({ status: 'healthy', pod: process.env.HOSTNAME });
});

// Get visit count
app.get('/api/visits', async (req: Request, res: Response) => {
  try {
    const visits = (await redisClient.get('visits')) || '0';
    httpRequestCounter.inc({ method: 'GET', route: '/api/visits', status: 200 });
    res.json({ visits: parseInt(visits), pod: process.env.HOSTNAME });
  } catch (error: any) {
    httpRequestCounter.inc({ method: 'GET', route: '/api/visits', status: 500 });
    res.status(500).json({ error: error.message });
  }
});

// Increment visit count
app.post('/api/visits', async (req: Request, res: Response) => {
  try {
    const newCount = await redisClient.incr('visits');
    visitCounter.inc();
    httpRequestCounter.inc({ method: 'POST', route: '/api/visits', status: 200 });
    res.json({ visits: newCount, pod: process.env.HOSTNAME });
  } catch (error: any) {
    httpRequestCounter.inc({ method: 'POST', route: '/api/visits', status: 500 });
    res.status(500).json({ error: error.message });
  }
});

// Prometheus metrics endpoint
app.get('/metrics', async (_req: Request, res: Response) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

app.listen(PORT, () => {
  console.log(`Backend API running on port ${PORT}`);
});
