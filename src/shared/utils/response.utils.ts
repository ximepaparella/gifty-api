import { Response } from 'express';
import { ApiResponse, PaginatedApiResponse, ApiErrorResponse } from '../types/response.types';
import { AppError } from '../types/appError';
import logger from '../infrastructure/logging/logger';

/**
 * Creates a success response
 */
export function createSuccessResponse<T>(data: T, message?: string): ApiResponse<T> {
  return {
    status: 'success',
    data,
    ...(message && { message }),
  };
}

/**
 * Creates a paginated success response
 */
export function createPaginatedResponse<T>(
  data: T[],
  page: number,
  limit: number,
  total: number
): PaginatedApiResponse<T[]> {
  return {
    status: 'success',
    data,
    pagination: {
      page,
      limit,
      total,
      hasMore: page * limit < total,
    },
  };
}

/**
 * Creates an error response
 */
export function createErrorResponse(
  error: Error | AppError,
  defaultMessage = 'Internal server error'
): ApiErrorResponse {
  const isOperationalError = error instanceof AppError;
  const statusCode = isOperationalError ? error.status : 500;
  const status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';

  // Log unexpected errors
  if (!isOperationalError) {
    logger.error('Unexpected error:', error);
  }

  return {
    status,
    message: error.message || defaultMessage,
    code: isOperationalError ? `ERR_${error.status}` : 'ERR_INTERNAL',
    ...(process.env.NODE_ENV !== 'production' && { stack: error.stack }),
  };
}

/**
 * Sends a success response
 */
export function sendSuccessResponse<T>(
  res: Response,
  data: T,
  statusCode = 200,
  message?: string
): void {
  res.status(statusCode).json(createSuccessResponse(data, message));
}

/**
 * Sends a paginated response
 */
export function sendPaginatedResponse<T>(
  res: Response,
  data: T[],
  page: number,
  limit: number,
  total: number
): void {
  res.status(200).json(createPaginatedResponse(data, page, limit, total));
}

/**
 * Sends an error response
 */
export function sendErrorResponse(
  res: Response,
  error: Error | AppError,
  defaultMessage = 'Internal server error'
): void {
  const errorResponse = createErrorResponse(error, defaultMessage);
  res.status(error instanceof AppError ? error.status : 500).json(errorResponse);
}
