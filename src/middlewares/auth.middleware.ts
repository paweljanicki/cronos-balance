import { Request, Response, NextFunction } from 'express';
import { config } from '../config';
import { AuthError } from '../utils/errors';
import { handleControllerError } from '../utils/error-handler';

export const validateApiKey = (req: Request, res: Response, next: NextFunction): void => {
  const apiKey = req.header('X-API-Key');

  if (!apiKey) {
    handleControllerError(
      new AuthError('API key is required', 'MISSING_API_KEY'),
      res,
      next,
      'validateApiKey'
    );
    return;
  }

  if (!config.auth.apiKeys.includes(apiKey)) {
    handleControllerError(
      new AuthError('Invalid API key', 'INVALID_API_KEY'),
      res,
      next,
      'validateApiKey'
    );
    return;
  }

  next();
};
