import { Request, Response, NextFunction } from 'express';
import { config } from '../config';
import { AuthError } from '../utils/errors';

export const validateApiKey = (req: Request, res: Response, next: NextFunction): void => {
  const apiKey = req.header('X-API-Key');

  if (!apiKey) {
    next(new AuthError('API key is required', 'MISSING_API_KEY'));
    return;
  }

  if (!config.auth.apiKeys.includes(apiKey)) {
    next(new AuthError('Invalid API key', 'INVALID_API_KEY'));
    return;
  }

  next();
};
