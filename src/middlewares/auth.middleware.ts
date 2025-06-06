import { Request, Response, NextFunction } from 'express';
import { config } from '../config';

export const validateApiKey = (req: Request, res: Response, next: NextFunction): void => {
  const apiKey = req.header('X-API-Key');

  if (!apiKey) {
    res.status(401).json({ error: 'API key is required' });
    return;
  }

  if (!config.auth.apiKeys.includes(apiKey)) {
    res.status(403).json({ error: 'Invalid API key' });
    return;
  }

  next();
};
