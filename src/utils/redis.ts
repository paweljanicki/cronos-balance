import { createClient } from 'redis';
import { config } from '../config';
import { ExternalAPIError } from './errors';

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

// Initialize Redis connection
export const initializeRedis = async () => {
  try {
    // Set up error handler before connecting
    const connectionPromise = new Promise((resolve, reject) => {
      redisClient.on('error', err => {
        reject(
          new ExternalAPIError(`Redis connection failed: ${err.message}`, 'INITIALIZATION_ERROR')
        );
      });
      redisClient.on('connect', () => {
        console.log('Redis Client Connected');
        resolve(redisClient);
      });
    });

    // Start connection and wait for result
    await Promise.race([redisClient.connect(), connectionPromise]);

    return redisClient;
  } catch (error) {
    throw new ExternalAPIError(
      error instanceof Error ? error.message : 'Failed to initialize Redis',
      'INITIALIZATION_ERROR'
    );
  }
};
