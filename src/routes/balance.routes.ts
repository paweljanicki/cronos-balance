import { Router, Request, Response } from 'express';
import { getCrc20Balance, getCronosBalance } from '../controllers/balance.controller';
import { validateApiKey } from '../middlewares/auth.middleware';
import { rateLimiter } from '../middlewares/rate-limit.middleware';

const router = Router();

// Apply API key validation to all routes
router.use(validateApiKey);

// Apply rate limiting to all routes
router.use(rateLimiter);

router.get('/balance/:address', async (req: Request, res: Response) => {
  await getCronosBalance(req, res);
});

router.get('/token-balance/:address/:tokenAddress', async (req: Request, res: Response) => {
  await getCrc20Balance(req, res);
});

export default router;
