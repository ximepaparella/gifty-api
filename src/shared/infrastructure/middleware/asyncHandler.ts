import { Request, Response, NextFunction } from 'express';
import logger from '@shared/infrastructure/logging/logger';

type AsyncFunction = (req: Request, res: Response, next: NextFunction) => Promise<unknown>;

/**
 * Wraps an async function and catches any errors, passing them to the next middleware
 * @param fn - The async function to wrap
 * @returns Express middleware function
 */
export const handleAsync =
  (fn: AsyncFunction) =>
  (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch((error) => {
      logger.error('Request error:', { error, method: req.method, path: req.path });
      next(error);
    });
  };
