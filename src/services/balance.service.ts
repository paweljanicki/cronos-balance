import { Token } from '@crypto.com/developer-platform-client';
import { getCache, setCache, generateCacheKey } from '../utils/cache';
import { ExternalAPIError, NetworkError } from '../utils/errors';
import { withRetry } from '../utils/retry';

/**
 * Validates the API response and extracts the balance.
 * @param {any} result - The API response object
 * @returns {string} The extracted balance value
 * @throws {ExternalAPIError} If the response doesn't match the expected format or if the API indicates a failure
 */
const validateAndExtractBalance = (result: any): string => {
  if (result.status !== 'Success' || !result.data) {
    throw new ExternalAPIError('Failed to get native token balance');
  }
  return result.data.balance;
};

/**
 * Validates the API response and extracts the token balance.
 * @param {any} result - The API response object
 * @returns {string} The extracted token balance value
 * @throws {ExternalAPIError} If the response doesn't match the expected format or if the API indicates a failure
 */
const validateAndExtractTokenBalance = (result: any): string => {
  if (result.status !== 'Success' || !result.data) {
    throw new ExternalAPIError('Failed to get ERC20 token balance');
  }
  return result.data.tokenBalance;
};

/**
 * Get the native token balance for a wallet address.
 *
 * This function implements a caching strategy to reduce API calls:
 * 1. First checks Redis cache for existing balance
 * 2. If cached, returns immediately
 * 3. If not cached, calls the Cronos API with retry logic
 * 4. Caches the result before returning
 *
 * @param {string} address - The wallet address to check balance for
 * @returns {Promise<string>} The native token balance
 * @throws {ExternalAPIError} When API returns an error or invalid response
 * @throws {NetworkError} When network-related issues occur
 */
export const getCronosBalanceForWalletAddress = async (address: string): Promise<string> => {
  try {
    // Try to get from cache first
    const cacheKey = generateCacheKey('balance', address);
    const cachedBalance = await getCache<string>(cacheKey);

    if (cachedBalance) {
      return cachedBalance;
    }

    // If not in cache, fetch from API with retry
    const result = await withRetry(() => Token.getNativeTokenBalance(address));
    const balance = validateAndExtractBalance(result);

    // Cache the result
    await setCache(cacheKey, balance);
    return balance;
  } catch (error) {
    // Simplify error message to avoid exposing too much information to the client
    if (error instanceof ExternalAPIError) {
      throw new ExternalAPIError('Failed to get cronos balance');
    } else if (error instanceof NetworkError) {
      throw new NetworkError('Failed to get cronos balance');
    }

    throw new ExternalAPIError('Failed to get cronos balance', 'UNKNOWN_ERROR');
  }
};

/**
 * Get the ERC20 token balance for a wallet address.
 *
 * This function implements a caching strategy to reduce API calls:
 * 1. First checks Redis cache for existing balance
 * 2. If cached, returns immediately
 * 3. If not cached, calls the Cronos API with retry logic
 * 4. Caches the result before returning
 *
 * @param {Object} params - The parameters object
 * @param {string} params.walletAddress - The wallet address to check balance for
 * @param {string} params.tokenAddress - The ERC20 token contract address
 * @returns {Promise<string>} The ERC20 token balance
 * @throws {ExternalAPIError} When API returns an error or invalid response
 * @throws {NetworkError} When network-related issues occur
 */
export const getCrc20BalanceForWalletAddress = async ({
  walletAddress,
  tokenAddress,
}: {
  walletAddress: string;
  tokenAddress: string;
}): Promise<string> => {
  try {
    // Try to get from cache first
    const cacheKey = generateCacheKey('token-balance', walletAddress, tokenAddress);
    const cachedBalance = await getCache<string>(cacheKey);

    if (cachedBalance) {
      return cachedBalance;
    }

    // If not in cache, fetch from API with retry
    const result = await withRetry(() => Token.getERC20TokenBalance(walletAddress, tokenAddress));
    const balance = validateAndExtractTokenBalance(result);

    // Cache the result
    await setCache(cacheKey, balance);
    return balance;
  } catch (error) {
    // Simplify error message to avoid exposing too much information to the client
    if (error instanceof ExternalAPIError) {
      throw new ExternalAPIError('Failed to get crc20 balance');
    } else if (error instanceof NetworkError) {
      throw new NetworkError('Failed to get crc20 balance');
    }

    throw new ExternalAPIError('Failed to get crc20 balance', 'UNKNOWN_ERROR');
  }
};
