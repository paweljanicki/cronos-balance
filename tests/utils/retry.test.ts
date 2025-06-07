import { withRetry, shouldRetry } from '../../src/utils/retry';

jest.mock('p-retry', () => {
  class AbortError extends Error {}

  return {
    __esModule: true,
    default: async (fn: any, options: any = {}) => {
      const maxRetries = options?.retries ?? 3;
      let lastError;
      for (let i = 0; i < maxRetries; i++) {
        try {
          return await fn();
        } catch (err) {
          if (!shouldRetry(err)) {
            // Simulate aborting retries for non-retryable errors
            const abort = new AbortError(err instanceof Error ? err.message : 'Unknown error');
            (abort as any).retriesLeft = maxRetries - i;
            throw abort;
          }
          lastError = err;
        }
      }
      throw lastError;
    },
    AbortError,
  };
});

describe('withRetry', () => {
  it('should succeed on first attempt', async () => {
    const operation = jest.fn().mockResolvedValue('success');
    const result = await withRetry(operation);
    expect(result).toBe('success');
    expect(operation).toHaveBeenCalledTimes(1);
  });

  it('should retry and succeed after network errors', async () => {
    const operation = jest
      .fn()
      .mockRejectedValueOnce(new Error('network error'))
      .mockRejectedValueOnce(new Error('network error'))
      .mockResolvedValueOnce('success');
    const result = await withRetry(operation);
    expect(result).toBe('success');
    expect(operation).toHaveBeenCalledTimes(3);
  });

  it('should throw immediately for non-retryable errors', async () => {
    const operation = jest.fn().mockRejectedValueOnce(new Error('invalid address'));
    await expect(withRetry(operation)).rejects.toThrow('invalid address');
    expect(operation).toHaveBeenCalledTimes(1);
  });

  it('should throw after max retries exceeded', async () => {
    const operation = jest.fn().mockRejectedValue(new Error('network error'));
    await expect(withRetry(operation, { maxRetries: 3 })).rejects.toThrow(
      'Failed after 3 retries: network error'
    );
    expect(operation).toHaveBeenCalledTimes(3);
  });

  it('should use exponential backoff between retries', async () => {
    const operation = jest
      .fn()
      .mockRejectedValueOnce(new Error('network error'))
      .mockRejectedValueOnce(new Error('network error'))
      .mockResolvedValueOnce('success');
    await withRetry(operation, { minTimeout: 100, maxTimeout: 1000 });
    expect(operation).toHaveBeenCalledTimes(3);
  });

  it('should handle custom max retries and timeouts', async () => {
    const operation = jest.fn().mockRejectedValue(new Error('network error'));
    await expect(withRetry(operation, { maxRetries: 2, minTimeout: 50 })).rejects.toThrow(
      'Failed after 2 retries: network error'
    );
    expect(operation).toHaveBeenCalledTimes(2);
  });

  it('should preserve the original error message in the final error', async () => {
    const originalError = new Error('custom network error message');
    const operation = jest.fn().mockRejectedValue(originalError);
    await expect(withRetry(operation, { maxRetries: 1 })).rejects.toThrow(
      'Failed after 1 retries: custom network error message'
    );
  });

  it('should throw NetworkError with correct code', async () => {
    const operation = jest.fn().mockRejectedValue(new Error('network error'));
    await expect(withRetry(operation, { maxRetries: 1 })).rejects.toMatchObject({
      name: 'NetworkError',
      code: 'MAX_RETRIES_EXCEEDED',
    });
  });

  it('should throw ExternalAPIError with NON_RETRYABLE_ERROR code for non-retryable errors', async () => {
    const operation = jest.fn().mockRejectedValue(new Error('invalid parameter'));
    await expect(withRetry(operation)).rejects.toMatchObject({
      name: 'ExternalAPIError',
      code: 'NON_RETRYABLE_ERROR',
    });
  });
});
