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

const router = Router();

// Public routes
router.post('/login', (req: Request, res: Response, next: NextFunction) => userController.login(req, res, next));

// Special endpoint to create the first admin user (no authentication required)
router.post('/setup-admin', (req: Request, res: Response, next: NextFunction) => userController.createFirstAdmin(req, res, next));

// Protected routes
router.use(authenticate);

// User management routes - require admin role
router.get('/', authorize(['admin']), (req: Request, res: Response, next: NextFunction) => userController.getAllUsers(req, res, next));

router.get('/:id', authorize(['admin', 'store_manager']), (req: Request, res: Response, next: NextFunction) =>
  userController.getUserById(req, res, next)
);

router.post('/', authorize(['admin']), (req: Request, res: Response, next: NextFunction) => userController.createUser(req, res, next));

router.put('/:id', authorize(['admin']), (req: Request, res: Response, next: NextFunction) => userController.updateUser(req, res, next));

router.delete('/:id', authorize(['admin']), (req: Request, res: Response, next: NextFunction) => userController.deleteUser(req, res, next));

export default router;
