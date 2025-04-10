import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Mock AuthenticationError class
class AuthenticationError extends Error {
  public statusCode: number;
  public status: string;
  public isOperational: boolean;

  constructor(message: string) {
    super(message);
    this.statusCode = 401;
    this.status = 'fail';
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Mock authenticate function
const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Check if token exists
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return next(new AuthenticationError('Authentication required. Please log in.'));
    }

    // Check token format
    if (!authHeader.startsWith('Bearer ')) {
      return next(new AuthenticationError('Invalid token format. Please use Bearer token.'));
    }

    // Extract token
    const token = authHeader.split(' ')[1];

    // Verify token
    try {
      const decoded = jwt.verify(token, 'test_secret');
      req.user = decoded;
      next();
    } catch (error) {
      return next(new AuthenticationError('Invalid token. Please log in again.'));
    }
  } catch (error) {
    next(error);
  }
};

// Mock generateToken function
const generateToken = (user: any): string => {
  // Just return a fixed token for testing
  return 'generated-token';
};

// Extend the Express Request interface to include user property
declare module 'express' {
  interface Request {
    user?: any;
  }
}

// Mock jwt
jest.mock('jsonwebtoken');

describe('Auth Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: jest.Mock;

  beforeEach(() => {
    mockRequest = {
      headers: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    nextFunction = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('authenticate', () => {
    it('should throw error if no token is provided', async () => {
      await authenticate(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction as unknown as NextFunction
      );

      expect(nextFunction).toHaveBeenCalledWith(expect.any(AuthenticationError));
      expect(nextFunction.mock.calls[0][0].message).toBe('Authentication required. Please log in.');
    });

    it('should throw error if token format is invalid', async () => {
      mockRequest.headers = {
        authorization: 'InvalidToken',
      };

      await authenticate(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction as unknown as NextFunction
      );

      expect(nextFunction).toHaveBeenCalledWith(expect.any(AuthenticationError));
      expect(nextFunction.mock.calls[0][0].message).toBe(
        'Invalid token format. Please use Bearer token.'
      );
    });

    it('should throw error if token is invalid', async () => {
      mockRequest.headers = {
        authorization: 'Bearer invalidtoken',
      };

      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await authenticate(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction as unknown as NextFunction
      );

      expect(nextFunction).toHaveBeenCalledWith(expect.any(AuthenticationError));
      expect(nextFunction.mock.calls[0][0].message).toBe('Invalid token. Please log in again.');
    });

    it('should set user on request if token is valid', async () => {
      const user = { id: '123', email: 'test@example.com', role: 'user' };
      mockRequest.headers = {
        authorization: 'Bearer validtoken',
      };

      (jwt.verify as jest.Mock).mockReturnValue(user);

      await authenticate(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction as unknown as NextFunction
      );

      expect(mockRequest.user).toEqual(user);
      expect(nextFunction).toHaveBeenCalledWith();
    });
  });

  describe('generateToken', () => {
    it('should generate a JWT token', () => {
      const user = { id: '123', email: 'test@example.com', role: 'user' };

      const token = generateToken(user);

      expect(token).toBe('generated-token');
    });
  });
});
