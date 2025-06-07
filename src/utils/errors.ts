/**
 * Base error class for application errors
 */
export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/**
 * Error for external API-related issues
 */
export class ExternalAPIError extends AppError {
  constructor(message: string, code: string = 'EXTERNAL_API_ERROR') {
    super(message, code);
    this.name = 'ExternalAPIError';
  }
}

/**
 * Error for network-related issues
 */
export class NetworkError extends AppError {
  constructor(message: string, code: string = 'NETWORK_ERROR') {
    super(message, code);
    this.name = 'NetworkError';
  }
}

/**
 * Error for validation issues
 */
export class ValidationError extends AppError {
  constructor(message: string, code: string = 'VALIDATION_ERROR') {
    super(message, code);
    this.name = 'ValidationError';
  }
}

/**
 * Error for cache-related issues
 */
export class CacheError extends AppError {
  constructor(message: string, code: string = 'CACHE_ERROR') {
    super(message, code);
    this.name = 'CacheError';
  }
}

/**
 * Error for authentication-related issues
 */
export class AuthError extends AppError {
  constructor(message: string, code: string = 'AUTH_ERROR') {
    super(message, code);
    this.name = 'AuthError';
  }
}
