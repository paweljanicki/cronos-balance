import { Client, CronosEvm } from '@crypto.com/developer-platform-client';
import { config } from '../config';

const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000;

class RPCError extends Error {
  constructor(
    message: string,
    public readonly code?: string
  ) {
    super(message);
    this.name = 'RPCError';
  }
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const withRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = MAX_RETRIES,
  initialDelay: number = INITIAL_RETRY_DELAY
): Promise<T> => {
  let lastError: Error = new Error('');
  let delay = initialDelay;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    console.log('attempt', attempt);
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;

      // Don't retry if it's not a network error
      if (!(error instanceof Error) || !error.message.includes('network')) {
        throw error;
      }

      if (attempt < maxRetries - 1) {
        await sleep(delay);
        delay *= 2; // Exponential backoff
      }
    }
  }

  throw new RPCError(
    `Failed after ${maxRetries} retries: ${lastError?.message}`,
    'MAX_RETRIES_EXCEEDED'
  );
};

export const initializeCronosSDK = () => {
  try {
    Client.init({
      chain: CronosEvm.Mainnet,
      apiKey: config.cronos.apiKey,
    });
  } catch (error) {
    throw new RPCError('Failed to initialize Cronos SDK', 'INITIALIZATION_ERROR');
  }
};

export { withRetry, RPCError };
