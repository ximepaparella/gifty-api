import { NextFunction, Request, Response } from 'express';
import { sendEmail } from './email';
import { getPaginationOptions } from './pagination';
import { isValidPhoneNumber, formatPhoneNumber } from './phoneValidator';
import { generateRandomCode } from './codeGenerator';

/**
 * Catch async errors in controllers
 */
export const catchAsync = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};

export {
  sendEmail,
  getPaginationOptions,
  isValidPhoneNumber,
  formatPhoneNumber,
  generateRandomCode
}; 