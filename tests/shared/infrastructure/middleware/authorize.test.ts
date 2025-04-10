import { Request, Response, NextFunction } from 'express';

// Mock ForbiddenError class
class ForbiddenError extends Error {
  public statusCode: number;
  public status: string;
  public isOperational: boolean;

  constructor(message: string) {
    super(message);
    this.statusCode = 403;
    this.status = 'fail';
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Mock authorize function
const authorize = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new ForbiddenError('Access denied. Please log in.'));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new ForbiddenError('Access denied. You do not have permission to perform this action.')
      );
    }

    next();
  };
};

// Extend the Express Request interface to include user property
declare module 'express' {
  interface Request {
    user?: any;
  }
}

describe('Authorization Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: jest.Mock;

  beforeEach(() => {
    mockRequest = {
      user: {
        id: '123',
        email: 'test@example.com',
        role: 'user',
      },
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

  it('should call next if user has required role', () => {
    const middleware = authorize(['user', 'admin']);

    middleware(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction as unknown as NextFunction
    );

    expect(nextFunction).toHaveBeenCalledWith();
  });

  it('should throw ForbiddenError if user does not have required role', () => {
    const middleware = authorize(['admin']);

    middleware(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction as unknown as NextFunction
    );

    expect(nextFunction).toHaveBeenCalledWith(expect.any(ForbiddenError));
  });

  it('should throw ForbiddenError if user object is not present', () => {
    mockRequest.user = undefined;
    const middleware = authorize(['user']);

    middleware(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction as unknown as NextFunction
    );

    expect(nextFunction).toHaveBeenCalledWith(expect.any(ForbiddenError));
  });
});
