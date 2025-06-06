import rateLimit from 'express-rate-limit';
import { config } from '../config';

export const rateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: {
    error: 'Too many requests, please try again later.',
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  keyGenerator: req => {
    // Use API key as the key for rate limiting
    return req.header('X-API-Key') || 'unknown';
  },
  skip: req => {
    // Skip rate limiting if no API key is provided (will be caught by auth middleware)
    return !req.header('X-API-Key');
  },
});
