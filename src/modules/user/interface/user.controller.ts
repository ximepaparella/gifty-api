import { Request, Response } from 'express';
import { UserService } from '../application/user.service';
import { CreateUserDTO, UpdateUserDTO, LoginCredentialsDTO } from '../domain/user.entity';
import { ValidationError, NotFoundError, AuthenticationError } from '@shared/infrastructure/errors';
import logger from '@shared/infrastructure/logging/logger';

export class UserController {
  constructor(private userService: UserService) {}

  /**
   * Get all users with pagination
   */
  async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      const { page, limit, sort } = req.query;
      
      const options = {
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        sort: sort as string | undefined
      };
      
      const result = await this.userService.getAllUsers(options);
      
      res.status(200).json({
        status: 'success',
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      logger.error('Error in getAllUsers controller:', error);
      this.handleError(error, res);
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const user = await this.userService.getUserById(id);
      
      res.status(200).json({
        status: 'success',
        data: user
      });
    } catch (error) {
      logger.error(`Error in getUserById controller for id ${req.params.id}:`, error);
      this.handleError(error, res);
    }
  }

  /**
   * Create a new user
   */
  async createUser(req: Request, res: Response): Promise<void> {
    try {
      const userData: CreateUserDTO = req.body;
      const user = await this.userService.createUser(userData);
      
      res.status(201).json({
        status: 'success',
        data: user
      });
    } catch (error) {
      logger.error('Error in createUser controller:', error);
      this.handleError(error, res);
    }
  }

  /**
   * Update an existing user
   */
  async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userData: UpdateUserDTO = req.body;
      
      const user = await this.userService.updateUser(id, userData);
      
      res.status(200).json({
        status: 'success',
        data: user
      });
    } catch (error) {
      logger.error(`Error in updateUser controller for id ${req.params.id}:`, error);
      this.handleError(error, res);
    }
  }

  /**
   * Delete a user
   */
  async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await this.userService.deleteUser(id);
      
      res.status(200).json({
        status: 'success',
        message: 'User deleted successfully'
      });
    } catch (error) {
      logger.error(`Error in deleteUser controller for id ${req.params.id}:`, error);
      this.handleError(error, res);
    }
  }

  /**
   * Login a user
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      const credentials: LoginCredentialsDTO = req.body;
      const result = await this.userService.login(credentials);
      
      res.status(200).json({
        status: 'success',
        data: result
      });
    } catch (error) {
      logger.error('Error in login controller:', error);
      this.handleError(error, res);
    }
  }

  /**
   * Create the first admin user (no authentication required)
   * This endpoint should only be used for initial setup
   */
  async createFirstAdmin(req: Request, res: Response): Promise<void> {
    try {
      // TEMPORARY: Bypassing the check for existing users
      // const { page, limit } = { page: 1, limit: 1 };
      // const result = await this.userService.getAllUsers({ page, limit });
      
      // // If users already exist, prevent creating another admin through this endpoint
      // if (result.pagination.total > 0) {
      //   res.status(403).json({
      //     status: 'fail',
      //     message: 'Setup already completed. Cannot create another admin through this endpoint.'
      //   });
      //   return;
      // }
      
      // Force the role to be admin
      const userData: CreateUserDTO = {
        ...req.body,
        role: 'admin'
      };
      
      const user = await this.userService.createUser(userData);
      
      res.status(201).json({
        status: 'success',
        message: 'Admin user created successfully. You can now log in.',
        data: user
      });
    } catch (error) {
      logger.error('Error in createFirstAdmin controller:', error);
      this.handleError(error, res);
    }
  }

  /**
   * Handle errors and send appropriate responses
   */
  private handleError(error: unknown, res: Response): void {
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
    } else if (error instanceof AuthenticationError) {
      res.status(401).json({
        status: 'fail',
        message: error.message
      });
    } else {
      res.status(500).json({
        status: 'error',
        message: 'Internal server error'
      });
    }
  }
} 