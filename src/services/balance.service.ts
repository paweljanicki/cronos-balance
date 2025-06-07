import { Token } from '@crypto.com/developer-platform-client';
import { getCache, setCache, generateCacheKey } from '../utils/cache';
import { ExternalAPIError, NetworkError } from '../utils/errors';
import { withRetry } from '../utils/retry';

/**
 * Validates the API response and extracts the balance
 */
const validateAndExtractBalance = (result: any): string => {
  if (result.status !== 'Success' || !result.data) {
    throw new ExternalAPIError('Failed to get native token balance');
  }
  return result.data.balance;
};

/**
 * Validates the API response and extracts the token balance
 */
const validateAndExtractTokenBalance = (result: any): string => {
  if (result.status !== 'Success' || !result.data) {
    throw new ExternalAPIError('Failed to get ERC20 token balance');
  }
  return result.data.tokenBalance;
};

/**
 * Get the native token balance for a wallet address
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
    if (error instanceof ExternalAPIError || error instanceof NetworkError) {
      throw new ExternalAPIError('Failed to get cronos balance');
    }
    console.error('Unexpected error:', error);
    throw new ExternalAPIError('Failed to get cronos balance', 'UNKNOWN_ERROR');
  }
};

/**
 * Get the ERC20 token balance for a wallet address
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
    if (error instanceof ExternalAPIError || error instanceof NetworkError) {
      throw new ExternalAPIError('Failed to get crc20 balance');
    }
    console.error('Unexpected error:', error);
    throw new ExternalAPIError('Failed to get crc20 balance', 'UNKNOWN_ERROR');
  }
};

// 0xA897312A1882dBb79827dB2C5E0abAb438f38C6F 0x66e428c3f67a68878562e79a0234c1f83c208770
