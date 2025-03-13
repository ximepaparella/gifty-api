import { Request, Response } from 'express';
import { UserController } from '../../../../src/modules/user/interface/user.controller';
import { UserService } from '../../../../src/modules/user/application/user.service';
import { ValidationError, NotFoundError, AuthenticationError } from '../../../../src/shared/infrastructure/errors';
import { UserRole } from '../../../../src/modules/user/domain/user.entity';

describe('UserController', () => {
  let userController: UserController;
  let mockUserService: jest.Mocked<UserService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    // Create a mock user service
    mockUserService = {
      getAllUsers: jest.fn(),
      getUserById: jest.fn(),
      createUser: jest.fn(),
      updateUser: jest.fn(),
      deleteUser: jest.fn(),
      login: jest.fn()
    } as unknown as jest.Mocked<UserService>;

    // Create the controller with the mock service
    userController = new UserController(mockUserService);

    // Create mock request and response objects
    mockRequest = {
      params: {},
      query: {},
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

  describe('getAllUsers', () => {
    it('should return all users with pagination', async () => {
      const mockUsers = [
        {
          id: '123',
          name: 'Test User',
          email: 'test@example.com',
          role: UserRole.CUSTOMER,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      const mockPagination = {
        total: 1,
        page: 1,
        limit: 10,
        pages: 1
      };

      mockRequest.query = { page: '1', limit: '10' };
      mockUserService.getAllUsers.mockResolvedValue({
        data: mockUsers,
        pagination: mockPagination
      });

      await userController.getAllUsers(mockRequest as Request, mockResponse as Response);

      expect(mockUserService.getAllUsers).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        sort: undefined
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockUsers,
        pagination: mockPagination
      });
    });

    it('should handle errors', async () => {
      mockUserService.getAllUsers.mockRejectedValue(new Error('Test error'));

      await userController.getAllUsers(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Internal server error'
      });
    });
  });

  describe('getUserById', () => {
    it('should return a user by ID', async () => {
      const mockUser = {
        id: '123',
        name: 'Test User',
        email: 'test@example.com',
        role: UserRole.CUSTOMER,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockRequest.params = { id: '123' };
      mockUserService.getUserById.mockResolvedValue(mockUser);

      await userController.getUserById(mockRequest as Request, mockResponse as Response);

      expect(mockUserService.getUserById).toHaveBeenCalledWith('123');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockUser
      });
    });

    it('should handle NotFoundError', async () => {
      mockRequest.params = { id: '123' };
      mockUserService.getUserById.mockRejectedValue(new NotFoundError('User not found'));

      await userController.getUserById(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'fail',
        message: 'User not found'
      });
    });
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      const mockUser = {
        id: '123',
        name: 'New User',
        email: 'new@example.com',
        role: UserRole.CUSTOMER,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockRequest.body = {
        name: 'New User',
        email: 'new@example.com',
        password: 'password123'
      };
      mockUserService.createUser.mockResolvedValue(mockUser);

      await userController.createUser(mockRequest as Request, mockResponse as Response);

      expect(mockUserService.createUser).toHaveBeenCalledWith(mockRequest.body);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockUser
      });
    });

    it('should handle ValidationError', async () => {
      mockRequest.body = {
        name: 'New User',
        email: 'existing@example.com',
        password: 'password123'
      };
      mockUserService.createUser.mockRejectedValue(new ValidationError('Email already registered'));

      await userController.createUser(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(422);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'fail',
        message: 'Email already registered'
      });
    });
  });

  describe('updateUser', () => {
    it('should update an existing user', async () => {
      const mockUser = {
        id: '123',
        name: 'Updated User',
        email: 'test@example.com',
        role: UserRole.CUSTOMER,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockRequest.params = { id: '123' };
      mockRequest.body = { name: 'Updated User' };
      mockUserService.updateUser.mockResolvedValue(mockUser);

      await userController.updateUser(mockRequest as Request, mockResponse as Response);

      expect(mockUserService.updateUser).toHaveBeenCalledWith('123', mockRequest.body);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockUser
      });
    });

    it('should handle NotFoundError', async () => {
      mockRequest.params = { id: '123' };
      mockRequest.body = { name: 'Updated User' };
      mockUserService.updateUser.mockRejectedValue(new NotFoundError('User not found'));

      await userController.updateUser(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'fail',
        message: 'User not found'
      });
    });
  });

  describe('deleteUser', () => {
    it('should delete an existing user', async () => {
      mockRequest.params = { id: '123' };
      mockUserService.deleteUser.mockResolvedValue(true);

      await userController.deleteUser(mockRequest as Request, mockResponse as Response);

      expect(mockUserService.deleteUser).toHaveBeenCalledWith('123');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'User deleted successfully'
      });
    });

    it('should handle NotFoundError', async () => {
      mockRequest.params = { id: '123' };
      mockUserService.deleteUser.mockRejectedValue(new NotFoundError('User not found'));

      await userController.deleteUser(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'fail',
        message: 'User not found'
      });
    });
  });

  describe('login', () => {
    it('should login a user with valid credentials', async () => {
      const mockLoginResponse = {
        token: 'jwt-token',
        user: {
          id: '123',
          name: 'Test User',
          email: 'test@example.com',
          role: UserRole.CUSTOMER,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      };

      mockRequest.body = {
        email: 'test@example.com',
        password: 'password123'
      };
      mockUserService.login.mockResolvedValue(mockLoginResponse);

      await userController.login(mockRequest as Request, mockResponse as Response);

      expect(mockUserService.login).toHaveBeenCalledWith(mockRequest.body);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockLoginResponse
      });
    });

    it('should handle AuthenticationError', async () => {
      mockRequest.body = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };
      mockUserService.login.mockRejectedValue(new AuthenticationError('Invalid credentials'));

      await userController.login(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'fail',
        message: 'Invalid credentials'
      });
    });
  });

  describe('createFirstAdmin', () => {
    it('should create the first admin user', async () => {
      const mockAdmin = {
        id: '123',
        name: 'Admin User',
        email: 'admin@example.com',
        role: UserRole.ADMIN,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockRequest.body = {
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'adminpassword123'
      };
      mockUserService.createUser.mockResolvedValue(mockAdmin);

      await userController.createFirstAdmin(mockRequest as Request, mockResponse as Response);

      expect(mockUserService.createUser).toHaveBeenCalledWith({
        ...mockRequest.body,
        role: 'admin'
      });
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Admin user created successfully. You can now log in.',
        data: mockAdmin
      });
    });

    it('should handle ValidationError', async () => {
      mockRequest.body = {
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'adminpassword123'
      };
      mockUserService.createUser.mockRejectedValue(new ValidationError('Email already registered'));

      await userController.createFirstAdmin(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(422);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'fail',
        message: 'Email already registered'
      });
    });
  });
}); 