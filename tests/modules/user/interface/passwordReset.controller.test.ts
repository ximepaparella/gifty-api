import { Request, Response } from 'express';

// Mock error classes
class AppError extends Error {
  public statusCode: number;
  public status: string;
  public isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 422);
  }
}

class NotFoundError extends AppError {
  constructor(message: string) {
    super(message, 404);
  }
}

// Mock PasswordResetService class
class PasswordResetService {
  async forgotPassword(email: string): Promise<void> {
    if (email === 'nonexistent@example.com') {
      throw new NotFoundError('User not found');
    }
    return Promise.resolve();
  }

  async resetPassword(token: string, newPassword: string, email: string): Promise<void> {
    if (email === 'nonexistent@example.com') {
      throw new NotFoundError('User not found');
    }
    if (token === 'invalid-token') {
      throw new ValidationError('Invalid or expired token');
    }
    return Promise.resolve();
  }
}

// Mock PasswordResetController class
class PasswordResetController {
  private passwordResetService: PasswordResetService;

  constructor(passwordResetService: PasswordResetService) {
    this.passwordResetService = passwordResetService;
  }

  async forgotPassword(req: Request, res: Response): Promise<void> {
    const { email } = req.body;

    if (!email) {
      res.status(422).json({
        status: 'fail',
        message: 'Email is required'
      });
      return;
    }

    try {
      await this.passwordResetService.forgotPassword(email);
      
      res.status(200).json({
        status: 'success',
        message: 'Password reset email sent successfully'
      });
    } catch (error) {
      if (error instanceof NotFoundError) {
        res.status(404).json({
          status: 'fail',
          message: error.message
        });
      } else {
        res.status(500).json({
          status: 'error',
          message: 'An error occurred while sending the password reset email'
        });
      }
    }
  }

  async resetPassword(req: Request, res: Response): Promise<void> {
    const { token, password, passwordConfirm, email } = req.body;

    if (!token || !password || !passwordConfirm || !email) {
      res.status(422).json({
        status: 'fail',
        message: 'Token, password, password confirmation, and email are required'
      });
      return;
    }

    if (password !== passwordConfirm) {
      res.status(422).json({
        status: 'fail',
        message: 'Passwords do not match'
      });
      return;
    }

    try {
      await this.passwordResetService.resetPassword(token, password, email);
      
      res.status(200).json({
        status: 'success',
        message: 'Password reset successful'
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(422).json({
          status: 'fail',
          message: error.message
        });
      } else if (error instanceof NotFoundError) {
        res.status(404).json({
          status: 'fail',
          message: error.message
        });
      } else {
        res.status(500).json({
          status: 'error',
          message: 'An error occurred while resetting the password'
        });
      }
    }
  }
}

describe('PasswordResetController', () => {
  let passwordResetController: PasswordResetController;
  let mockPasswordResetService: jest.Mocked<PasswordResetService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    // Create a mock password reset service
    mockPasswordResetService = {
      forgotPassword: jest.fn(),
      resetPassword: jest.fn()
    } as unknown as jest.Mocked<PasswordResetService>;

    // Create the controller with the mock service
    passwordResetController = new PasswordResetController(mockPasswordResetService);

    // Create mock request and response objects
    mockRequest = {
      body: {}
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('forgotPassword', () => {
    it('should send a password reset email', async () => {
      mockRequest.body = { email: 'test@example.com' };
      mockPasswordResetService.forgotPassword.mockResolvedValue(undefined);

      await passwordResetController.forgotPassword(mockRequest as Request, mockResponse as Response);

      expect(mockPasswordResetService.forgotPassword).toHaveBeenCalledWith('test@example.com');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Password reset email sent successfully'
      });
    });

    it('should handle NotFoundError', async () => {
      mockRequest.body = { email: 'nonexistent@example.com' };
      mockPasswordResetService.forgotPassword.mockRejectedValue(new NotFoundError('User not found'));

      await passwordResetController.forgotPassword(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'fail',
        message: 'User not found'
      });
    });

    it('should handle missing email', async () => {
      mockRequest.body = {};

      await passwordResetController.forgotPassword(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(422);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'fail',
        message: 'Email is required'
      });
    });
  });

  describe('resetPassword', () => {
    it('should reset the password with valid token', async () => {
      mockRequest.body = {
        token: 'reset-token-123',
        password: 'newPassword123',
        passwordConfirm: 'newPassword123',
        email: 'test@example.com'
      };
      mockPasswordResetService.resetPassword.mockResolvedValue(undefined);

      await passwordResetController.resetPassword(mockRequest as Request, mockResponse as Response);

      expect(mockPasswordResetService.resetPassword).toHaveBeenCalledWith(
        'reset-token-123',
        'newPassword123',
        'test@example.com'
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Password reset successful'
      });
    });

    it('should handle ValidationError for invalid token', async () => {
      mockRequest.body = {
        token: 'invalid-token',
        password: 'newPassword123',
        passwordConfirm: 'newPassword123',
        email: 'test@example.com'
      };
      mockPasswordResetService.resetPassword.mockRejectedValue(
        new ValidationError('Invalid or expired token')
      );

      await passwordResetController.resetPassword(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(422);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'fail',
        message: 'Invalid or expired token'
      });
    });

    it('should handle NotFoundError', async () => {
      mockRequest.body = {
        token: 'reset-token-123',
        password: 'newPassword123',
        passwordConfirm: 'newPassword123',
        email: 'nonexistent@example.com'
      };
      mockPasswordResetService.resetPassword.mockRejectedValue(new NotFoundError('User not found'));

      await passwordResetController.resetPassword(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'fail',
        message: 'User not found'
      });
    });

    it('should handle missing required fields', async () => {
      mockRequest.body = {
        token: 'reset-token-123',
        password: 'newPassword123'
        // Missing passwordConfirm and email
      };

      await passwordResetController.resetPassword(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(422);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'fail',
        message: 'Token, password, password confirmation, and email are required'
      });
    });

    it('should handle password mismatch', async () => {
      mockRequest.body = {
        token: 'reset-token-123',
        password: 'newPassword123',
        passwordConfirm: 'differentPassword',
        email: 'test@example.com'
      };

      await passwordResetController.resetPassword(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(422);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'fail',
        message: 'Passwords do not match'
      });
    });
  });
}); 