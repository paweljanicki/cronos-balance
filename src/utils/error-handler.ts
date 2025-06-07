import { Response, NextFunction } from 'express';
import { AppError, ExternalAPIError, NetworkError, ValidationError, CacheError } from './errors';

/**
 * Maps error types to appropriate HTTP status codes
 */
export const getStatusCode = (error: AppError): number => {
  if (error instanceof ExternalAPIError) {
    switch (error.code) {
      case 'EXTERNAL_API_ERROR':
        return 502; // Bad Gateway
      case 'NON_RETRYABLE_ERROR':
        return 400; // Bad Request
      case 'UNKNOWN_ERROR':
        return 500; // Internal Server Error
      default:
        return 500;
    }
  }

  if (error instanceof NetworkError) {
    return 503; // Service Unavailable
  }

  if (error instanceof ValidationError) {
    return 400; // Bad Request
  }

  if (error instanceof CacheError) {
    return 503; // Service Unavailable
  }

  return 500; // Internal Server Error
};

/**
 * Formats error response
 */
export const formatErrorResponse = (error: AppError) => ({
  error: error.message,
});

/**
 * Handles errors in Express controllers
 */
export const handleControllerError = (
  error: unknown,
  res: Response,
  next: NextFunction,
  context: string
) => {
  if (error instanceof AppError) {
    // Set status code on the response object for the error logger
    res.status(getStatusCode(error));
  } else {
    // For unknown errors, set 500
    res.status(500);
  }
  // Pass the error to the next error handling middleware
  next(error);
};
