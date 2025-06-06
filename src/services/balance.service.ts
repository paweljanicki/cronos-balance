import { Token } from '@crypto.com/developer-platform-client';
import { getCache, setCache, generateCacheKey } from './cache.service';
import { CACHE_TTL } from '../utils/redis';

export const getCronosBalanceForWalletAddress = async (address: string): Promise<string> => {
  try {
    // Try to get from cache first
    const cacheKey = generateCacheKey('balance', address);
    const cachedBalance = await getCache<string>(cacheKey);

    if (cachedBalance) {
      return cachedBalance;
    }

    // If not in cache, fetch from API
    const response = await Token.getNativeTokenBalance(address);

    if (response.status === 'Success' && response.data) {
      // Cache the result
      await setCache(cacheKey, response.data.balance, CACHE_TTL);
      return response.data.balance;
    } else {
      throw new Error();
    }
  } catch (error) {
    console.error(error);
    throw new Error('Failed to get cronos balance');
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

    // If not in cache, fetch from API
    const response = await Token.getERC20TokenBalance(walletAddress, tokenAddress);

    if (response.status === 'Success' && response.data) {
      // Cache the result
      await setCache(cacheKey, response.data.tokenBalance, CACHE_TTL);
      return response.data.tokenBalance;
    } else {
      throw new Error();
    }
  } catch (error) {
    console.error(error);
    throw new Error('Failed to get crc20 balance');
  }
};

// 0xA897312A1882dBb79827dB2C5E0abAb438f38C6F 0x66e428c3f67a68878562e79a0234c1f83c208770
