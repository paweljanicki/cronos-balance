import { Request, Response, NextFunction } from 'express';
import {
  getCronosBalanceForWalletAddress,
  getCrc20BalanceForWalletAddress,
} from '../services/balance.service';
import { handleControllerError } from '../utils/error-handler';

export const getCronosBalance = async (req: Request, res: Response, next: NextFunction) => {
  const { address } = req.params;

  try {
    const balance = await getCronosBalanceForWalletAddress(address);
    res.json({ balance });
  } catch (error) {
    handleControllerError(error, res, next, 'getCronosBalance');
  }
};

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
