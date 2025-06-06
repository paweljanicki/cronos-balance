import { redisClient, CACHE_TTL } from '../utils/redis';

export const getCache = async <T>(key: string): Promise<T | null> => {
  try {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Cache get error:', error);
    return null;
  }
};

export const setCache = async (key: string, value: any, ttl: number = CACHE_TTL): Promise<void> => {
  try {
    await redisClient.set(key, JSON.stringify(value), {
      EX: ttl,
    });
  } catch (error) {
    console.error('Cache set error:', error);
  }
};

export const generateCacheKey = (prefix: string, ...args: string[]): string => {
  return `${prefix}:${args.join(':')}`;
};
