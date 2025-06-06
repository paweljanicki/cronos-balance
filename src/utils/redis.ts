import { createClient } from 'redis';
import { config } from '../config';

export const CACHE_TTL = config.redis.ttl;

// Create Redis client
export const redisClient = createClient({
  username: config.redis.username,
  password: config.redis.password,
  socket: {
    host: config.redis.host,
    port: config.redis.port,
  },
});

// Handle Redis connection events
redisClient.on('error', err => console.error('Redis Client Error:', err));
redisClient.on('connect', () => console.log('Redis Client Connected'));

// Initialize Redis connection
export const initializeRedis = async () => {
  await redisClient.connect();
};
