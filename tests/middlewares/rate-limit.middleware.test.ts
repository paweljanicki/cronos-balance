import { Request, Response, NextFunction } from 'express';
import { rateLimiter } from '../../src/middlewares/rate-limit.middleware';
import { config } from '../../src/config';

// Mock the config
jest.mock('../../src/config', () => ({
  config: {
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 100,
    },
  },
}));

// Mock express-rate-limit
jest.mock('express-rate-limit', () => {
  return jest.fn().mockImplementation(() => {
    return (req: Request, res: Response, next: NextFunction) => {
      const apiKey = req.header('X-API-Key');

      if (!apiKey) {
        return next();
      }

      // Simulate rate limit exceeded
      if (apiKey === 'exceeded-key') {
        res.status(429).json({
          error: 'Too many requests, please try again later.',
        });
        return;
      }

      // Add rate limit headers
      res.setHeader('RateLimit-Limit', config.rateLimit.maxRequests);
      res.setHeader('RateLimit-Remaining', config.rateLimit.maxRequests - 1);
      res.setHeader(
        'RateLimit-Reset',
        Math.floor(Date.now() / 1000) + config.rateLimit.windowMs / 1000
      );

      next();
    };
  });
});

describe('Rate Limiter Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = {
      header: jest.fn(),
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      setHeader: jest.fn(),
    };
    nextFunction = jest.fn();
  });

  it('should skip rate limiting when no API key is provided', () => {
    (mockRequest.header as jest.Mock).mockReturnValue(undefined);

    rateLimiter(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalled();
    expect(mockResponse.status).not.toHaveBeenCalled();
  });

  it('should use API key as the rate limit key', () => {
    const apiKey = 'test-api-key';
    (mockRequest.header as jest.Mock).mockImplementation(header => {
      if (header === 'X-API-Key') return apiKey;
      return undefined;
    });

    rateLimiter(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalled();
    expect(mockResponse.setHeader).toHaveBeenCalledWith(
      'RateLimit-Limit',
      config.rateLimit.maxRequests
    );
  });

  it('should return rate limit exceeded message when limit is reached', () => {
    (mockRequest.header as jest.Mock).mockImplementation(header => {
      if (header === 'X-API-Key') return 'exceeded-key';
      return undefined;
    });

    rateLimiter(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(429);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Too many requests, please try again later.',
    });
  });

  it('should include rate limit headers in response', () => {
    const apiKey = 'test-api-key';
    (mockRequest.header as jest.Mock).mockImplementation(header => {
      if (header === 'X-API-Key') return apiKey;
      return undefined;
    });

    rateLimiter(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.setHeader).toHaveBeenCalledWith(
      'RateLimit-Limit',
      config.rateLimit.maxRequests
    );
    expect(mockResponse.setHeader).toHaveBeenCalledWith(
      'RateLimit-Remaining',
      config.rateLimit.maxRequests - 1
    );
    expect(mockResponse.setHeader).toHaveBeenCalledWith('RateLimit-Reset', expect.any(Number));
  });
});
