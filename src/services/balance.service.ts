import { Token } from '@crypto.com/developer-platform-client';
import { getCache, setCache, generateCacheKey } from '../utils/cache';
import { withRetry, RPCError } from '../utils/cronos';

export const getCronosBalanceForWalletAddress = async (address: string): Promise<string> => {
  try {
    // Try to get from cache first
    const cacheKey = generateCacheKey('balance', address);
    const cachedBalance = await getCache<string>(cacheKey);

    if (cachedBalance) {
      return cachedBalance;
    }

    // If not in cache, fetch from API with retry
    const response = await withRetry(async () => {
      const result = await Token.getNativeTokenBalance(address);
      console.log('result', result);
      if (result.status !== 'Success' || !result.data) {
        throw new RPCError('Failed to get native token balance', 'API_ERROR');
      }
      return result;
    });

    // Cache the result
    await setCache(cacheKey, response.data.balance);
    return response.data.balance;
  } catch (error) {
    if (error instanceof RPCError) {
      throw error;
    }
    console.error('Unexpected error:', error);
    throw new RPCError('Failed to get cronos balance', 'UNKNOWN_ERROR');
  }
};

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
    const response = await withRetry(async () => {
      const result = await Token.getERC20TokenBalance(walletAddress, tokenAddress);
      if (result.status !== 'Success' || !result.data) {
        throw new RPCError('Failed to get ERC20 token balance', 'API_ERROR');
      }
      return result;
    });

    // Cache the result
    await setCache(cacheKey, response.data.tokenBalance);
    return response.data.tokenBalance;
  } catch (error) {
    if (error instanceof RPCError) {
      throw error;
    }
    console.error('Unexpected error:', error);
    throw new RPCError('Failed to get crc20 balance', 'UNKNOWN_ERROR');
  }
};

// 0xA897312A1882dBb79827dB2C5E0abAb438f38C6F 0x66e428c3f67a68878562e79a0234c1f83c208770
