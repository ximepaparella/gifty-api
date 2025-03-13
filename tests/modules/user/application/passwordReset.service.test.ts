// Mock classes and interfaces
interface UserDocument {
  id: string;
  email: string;
  password: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  createPasswordResetToken: () => string;
  save: () => Promise<boolean>;
}

interface UserRepository {
  findByEmail: (email: string) => Promise<UserDocument | null>;
  update: (id: string, data: any) => Promise<UserDocument>;
}

interface EmailService {
  sendPasswordResetEmail: (email: string, token: string) => Promise<boolean>;
}

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
  private userRepository: UserRepository;
  private emailService: EmailService;

  constructor(userRepository: UserRepository, emailService: EmailService) {
    this.userRepository = userRepository;
    this.emailService = emailService;
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.userRepository.findByEmail(email);
    
    if (!user) {
      throw new NotFoundError(`No user found with email ${email}`);
    }
    
    const resetToken = user.createPasswordResetToken();
    await user.save();
    
    await this.emailService.sendPasswordResetEmail(email, resetToken);
  }

  async resetPassword(token: string, newPassword: string, email: string): Promise<void> {
    const user = await this.userRepository.findByEmail(email);
    
    if (!user) {
      throw new NotFoundError(`No user found with email ${email}`);
    }
    
    if (!user.passwordResetToken || !user.passwordResetExpires) {
      throw new ValidationError('Invalid or expired token');
    }
    
    if (user.passwordResetToken !== token) {
      throw new ValidationError('Invalid token');
    }
    
    if (user.passwordResetExpires < new Date()) {
      throw new ValidationError('Token has expired');
    }
    
    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    
    await user.save();
  }
}

describe('PasswordResetService', () => {
  let passwordResetService: PasswordResetService;
  let mockUserRepository: jest.Mocked<UserRepository>;
  let mockEmailService: jest.Mocked<EmailService>;

  const mockUser = {
    id: '123',
    email: 'test@example.com',
    password: 'hashedPassword123',
    createPasswordResetToken: jest.fn().mockReturnValue('reset-token-123'),
    save: jest.fn().mockResolvedValue(true),
    passwordResetToken: undefined,
    passwordResetExpires: undefined
  } as unknown as UserDocument;

  beforeEach(() => {
    // Create mock repository and email service
    mockUserRepository = {
      findByEmail: jest.fn(),
      update: jest.fn()
    } as unknown as jest.Mocked<UserRepository>;

    mockEmailService = {
      sendPasswordResetEmail: jest.fn().mockResolvedValue(true)
    } as unknown as jest.Mocked<EmailService>;

    // Create the service with the mocks
    passwordResetService = new PasswordResetService(mockUserRepository, mockEmailService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('forgotPassword', () => {
    it('should generate a reset token and send an email', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);

      await passwordResetService.forgotPassword('test@example.com');

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(mockUser.createPasswordResetToken).toHaveBeenCalled();
      expect(mockUser.save).toHaveBeenCalled();
      expect(mockEmailService.sendPasswordResetEmail).toHaveBeenCalledWith(
        'test@example.com',
        expect.any(String)
      );
    });

    it('should throw NotFoundError if user does not exist', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);

      await expect(passwordResetService.forgotPassword('nonexistent@example.com'))
        .rejects.toThrow(NotFoundError);
    });
  });

  describe('resetPassword', () => {
    it('should reset the password with a valid token', async () => {
      const now = new Date();
      const futureDate = new Date(now.getTime() + 3600000); // 1 hour in the future
      
      const mockUserWithToken = {
        ...mockUser,
        passwordResetToken: 'reset-token-123',
        passwordResetExpires: futureDate,
        password: 'oldHashedPassword',
        save: jest.fn().mockResolvedValue(true)
      };

      mockUserRepository.findByEmail.mockResolvedValue(mockUserWithToken);

      await passwordResetService.resetPassword('reset-token-123', 'newPassword123', 'test@example.com');

      expect(mockUserWithToken.password).toBe('newPassword123');
      expect(mockUserWithToken.passwordResetToken).toBeUndefined();
      expect(mockUserWithToken.passwordResetExpires).toBeUndefined();
      expect(mockUserWithToken.save).toHaveBeenCalled();
    });

    it('should throw NotFoundError if user does not exist', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);

      await expect(passwordResetService.resetPassword(
        'reset-token-123',
        'newPassword123',
        'nonexistent@example.com'
      )).rejects.toThrow(NotFoundError);
    });

    it('should throw ValidationError if token is invalid', async () => {
      const mockUserWithToken = {
        ...mockUser,
        passwordResetToken: 'different-token',
        passwordResetExpires: new Date(Date.now() + 3600000)
      };

      mockUserRepository.findByEmail.mockResolvedValue(mockUserWithToken);

      await expect(passwordResetService.resetPassword(
        'reset-token-123',
        'newPassword123',
        'test@example.com'
      )).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError if token has expired', async () => {
      const now = new Date();
      const pastDate = new Date(now.getTime() - 3600000); // 1 hour in the past
      
      const mockUserWithToken = {
        ...mockUser,
        passwordResetToken: 'reset-token-123',
        passwordResetExpires: pastDate
      };

      mockUserRepository.findByEmail.mockResolvedValue(mockUserWithToken);

      await expect(passwordResetService.resetPassword(
        'reset-token-123',
        'newPassword123',
        'test@example.com'
      )).rejects.toThrow(ValidationError);
    });
  });
}); 