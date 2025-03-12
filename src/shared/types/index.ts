import { Request } from 'express';

// Common error interface
export interface AppError extends Error {
  statusCode?: number;
  status?: string;
  isOperational?: boolean;
}

// Auth related interfaces
export interface JwtPayload {
  id: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

// Database related interfaces
export interface PaginationOptions {
  page?: number;
  limit?: number;
  sort?: Record<string, 1 | -1> | string;
}

export interface PaginationResult {
  total: number;
  page: number;
  pages: number;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: PaginationResult;
}

// Service response interface
export interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Define request with user interface for authenticated routes
export interface RequestWithUser extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    permissions?: string[];
  };
}

// Define common response interface
export interface ApiResponse<T> {
  status: 'success' | 'error' | 'fail';
  message?: string;
  data?: T;
  error?: {
    message: string;
    stack?: string;
  };
}

export * from './appError'; 