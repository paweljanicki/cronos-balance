import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';

/**
 * Middleware to log detailed error information
 */
export const errorLogger = (error: unknown, req: Request, res: Response, next: NextFunction) => {
  const errorDetails = {
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method,
    query: req.query,
    params: req.params,
    headers: {
      ...req.headers,
      // Remove sensitive headers
      authorization: req.headers.authorization ? '[REDACTED]' : undefined,
      'x-api-key': req.headers['x-api-key'] ? '[REDACTED]' : undefined,
    },
    error:
      error instanceof AppError
        ? {
            message: error.message,
            code: error.code,
            type: error.name,
            stack: error.stack,
          }
        : {
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
          },
  };

  // Log the full error details
  console.error('Error details:', JSON.stringify(errorDetails, null, 2));

  next(error);
};
