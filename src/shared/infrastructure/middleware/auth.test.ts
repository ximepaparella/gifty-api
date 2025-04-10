import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authenticate, generateToken } from './auth';
import { AuthenticationError } from '@shared/infrastructure/errors';

// Mock jsonwebtoken
jest.mock('jsonwebtoken');

describe('Auth Middleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.Mock<NextFunction>;

  beforeEach(() => {
    req = {
      headers: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    process.env.JWT_SECRET = 'test_jwt_secret_key';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('authenticate', () => {
    it('should call next() if token is valid', () => {
      // Arrange
      const mockUser = { id: '1', email: 'test@example.com', role: 'user' };
      req.headers = {
        authorization: 'Bearer valid-token',
      };

      (jwt.verify as jest.Mock).mockReturnValue(mockUser);

      // Act
      authenticate(req as Request, res as Response, next);

      // Assert
      expect(jwt.verify).toHaveBeenCalledWith('valid-token', 'test_jwt_secret_key');
      expect(req.user).toEqual(mockUser);
      expect(next).toHaveBeenCalledWith();
    });

    it('should throw AuthenticationError if no token is provided', () => {
      // Act
      authenticate(req as Request, res as Response, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'No token provided',
        })
      );
    });

    it('should throw AuthenticationError if token format is invalid', () => {
      // Arrange
      req.headers = {
        authorization: 'InvalidFormat token',
      };

      // Act
      authenticate(req as Request, res as Response, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'No token provided',
        })
      );
    });

    it('should throw AuthenticationError if token is invalid', () => {
      // Arrange
      req.headers = {
        authorization: 'Bearer invalid-token',
      };

      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      // Act
      authenticate(req as Request, res as Response, next);

      // Assert
      expect(jwt.verify).toHaveBeenCalledWith('invalid-token', 'test_jwt_secret_key');
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Invalid token',
        })
      );
    });
  });

  describe('generateToken', () => {
    it('should generate a JWT token', () => {
      // Arrange
      const user = { id: '1', email: 'test@example.com', role: 'user' };
      (jwt.sign as jest.Mock).mockReturnValue('generated-token');

      // Act
      const token = generateToken(user);

      // Assert
      expect(jwt.sign).toHaveBeenCalledWith(user, 'test_jwt_secret_key', {
        expiresIn: expect.any(String),
      });
      expect(token).toBe('generated-token');
    });
  });
});
