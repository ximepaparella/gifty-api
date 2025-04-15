import express, { Router, Request, Response, NextFunction } from 'express';
import { UserController } from './user.controller';
import { UserService } from '../application/user.service';
import { MongoUserRepository } from '../infrastructure/user.repository';
import { authenticate } from '@shared/infrastructure/middleware/auth';
import { authorize } from '@shared/infrastructure/middleware/authorize';

// Initialize dependencies
const userRepository = new MongoUserRepository();
const userService = new UserService(userRepository);
const userController = new UserController(userService);

export const userRouter = Router();

// Public routes
userRouter.post('/login', (req: Request, res: Response, next: NextFunction) => userController.login(req, res, next));

// Special endpoint to create the first admin user (no authentication required)
userRouter.post('/setup-admin', (req: Request, res: Response, next: NextFunction) => userController.createFirstAdmin(req, res, next));

// Protected routes
userRouter.use(authenticate);

// User management routes - require admin role
userRouter.get('/', authorize(['admin']), (req: Request, res: Response, next: NextFunction) => userController.getAllUsers(req, res, next));

userRouter.get('/:id', authorize(['admin', 'store_manager']), (req: Request, res: Response, next: NextFunction) =>
  userController.getUserById(req, res, next)
);

userRouter.post('/', authorize(['admin']), (req: Request, res: Response, next: NextFunction) => userController.createUser(req, res, next));

userRouter.put('/:id', authorize(['admin']), (req: Request, res: Response, next: NextFunction) => userController.updateUser(req, res, next));

userRouter.delete('/:id', authorize(['admin']), (req: Request, res: Response, next: NextFunction) => userController.deleteUser(req, res, next));
