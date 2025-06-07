import { Request, Response, NextFunction } from 'express';
import { validateApiKey } from '../../src/middlewares/auth.middleware';
import { AuthError } from '../../src/utils/errors';

// Mock the config
jest.mock('../../src/config', () => ({
  config: {
    auth: {
      apiKeys: ['valid-api-key-1', 'valid-api-key-2'],
    },
  },
}));

describe('Auth Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    nextFunction = jest.fn();
  });

  describe('validateApiKey', () => {
    it('should call next() when valid API key is provided', () => {
      mockRequest.header = jest.fn().mockReturnValue('valid-api-key-1');

      validateApiKey(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should pass AuthError to next() when no API key is provided', () => {
      mockRequest.header = jest.fn().mockReturnValue(undefined);

      validateApiKey(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith(expect.any(AuthError));
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      const error = (nextFunction as jest.Mock).mock.calls[0][0];
      expect(error.message).toBe('API key is required');
      expect(error.code).toBe('MISSING_API_KEY');
    });

    it('should pass AuthError to next() when invalid API key is provided', () => {
      mockRequest.header = jest.fn().mockReturnValue('invalid-api-key');

      validateApiKey(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith(expect.any(AuthError));
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      const error = (nextFunction as jest.Mock).mock.calls[0][0];
      expect(error.message).toBe('Invalid API key');
      expect(error.code).toBe('INVALID_API_KEY');
    });
  });
});
