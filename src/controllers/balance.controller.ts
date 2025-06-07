import { Request, Response, NextFunction } from 'express';
import {
  getCronosBalanceForWalletAddress,
  getCrc20BalanceForWalletAddress,
} from '../services/balance.service';
import { handleControllerError } from '../utils/error-handler';

/**
 * Controller function to get the native CRO balance for a wallet address
 * @param {Request} req - Express request object containing the wallet address in params
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function for error handling
 * @returns {Promise<void>} Sends JSON response with the balance or error
 */
export const getCronosBalance = async (req: Request, res: Response, next: NextFunction) => {
  const { address } = req.params;

  try {
    const balance = await getCronosBalanceForWalletAddress(address);
    res.json({ balance });
  } catch (error) {
    handleControllerError(error, res, next, 'getCronosBalance');
  }
};

/**
 * Controller function to get the CRC20 token balance for a wallet address
 * @param {Request} req - Express request object containing wallet address and token address in params
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function for error handling
 * @returns {Promise<void>} Sends JSON response with the token balance or error
 */
export const getCrc20Balance = async (req: Request, res: Response, next: NextFunction) => {
  const { address: walletAddress, tokenAddress } = req.params;

  try {
    const balance = await getCrc20BalanceForWalletAddress({
      walletAddress,
      tokenAddress,
    });
    res.json({ balance });
  } catch (error) {
    handleControllerError(error, res, next, 'getCrc20Balance');
  }
};
