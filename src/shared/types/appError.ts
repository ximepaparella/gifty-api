/**
 * Custom error class for application errors
 * Extends the built-in Error class with additional properties
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly status: string;
  public readonly isOperational: boolean;
  
  constructor(message: string, statusCode: number, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = isOperational;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Factory function to create a not found error
 * @param resource - The resource that was not found
 * @returns AppError instance
 */
export const notFoundError = (resource: string): AppError => {
  return new AppError(`${resource} not found`, 404);
};

/**
 * Factory function to create a validation error
 * @param message - The validation error message
 * @returns AppError instance
 */
export const validationError = (message: string): AppError => {
  return new AppError(message, 422);
};

/**
 * Factory function to create an unauthorized error
 * @param message - The unauthorized error message
 * @returns AppError instance
 */
export const unauthorizedError = (message: string): AppError => {
  return new AppError(message, 401);
};

/**
 * Factory function to create a forbidden error
 * @param message - The forbidden error message
 * @returns AppError instance
 */
export const forbiddenError = (message: string): AppError => {
  return new AppError(message, 403);
};

/**
 * Factory function to create a conflict error
 * @param message - The conflict error message
 * @returns AppError instance
 */
export const conflictError = (message: string): AppError => {
  return new AppError(message, 409);
};

/**
 * Factory function to create a server error
 * @param message - The server error message
 * @returns AppError instance
 */
export const internalServerError = (message: string): AppError => {
  return new AppError(message, 500, false);
};

export const badRequestError = (message: string): AppError => {
  return new AppError(message, 400);
}; 