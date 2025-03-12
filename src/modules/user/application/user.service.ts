import { User, CreateUserDTO, UpdateUserDTO, UserDTO, LoginCredentialsDTO, LoginResponseDTO } from '../domain/user.entity';
import { UserRepository } from '../domain/user.repository';
import { PaginationOptions, PaginatedResult } from '@shared/types';
import { ValidationError, NotFoundError, AuthenticationError } from '@shared/infrastructure/errors';
import { generateToken } from '@shared/infrastructure/middleware/auth';
import logger from '@shared/infrastructure/logging/logger';

export class UserService {
  constructor(private userRepository: UserRepository) {}

  async getAllUsers(options?: PaginationOptions): Promise<PaginatedResult<UserDTO>> {
    try {
      const result = await this.userRepository.findAll({}, options);
      
      // Map to DTOs (remove password)
      const users = result.data.map(user => this.mapToDTO(user));
      
      return {
        data: users,
        pagination: result.pagination
      };
    } catch (error) {
      logger.error('Error getting all users:', error);
      throw error;
    }
  }

  async getUserById(id: string): Promise<UserDTO> {
    try {
      const user = await this.userRepository.findById(id);
      
      if (!user) {
        throw new NotFoundError(`User with id ${id} not found`);
      }
      
      return this.mapToDTO(user);
    } catch (error) {
      logger.error(`Error getting user by id ${id}:`, error);
      throw error;
    }
  }

  async createUser(userData: CreateUserDTO): Promise<UserDTO> {
    try {
      // Check if email already exists
      const existingUser = await this.userRepository.findByEmail(userData.email);
      
      if (existingUser) {
        throw new ValidationError('Email already registered');
      }
      
      // Create user
      const user = await this.userRepository.create(userData);
      
      return this.mapToDTO(user);
    } catch (error) {
      logger.error('Error creating user:', error);
      throw error;
    }
  }

  async updateUser(id: string, userData: UpdateUserDTO): Promise<UserDTO> {
    try {
      // Check if user exists
      const existingUser = await this.userRepository.findById(id);
      
      if (!existingUser) {
        throw new NotFoundError(`User with id ${id} not found`);
      }
      
      // If email is being updated, check if it's already in use
      if (userData.email && userData.email !== existingUser.email) {
        const userWithEmail = await this.userRepository.findByEmail(userData.email);
        
        if (userWithEmail) {
          throw new ValidationError('Email already in use');
        }
      }
      
      // Update user
      const updatedUser = await this.userRepository.update(id, userData);
      
      if (!updatedUser) {
        throw new Error('Failed to update user');
      }
      
      return this.mapToDTO(updatedUser);
    } catch (error) {
      logger.error(`Error updating user ${id}:`, error);
      throw error;
    }
  }

  async deleteUser(id: string): Promise<boolean> {
    try {
      // Check if user exists
      const existingUser = await this.userRepository.findById(id);
      
      if (!existingUser) {
        throw new NotFoundError(`User with id ${id} not found`);
      }
      
      // Delete user
      return await this.userRepository.delete(id);
    } catch (error) {
      logger.error(`Error deleting user ${id}:`, error);
      throw error;
    }
  }

  async login(credentials: LoginCredentialsDTO): Promise<LoginResponseDTO> {
    try {
      // Find user by email
      const user = await this.userRepository.findByEmail(credentials.email);
      
      if (!user) {
        throw new NotFoundError('User not found');
      }
      
      // Compare passwords - this will use the model's comparePassword method
      const isPasswordValid = await this.comparePassword(credentials.password, user.password);
      
      if (!isPasswordValid) {
        throw new AuthenticationError('Invalid credentials');
      }
      
      // Generate JWT token
      const token = generateToken({
        id: user.id!,
        email: user.email,
        role: user.role
      });
      
      return {
        token,
        user: this.mapToDTO(user)
      };
    } catch (error) {
      logger.error('Error during login:', error);
      throw error;
    }
  }

  // Helper method to compare passwords
  private async comparePassword(candidatePassword: string, userPassword: string): Promise<boolean> {
    try {
      // Import bcrypt here to avoid circular dependencies
      const bcrypt = require('bcrypt');
      return await bcrypt.compare(candidatePassword, userPassword);
    } catch (error) {
      logger.error('Error comparing passwords:', error);
      return false;
    }
  }

  // Helper method to map User to UserDTO (remove sensitive data)
  private mapToDTO(user: User): UserDTO {
    return {
      id: user.id!,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt || new Date(),
      updatedAt: user.updatedAt || new Date()
    };
  }
} 