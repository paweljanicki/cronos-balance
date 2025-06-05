import { Request, Response } from 'express';
import {
  getCronosBalanceForWalletAddress,
  getCrc20BalanceForWalletAddress,
} from '../services/balance.service';

export const getCronosBalance = async (req: Request, res: Response) => {
  const { address } = req.params;

  if (!address) {
    return res.status(400).json({
      error: 'Missing required parameters',
    });
  }

  if (typeof address !== 'string') {
    return res.status(400).json({
      error: 'Invalid parameter types',
    });
  }

  try {
    const balance = await getCronosBalanceForWalletAddress(address);
    res.json({ balance });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get cronos balance' });
  }
};

export const getCrc20Balance = async (req: Request, res: Response) => {
  const { address: walletAddress, tokenAddress } = req.params;

  if (!walletAddress || !tokenAddress) {
    return res.status(400).json({
      error: 'Missing required parameters',
    });
  }

  if (typeof walletAddress !== 'string' || typeof tokenAddress !== 'string') {
    return res.status(400).json({
      error: 'Invalid parameter types',
    });
  }

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
