import { withRetry } from '../../src/utils/retry';
import { ExternalAPIError, NetworkError } from '../../src/utils/errors';
import pRetry from 'p-retry';

jest.mock('p-retry', () => {
  class AbortError extends Error {}
  return {
    __esModule: true,
    default: jest.fn().mockImplementation((fn, options) => fn(1)),
    AbortError,
  };
});

describe('withRetry', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully execute operation without retries', async () => {
    const operation = jest.fn().mockResolvedValue('success');
    const result = await withRetry(operation);

    expect(result).toBe('success');
    expect(operation).toHaveBeenCalledTimes(1);
  });

  it('should retry on retryable errors', async () => {
    const operation = jest
      .fn()
      .mockRejectedValueOnce(new Error('network error'))
      .mockResolvedValueOnce('success');

    // Mock p-retry to simulate retry behavior
    (pRetry as jest.Mock).mockImplementationOnce((fn, options) => {
      return fn(1).catch(() => fn(2));
    });

    const result = await withRetry(operation);

    expect(result).toBe('success');
    expect(operation).toHaveBeenCalledTimes(2);
  });

  it('should not retry on non-retryable errors', async () => {
    const operation = jest.fn().mockRejectedValue(new Error('invalid parameter'));

    await expect(withRetry(operation)).rejects.toThrow(ExternalAPIError);
    expect(operation).toHaveBeenCalledTimes(1);
  });

  it('should throw NetworkError after max retries', async () => {
    const operation = jest.fn().mockRejectedValue(new Error('network error'));
    const maxRetries = 3;

    // Mock p-retry to simulate max retries exceeded
    (pRetry as jest.Mock).mockImplementationOnce((fn, options) => {
      // Verify that the retry limit is properly set
      expect(options.retries).toBe(maxRetries);

      // Simulate retries up to the limit
      let attempts = 0;
      const attempt = () => {
        attempts++;
        if (attempts <= maxRetries) {
          return fn(attempts).catch(() => attempt());
        }
        throw new Error('network error');
      };
      return attempt();
    });

    await expect(withRetry(operation, { maxRetries })).rejects.toThrow(NetworkError);
    expect(operation).toHaveBeenCalledTimes(maxRetries);
  });

  it('should handle non-Error objects', async () => {
    const operation = jest.fn().mockRejectedValue('string error');

    await expect(withRetry(operation)).rejects.toThrow(ExternalAPIError);
    expect(operation).toHaveBeenCalledTimes(1);
  });

  it('should handle retryable error patterns', async () => {
    const retryableErrors = [
      'network error',
      'timeout error',
      'connection refused',
      'socket error',
      'ECONNREFUSED',
      'ECONNRESET',
      'ETIMEDOUT',
      'ENOTFOUND',
      'EAI_AGAIN',
      'temporary error',
      'rate limit exceeded',
      'too many requests',
      'service unavailable',
      'bad gateway',
      'gateway timeout',
    ];

    for (const errorMessage of retryableErrors) {
      const operation = jest
        .fn()
        .mockRejectedValueOnce(new Error(errorMessage))
        .mockResolvedValueOnce('success');

      // Mock p-retry to simulate retry behavior
      (pRetry as jest.Mock).mockImplementationOnce((fn, options) => {
        // First attempt fails
        return fn(1).catch(() => {
          // Second attempt succeeds
          return fn(2);
        });
      });

      const result = await withRetry(operation);
      expect(operation).toHaveBeenCalledTimes(2);
      expect(result).toBe('success');
    }
  });

  it('should handle non-retryable error patterns', async () => {
    const nonRetryableErrors = [
      'invalid address',
      'invalid parameter',
      'unauthorized',
      'forbidden',
      'not found',
      'validation error',
    ];

    for (const errorMessage of nonRetryableErrors) {
      const operation = jest.fn().mockRejectedValue(new Error(errorMessage));

      await expect(withRetry(operation)).rejects.toThrow(ExternalAPIError);
      expect(operation).toHaveBeenCalledTimes(1);
    }
  });
});
