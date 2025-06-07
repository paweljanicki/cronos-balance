import { Request, Response } from 'express';
import {
  getCronosBalanceForWalletAddress,
  getCrc20BalanceForWalletAddress,
} from '../services/balance.service';
import { RPCError } from '../utils/cronos';

export const getCronosBalance = async (req: Request, res: Response) => {
  const { address } = req.params;

  try {
    const balance = await getCronosBalanceForWalletAddress(address);
    res.json({ balance });
  } catch (error) {
    if (error instanceof RPCError) {
      const statusCode = error.code === 'API_ERROR' ? 502 : 500;
      res.status(statusCode).json({
        error: error.message,
        code: error.code,
      });
      return;
    }
    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    });
  }
};

export const getCrc20Balance = async (req: Request, res: Response) => {
  const { address: walletAddress, tokenAddress } = req.params;

  try {
    const balance = await getCrc20BalanceForWalletAddress({
      walletAddress,
      tokenAddress,
    });
    res.json({ balance });
  } catch (error) {
    if (error instanceof RPCError) {
      const statusCode = error.code === 'API_ERROR' ? 502 : 500;
      res.status(statusCode).json({
        error: error.message,
        code: error.code,
      });
      return;
    }
    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    });
  }
};
