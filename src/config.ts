import dotenv from 'dotenv';

dotenv.config();

export const config = {
  server: {
    port: process.env.PORT || 3000,
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '600000', 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },
  cronos: {
    apiKey: process.env.CRONOS_EXPLORER_API_KEY || '',
  },
  auth: {
    apiKeys: (process.env.API_KEYS || '').split(',').map(key => key.trim()),
  },
  redis: {
    username: process.env.REDIS_USERNAME || 'default',
    password: process.env.REDIS_PASSWORD || '',
    host: process.env.REDIS_HOST || '',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    ttl: parseInt(process.env.REDIS_TTL || '300', 10),
  },
} as const;

// Type for the config object
export type Config = typeof config;
