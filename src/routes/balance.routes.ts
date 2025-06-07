import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { getCrc20Balance, getCronosBalance } from '../controllers/balance.controller';
import { validateApiKey } from '../middlewares/auth.middleware';
import { rateLimiter } from '../middlewares/rate-limit.middleware';
import { validateEthereumAddress } from '../middlewares/validation.middleware';

const router = Router();

// Apply API key validation to all routes
router.use(validateApiKey);

// Apply rate limiting to all routes
router.use(rateLimiter);

router.get('/balance/:address', validateEthereumAddress('address'), asyncHandler(getCronosBalance));

router.get(
  '/token-balance/:address/:tokenAddress',
  validateEthereumAddress('address'),
  validateEthereumAddress('tokenAddress'),
  asyncHandler(getCrc20Balance)
);

export default router;
