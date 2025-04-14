import { Request, Response, NextFunction } from 'express';
import { UserService } from '../application/user.service';
import { CreateUserDTO, UpdateUserDTO, LoginCredentialsDTO } from '../domain/user.entity';
import { ErrorTypes } from '@shared/types/appError';
import { logger } from '@shared/infrastructure/logging/logger';

export class UserController {
  constructor(private userService: UserService) {}

  /**
   * Get all users with pagination
   */
  async getAllUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page, limit, sort } = req.query;

      const options = {
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        sort: sort as string | undefined,
      };

      const result = await this.userService.getAllUsers(options);

      res.status(200).json({
        success: true,
        data: result.data,
        pagination: {
          page: options.page || 1,
          limit: options.limit || 10,
          total: result.pagination.total,
        },
      });
    } catch (error) {
      logger.error('Error in getAllUsers controller:', error);
      next(error);
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const user = await this.userService.getUserById(id);

      if (!user) {
        return next(ErrorTypes.NOT_FOUND('User'));
      }

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      logger.error(`Error in getUserById controller for id ${req.params.id}:`, error);
      next(error);
    }
  }

  /**
   * Create a new user
   */
  async createUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userData: CreateUserDTO = req.body;
      const user = await this.userService.createUser(userData);

      res.status(201).json({
        success: true,
        data: user,
      });
    } catch (error) {
      logger.error('Error in createUser controller:', error);
      next(error);
    }
  }

  /**
   * Update an existing user
   */
  async updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userData: UpdateUserDTO = req.body;
      const user = await this.userService.updateUser(id, userData);

      if (!user) {
        return next(ErrorTypes.NOT_FOUND('User'));
      }

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      logger.error(`Error in updateUser controller for id ${req.params.id}:`, error);
      next(error);
    }
  }

  /**
   * Delete a user
   */
  async deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const result = await this.userService.deleteUser(id);

      if (!result) {
        return next(ErrorTypes.NOT_FOUND('User'));
      }

      res.status(200).json({
        success: true,
        message: 'User deleted successfully',
      });
    } catch (error) {
      logger.error(`Error in deleteUser controller for id ${req.params.id}:`, error);
      next(error);
    }
  }

  /**
   * Login a user
   */
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const credentials: LoginCredentialsDTO = req.body;
      const result = await this.userService.login(credentials);

      if (!result) {
        return next(ErrorTypes.UNAUTHORIZED('Invalid credentials'));
      }

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error('Error in login controller:', error);
      next(error);
    }
  }

  /**
   * Create the first admin user (no authentication required)
   * This endpoint should only be used for initial setup
   */
  async createFirstAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Force the role to be admin
      const userData: CreateUserDTO = {
        ...req.body,
        role: 'admin',
      };

      const user = await this.userService.createUser(userData);

      res.status(201).json({
        success: true,
        data: user,
        message: 'Admin user created successfully. You can now log in.',
      });
    } catch (error) {
      logger.error('Error in createFirstAdmin controller:', error);
      next(error);
    }
  }
}
