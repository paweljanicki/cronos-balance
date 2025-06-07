import { Request, Response } from 'express';
import {
  getCronosBalanceForWalletAddress,
  getCrc20BalanceForWalletAddress,
} from '../services/balance.service';

export const getCronosBalance = async (req: Request, res: Response) => {
  const { address } = req.params;

  try {
    const balance = await getCronosBalanceForWalletAddress(address);
    res.json({ balance });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get cronos balance' });
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
    res.status(500).json({ error: 'Failed to get crc20 balance' });
  }
};
