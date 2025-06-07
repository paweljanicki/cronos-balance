import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ValidationError } from '../utils/errors';
import { handleControllerError } from '../utils/error-handler';

export const ethereumAddressSchema = z
  .string()
  .startsWith('0x', 'Address must start with 0x')
  .length(42, 'Address must be 42 characters long (including 0x)')
  .regex(/^0x[a-fA-F0-9]{40}$/, 'Address must contain only hexadecimal characters');

export const validateEthereumAddress = (paramName: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const address = req.params[paramName];
      ethereumAddressSchema.parse(address);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        handleControllerError(
          new ValidationError('Invalid Ethereum address format', 'INVALID_ETHEREUM_ADDRESS'),
          res,
          next,
          'validateEthereumAddress'
        );
        return;
      }
      handleControllerError(error, res, next, 'validateEthereumAddress');
    }
  };
};
