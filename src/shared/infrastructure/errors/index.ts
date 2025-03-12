import { AppError } from '@shared/types/appError';

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 422);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(message, 404);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string) {
    super(message, 401);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string) {
    super(message, 403);
  }
}

export class DatabaseError extends AppError {
  constructor(message: string) {
    super(message, 500, false);
  }
}

export class ServiceError extends AppError {
  constructor(message: string) {
    super(message, 500, false);
  }
}

export { AppError }; 