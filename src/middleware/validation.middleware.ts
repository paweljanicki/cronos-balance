import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

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
      console.log(error);
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: 'Invalid address format',
        });
        return;
      }
      next(error);
    }
  };
};
