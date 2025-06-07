import pRetry, { AbortError } from 'p-retry';
import { ExternalAPIError, NetworkError } from './errors';

// Error types that should trigger a retry
const RETRYABLE_ERROR_PATTERNS = [
  'network',
  'timeout',
  'connection',
  'socket',
  'ECONNREFUSED',
  'ECONNRESET',
  'ETIMEDOUT',
  'ENOTFOUND',
  'EAI_AGAIN',
  'temporary',
  'temporarily',
  'retry',
  'rate limit',
  'too many requests',
  'service unavailable',
  'bad gateway',
  'gateway timeout',
];

// Error types that should NOT trigger a retry
const NON_RETRYABLE_ERROR_PATTERNS = [
  'invalid address',
  'invalid parameter',
  'unauthorized',
  'forbidden',
  'not found',
  'validation',
];

/**
 * Determines if an error should trigger a retry
 */
const shouldRetry = (error: unknown): boolean => {
  if (!(error instanceof Error)) {
    return false;
  }

  const errorMessage = error.message.toLowerCase();

  // First check if it's a non-retryable error
  if (NON_RETRYABLE_ERROR_PATTERNS.some(pattern => errorMessage.includes(pattern.toLowerCase()))) {
    return false;
  }

  // Then check if it's a retryable error
  return RETRYABLE_ERROR_PATTERNS.some(pattern => errorMessage.includes(pattern.toLowerCase()));
};

/**
 * Wraps an operation with retry logic
 */
export const withRetry = async <T>(
  operation: () => Promise<T>,
  options: {
    maxRetries?: number;
    minTimeout?: number;
    maxTimeout?: number;
    factor?: number;
  } = {}
): Promise<T> => {
  const { maxRetries = 3, minTimeout = 1000, maxTimeout = 10000, factor = 2 } = options;

  try {
    return await pRetry(
      async () => {
        try {
          return await operation();
        } catch (error: unknown) {
          // If it's not a retryable error, abort retries
          if (!shouldRetry(error)) {
            throw new AbortError(error instanceof Error ? error.message : 'Unknown error');
          }
          throw error;
        }
      },
      {
        retries: maxRetries,
        minTimeout,
        maxTimeout,
        factor,
      }
    );
  } catch (error: unknown) {
    // If we still have retries left, it means we aborted due to non-retryable error
    if (error instanceof Error && 'retriesLeft' in error && (error as any).retriesLeft > 0) {
      throw new ExternalAPIError(error.message, 'NON_RETRYABLE_ERROR');
    }

    // Otherwise, it's a retry failure
    throw new NetworkError(
      `Failed after ${maxRetries} retries: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'MAX_RETRIES_EXCEEDED'
    );
  }
};
