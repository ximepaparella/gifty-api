import { Request, Response, NextFunction } from 'express';
import { ErrorTypes } from '../../types/appError';
import logger from '@shared/infrastructure/logging/logger';
import { sendErrorResponse } from '@shared/utils/response.utils';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Log the error for debugging
  logger.error('Error caught by global error handler:', {
    error: err,
    path: req.path,
    method: req.method,
    query: req.query,
    body: req.body,
  });

  // Send appropriate error response
  sendErrorResponse(res, err);
};

// 404 handler middleware
export const notFoundHandler = (req: Request, _res: Response, next: NextFunction) => {
  const error = ErrorTypes.NOT_FOUND(`Route ${req.originalUrl}`);
  next(error);
};
