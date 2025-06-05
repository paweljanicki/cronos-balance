import { Router, Request, Response } from 'express';
import { getCrc20Balance, getCronosBalance } from '../controllers/balance.controller';

const router = Router();

router.get('/balance/:address', async (req: Request, res: Response) => {
  await getCronosBalance(req, res);
});

router.get('/token-balance/:address/:tokenAddress', async (req: Request, res: Response) => {
  await getCrc20Balance(req, res);
});

export default router;
