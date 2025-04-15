import bcrypt from 'bcrypt';
import { Secret, SignOptions, verify, sign } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { AppError, ErrorTypes } from '@shared/types/appError';
import { RequestWithUser } from '@shared/types';
import { logger } from '@shared/infrastructure/logging/logger';
import { StringValue } from '@shared/types/stringValue';

// Environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';
const JWT_EXPIRES_IN = 24 * 60 * 60; // 24 hours in seconds

// JWT payload interface
export interface JwtPayload {
  id: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

/**
 * Hash a password
 */
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
};

/**
 * Compare a password with a hash
 */
export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

/**
 * Generate a JWT token
 */
export const generateToken = (payload: JwtPayload): string => {
  const options: SignOptions = {
    expiresIn: JWT_EXPIRES_IN,
  };
  return sign(payload, JWT_SECRET as Secret, options);
};

/**
 * Verify a JWT token
 */
export const verifyToken = (token: string): JwtPayload => {
  try {
    return verify(token, JWT_SECRET as Secret) as JwtPayload;
  } catch (error) {
    throw ErrorTypes.UNAUTHORIZED('Invalid token');
  }
};

/**
 * Authentication middleware
 */
export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw ErrorTypes.UNAUTHORIZED('No token provided');
    }

    // Extract token
    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = verifyToken(token);

    // Add user to request
    (req as RequestWithUser).user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    const appError =
      error instanceof AppError ? error : ErrorTypes.UNAUTHORIZED('Authentication failed');
    next(appError);
  }
};

/**
 * Authorization middleware for role-based access control
 */
export const authorize = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const userReq = req as RequestWithUser;

      if (!userReq.user) {
        throw ErrorTypes.UNAUTHORIZED('User not authenticated');
      }

      if (!roles.includes(userReq.user.role)) {
        throw ErrorTypes.FORBIDDEN('Not authorized to access this resource');
      }

      next();
    } catch (error) {
      logger.error('Authorization error:', error);
      const appError =
        error instanceof AppError
          ? error
          : ErrorTypes.FORBIDDEN('Not authorized to access this resource');
      next(appError);
    }
  };
};
