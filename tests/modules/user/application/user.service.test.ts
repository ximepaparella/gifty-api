import { UserService } from '../../../../src/modules/user/application/user.service';
import { UserRepository } from '../../../../src/modules/user/domain/user.repository';
import { User, UserRole, CreateUserDTO, UpdateUserDTO } from '../../../../src/modules/user/domain/user.entity';
import { ValidationError, NotFoundError, AuthenticationError } from '../../../../src/shared/infrastructure/errors';
import * as authMiddleware from '../../../../src/shared/infrastructure/middleware/auth';

// Mock the auth middleware
jest.mock('../../../../src/shared/infrastructure/middleware/auth', () => ({
  generateToken: jest.fn().mockReturnValue('mock-token')
}));

describe('UserService', () => {
  let userService: UserService;
  let mockUserRepository: jest.Mocked<UserRepository>;

  const mockUser: User = {
    id: '123',
    name: 'Test User',
    email: 'test@example.com',
    password: 'hashedPassword123',
    role: UserRole.CUSTOMER,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  beforeEach(() => {
    // Create a mock repository
    mockUserRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn()
    } as jest.Mocked<UserRepository>;

    // Create the service with the mock repository
    userService = new UserService(mockUserRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllUsers', () => {
    it('should return all users with pagination', async () => {
      const paginationOptions = { page: 1, limit: 10 };
      const mockPaginatedResult = {
        data: [mockUser],
        pagination: {
          total: 1,
          page: 1,
          limit: 10,
          pages: 1
        }
      };

      mockUserRepository.findAll.mockResolvedValue(mockPaginatedResult);

      const result = await userService.getAllUsers(paginationOptions);

      expect(mockUserRepository.findAll).toHaveBeenCalledWith({}, paginationOptions);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].id).toBe(mockUser.id);
      expect(result.pagination).toEqual(mockPaginatedResult.pagination);
    });
  });

  describe('getUserById', () => {
    it('should return a user by ID', async () => {
      mockUserRepository.findById.mockResolvedValue(mockUser);

      const result = await userService.getUserById('123');

      expect(mockUserRepository.findById).toHaveBeenCalledWith('123');
      expect(result.id).toBe(mockUser.id);
    });

    it('should throw NotFoundError if user does not exist', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(userService.getUserById('123')).rejects.toThrow(NotFoundError);
    });
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      const createUserData: CreateUserDTO = {
        name: 'New User',
        email: 'new@example.com',
        password: 'password123'
      };

      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.create.mockResolvedValue({
        ...mockUser,
        name: createUserData.name,
        email: createUserData.email
      });

      const result = await userService.createUser(createUserData);

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(createUserData.email);
      expect(mockUserRepository.create).toHaveBeenCalledWith(createUserData);
      expect(result.name).toBe(createUserData.name);
      expect(result.email).toBe(createUserData.email);
    });

    it('should throw ValidationError if email already exists', async () => {
      const createUserData: CreateUserDTO = {
        name: 'New User',
        email: 'existing@example.com',
        password: 'password123'
      };

      mockUserRepository.findByEmail.mockResolvedValue(mockUser);

      await expect(userService.createUser(createUserData)).rejects.toThrow(ValidationError);
    });
  });

  describe('updateUser', () => {
    it('should update an existing user', async () => {
      const updateUserData: UpdateUserDTO = {
        name: 'Updated User'
      };

      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockUserRepository.update.mockResolvedValue({
        ...mockUser,
        name: updateUserData.name || mockUser.name
      });

      const result = await userService.updateUser('123', updateUserData);

      expect(mockUserRepository.findById).toHaveBeenCalledWith('123');
      expect(mockUserRepository.update).toHaveBeenCalledWith('123', updateUserData);
      expect(result.name).toBe(updateUserData.name);
    });

    it('should throw NotFoundError if user does not exist', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(userService.updateUser('123', { name: 'Updated User' })).rejects.toThrow(NotFoundError);
    });

    it('should throw ValidationError if updating email to one that already exists', async () => {
      const updateUserData: UpdateUserDTO = {
        email: 'existing@example.com'
      };

      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockUserRepository.findByEmail.mockResolvedValue({ ...mockUser, id: '456' });

      await expect(userService.updateUser('123', updateUserData)).rejects.toThrow(ValidationError);
    });
  });

  describe('deleteUser', () => {
    it('should delete an existing user', async () => {
      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockUserRepository.delete.mockResolvedValue(true);

      const result = await userService.deleteUser('123');

      expect(mockUserRepository.findById).toHaveBeenCalledWith('123');
      expect(mockUserRepository.delete).toHaveBeenCalledWith('123');
      expect(result).toBe(true);
    });

    it('should throw NotFoundError if user does not exist', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(userService.deleteUser('123')).rejects.toThrow(NotFoundError);
    });
  });

  describe('login', () => {
    it('should login a user with valid credentials', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      
      // Mock the comparePassword method
      jest.spyOn(userService as any, 'comparePassword').mockResolvedValue(true);

      const result = await userService.login({
        email: 'test@example.com',
        password: 'password123'
      });

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(authMiddleware.generateToken).toHaveBeenCalledWith({
        id: mockUser.id,
        email: mockUser.email,
        role: mockUser.role
      });
      expect(result.token).toBe('mock-token');
      expect(result.user.id).toBe(mockUser.id);
    });

    it('should throw NotFoundError if user does not exist', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);

      await expect(userService.login({
        email: 'nonexistent@example.com',
        password: 'password123'
      })).rejects.toThrow(NotFoundError);
    });

    it('should throw AuthenticationError if password is invalid', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      
      // Mock the comparePassword method to return false
      jest.spyOn(userService as any, 'comparePassword').mockResolvedValue(false);

      await expect(userService.login({
        email: 'test@example.com',
        password: 'wrongpassword'
      })).rejects.toThrow(AuthenticationError);
    });
  });
}); 