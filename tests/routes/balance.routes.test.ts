import request from 'supertest';
import express, { Request, Response, NextFunction } from 'express';
import balanceRoutes from '../../src/routes/balance.routes';
import * as balanceController from '../../src/controllers/balance.controller';
import { getStatusCode, formatErrorResponse } from '../../src/utils/error-handler';
import { AppError } from '../../src/utils/errors';

// Mock the config
jest.mock('../../src/config', () => ({
  config: {
    auth: {
      apiKeys: ['valid-api-key'],
    },
    rateLimit: {
      windowMs: 60000,
      maxRequests: 100,
    },
  },
}));

// Mock the controller functions
jest.mock('../../src/controllers/balance.controller', () => ({
  getCronosBalance: jest.fn(),
  getCrc20Balance: jest.fn(),
}));

describe('Balance Routes Integration Tests', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(balanceRoutes);
    // Add global error handler middleware with explicit types
    app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
      if (err instanceof AppError) {
        res.status(getStatusCode(err)).json(formatErrorResponse(err));
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    });
    jest.clearAllMocks();
  });

  describe('GET /balance/:address', () => {
    const validAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
    const invalidAddress = '0xinvalid';

    it('should return 401 without API key', async () => {
      const response = await request(app).get(`/balance/${validAddress}`);
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'API key is required');
    });

    it('should return 400 with invalid address', async () => {
      const response = await request(app)
        .get(`/balance/${invalidAddress}`)
        .set('x-api-key', 'valid-api-key');
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Invalid Ethereum address format');
    });

    it('should return balance for valid address', async () => {
      const mockBalance = '1000000000000000000';
      (balanceController.getCronosBalance as jest.Mock).mockImplementation((req, res) => {
        res.json({ balance: mockBalance });
      });

      const response = await request(app)
        .get(`/balance/${validAddress}`)
        .set('x-api-key', 'valid-api-key');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ balance: mockBalance });
      expect(balanceController.getCronosBalance).toHaveBeenCalled();
    });
  });

  describe('GET /token-balance/:address/:tokenAddress', () => {
    const validAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
    const validTokenAddress = '0x5C7F8A570d578ED84E63fdFA7b1eE72dEae1AE23';
    const invalidAddress = '0xinvalid';

    it('should return 401 without API key', async () => {
      const response = await request(app).get(
        `/token-balance/${validAddress}/${validTokenAddress}`
      );
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'API key is required');
    });

    it('should return 400 with invalid wallet address', async () => {
      const response = await request(app)
        .get(`/token-balance/${invalidAddress}/${validTokenAddress}`)
        .set('x-api-key', 'valid-api-key');
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Invalid Ethereum address format');
    });

    it('should return 400 with invalid token address', async () => {
      const response = await request(app)
        .get(`/token-balance/${validAddress}/${invalidAddress}`)
        .set('x-api-key', 'valid-api-key');
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Invalid Ethereum address format');
    });

    it('should return token balance for valid addresses', async () => {
      const mockBalance = '500000000000000000';
      (balanceController.getCrc20Balance as jest.Mock).mockImplementation((req, res) => {
        res.json({ balance: mockBalance });
      });

      const response = await request(app)
        .get(`/token-balance/${validAddress}/${validTokenAddress}`)
        .set('x-api-key', 'valid-api-key');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ balance: mockBalance });
      expect(balanceController.getCrc20Balance).toHaveBeenCalled();
    });
  });
});
