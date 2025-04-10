/**
 * Custom error class for application errors
 * Extends the built-in Error class with additional properties
 */
export class AppError extends Error {
  public readonly isOperational: boolean;
  public readonly status: number;

  constructor(message: string, status: number = 500, isOperational: boolean = true) {
    super(message);
    this.name = this.constructor.name;
    this.status = status;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Standard error types for consistent error handling across the application
 */
export const ErrorTypes = {
  NOT_FOUND: (resource: string = 'Resource') => new AppError(`${resource} not found`, 404),
  VALIDATION: (message: string) => new AppError(message, 422),
  UNAUTHORIZED: (message: string = 'Unauthorized access') => new AppError(message, 401),
  FORBIDDEN: (message: string = 'Access forbidden') => new AppError(message, 403),
  CONFLICT: (message: string) => new AppError(message, 409),
  INTERNAL: (message: string = 'Internal server error') => new AppError(message, 500, false),
  BAD_REQUEST: (message: string) => new AppError(message, 400),
} as const;
