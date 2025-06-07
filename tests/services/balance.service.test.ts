import { Token } from '@crypto.com/developer-platform-client';
import { getCache, setCache } from '../../src/utils/cache';
import { ExternalAPIError } from '../../src/utils/errors';
import {
  getCronosBalanceForWalletAddress,
  getCrc20BalanceForWalletAddress,
} from '../../src/services/balance.service';

// Mock dependencies
jest.mock('@crypto.com/developer-platform-client');
jest.mock('../../src/utils/cache');
jest.mock('../../src/utils/retry', () => ({
  withRetry: (fn: any) => fn(),
}));

describe('Balance Service', () => {
  const mockAddress = '0x1234567890abcdef1234567890abcdef12345678';
  const mockTokenAddress = '0xabcdef1234567890abcdef1234567890abcdef12';
  const mockBalance = '1000000000000000000';
  const mockTokenBalance = '500000000000000000';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCronosBalanceForWalletAddress', () => {
    it('should return cached balance when available', async () => {
      (getCache as jest.Mock).mockResolvedValue(mockBalance);

      const result = await getCronosBalanceForWalletAddress(mockAddress);

      expect(result).toBe(mockBalance);
      expect(getCache).toHaveBeenCalled();
      expect(Token.getNativeTokenBalance).not.toHaveBeenCalled();
    });

    it('should fetch and cache balance when not in cache', async () => {
      (getCache as jest.Mock).mockResolvedValue(null);
      (Token.getNativeTokenBalance as jest.Mock).mockResolvedValue({
        status: 'Success',
        data: { balance: mockBalance },
      });

      const result = await getCronosBalanceForWalletAddress(mockAddress);

      expect(result).toBe(mockBalance);
      expect(getCache).toHaveBeenCalled();
      expect(Token.getNativeTokenBalance).toHaveBeenCalledWith(mockAddress);
      expect(setCache).toHaveBeenCalled();
    });

    it('should throw ExternalAPIError when API response is invalid', async () => {
      (getCache as jest.Mock).mockResolvedValue(null);
      (Token.getNativeTokenBalance as jest.Mock).mockResolvedValue({
        status: 'Error',
        data: null,
      });

      await expect(getCronosBalanceForWalletAddress(mockAddress)).rejects.toThrow(ExternalAPIError);
    });

    it('should throw ExternalAPIError when API call fails', async () => {
      (getCache as jest.Mock).mockResolvedValue(null);
      (Token.getNativeTokenBalance as jest.Mock).mockRejectedValue(new Error('API Error'));

      await expect(getCronosBalanceForWalletAddress(mockAddress)).rejects.toThrow(ExternalAPIError);
    });
  });

  describe('getCrc20BalanceForWalletAddress', () => {
    it('should return cached token balance when available', async () => {
      (getCache as jest.Mock).mockResolvedValue(mockTokenBalance);

      const result = await getCrc20BalanceForWalletAddress({
        walletAddress: mockAddress,
        tokenAddress: mockTokenAddress,
      });

      expect(result).toBe(mockTokenBalance);
      expect(getCache).toHaveBeenCalled();
      expect(Token.getERC20TokenBalance).not.toHaveBeenCalled();
    });

    it('should fetch and cache token balance when not in cache', async () => {
      (getCache as jest.Mock).mockResolvedValue(null);
      (Token.getERC20TokenBalance as jest.Mock).mockResolvedValue({
        status: 'Success',
        data: { tokenBalance: mockTokenBalance },
      });

      const result = await getCrc20BalanceForWalletAddress({
        walletAddress: mockAddress,
        tokenAddress: mockTokenAddress,
      });

      expect(result).toBe(mockTokenBalance);
      expect(getCache).toHaveBeenCalled();
      expect(Token.getERC20TokenBalance).toHaveBeenCalledWith(mockAddress, mockTokenAddress);
      expect(setCache).toHaveBeenCalled();
    });

    it('should throw ExternalAPIError when API response is invalid', async () => {
      (getCache as jest.Mock).mockResolvedValue(null);
      (Token.getERC20TokenBalance as jest.Mock).mockResolvedValue({
        status: 'Error',
        data: null,
      });

      await expect(
        getCrc20BalanceForWalletAddress({
          walletAddress: mockAddress,
          tokenAddress: mockTokenAddress,
        })
      ).rejects.toThrow(ExternalAPIError);
    });

    it('should throw ExternalAPIError when API call fails', async () => {
      (getCache as jest.Mock).mockResolvedValue(null);
      (Token.getERC20TokenBalance as jest.Mock).mockRejectedValue(new Error('API Error'));

      await expect(
        getCrc20BalanceForWalletAddress({
          walletAddress: mockAddress,
          tokenAddress: mockTokenAddress,
        })
      ).rejects.toThrow(ExternalAPIError);
    });
  });
});
