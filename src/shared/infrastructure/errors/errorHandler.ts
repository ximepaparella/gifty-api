import { Request, Response, NextFunction } from 'express';
import { AppError } from '@shared/types/appError';
import logger from '@shared/infrastructure/logging/logger';

export const errorHandler = (err: Error, req: Request, res: Response, _next: NextFunction): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
      ...(err.isOperational ? {} : { stack: err.stack })
    });
    return;
  }

  // Log unexpected errors
  logger.error('Unexpected error:', err);

  res.status(500).json({
    status: 'error',
    message: 'Internal server error'
  });
}; 