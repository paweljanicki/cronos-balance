import { Router, Request, Response } from 'express';
import { getCrc20Balance, getCronosBalance } from '../controllers/balance.controller';
import { validateApiKey } from '../middlewares/auth.middleware';
import { rateLimiter } from '../middlewares/rate-limit.middleware';
import { validateEthereumAddress } from '../middleware/validation.middleware';

const router = Router();

// Apply API key validation to all routes
router.use(validateApiKey);

// Apply rate limiting to all routes
router.use(rateLimiter);

router.get(
  '/balance/:address',
  validateEthereumAddress('address'),
  async (req: Request, res: Response) => {
    await getCronosBalance(req, res);
  }
);

router.get(
  '/token-balance/:address/:tokenAddress',
  validateEthereumAddress('address'),
  validateEthereumAddress('tokenAddress'),
  async (req: Request, res: Response) => {
    await getCrc20Balance(req, res);
  }
);

export default router;
