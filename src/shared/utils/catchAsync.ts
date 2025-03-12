import { Request, Response, NextFunction } from 'express';

/**
 * Wraps an async function and catches any errors, passing them to the next middleware
 * This eliminates the need for try/catch blocks in async route handlers
 * @param fn - The async function to wrap
 * @returns Express middleware function
 */
const catchAsync = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    fn(req, res, next).catch(next);
  };
};

export default catchAsync; 