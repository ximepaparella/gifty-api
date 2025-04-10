import express from 'express';
import { UserController } from './user.controller';
import { UserService } from '../application/user.service';
import { MongoUserRepository } from '../infrastructure/user.repository';
import { authenticate } from '@shared/infrastructure/middleware/auth';
import { authorize } from '@shared/infrastructure/middleware/authorize';

// Initialize dependencies
const userRepository = new MongoUserRepository();
const userService = new UserService(userRepository);
const userController = new UserController(userService);

const router = express.Router();

// Public routes
router.post('/login', (req, res) => userController.login(req, res));

// Special endpoint to create the first admin user (no authentication required)
router.post('/setup-admin', (req, res) => userController.createFirstAdmin(req, res));

// Protected routes
router.use(authenticate);

// User management routes - require admin role
router.get('/', authorize(['admin']), (req, res) => userController.getAllUsers(req, res));

router.get('/:id', authorize(['admin', 'store_manager']), (req, res) =>
  userController.getUserById(req, res)
);

router.post('/', authorize(['admin']), (req, res) => userController.createUser(req, res));

router.put('/:id', authorize(['admin']), (req, res) => userController.updateUser(req, res));

router.delete('/:id', authorize(['admin']), (req, res) => userController.deleteUser(req, res));

export default router;
