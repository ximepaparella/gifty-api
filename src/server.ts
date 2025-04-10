// Import bootstrap file to set up module aliases
import './bootstrap';

import express, { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import passport from 'passport';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';

import { connectDB } from '@shared/infrastructure/database/connection';
import logger from '@shared/infrastructure/logging/logger';
import { initCloudinary } from '@shared/infrastructure/services/cloudinary.config';
import { AppError, ErrorTypes } from '@shared/types/appError';
import { errorHandler as globalErrorHandler } from '@shared/infrastructure/errors/errorHandler';
import { setupSwagger } from '@shared/infrastructure/swagger/swagger';
import { applySecurityMiddleware } from '@shared/infrastructure/middleware/security';
import { setupRoutes } from './modules/routes';

// Import routes
import userRoutes from '@modules/user/interface/user.routes';
import passwordResetRoutes from '@modules/user/interface/passwordReset.routes';
import { storeRoutes } from '@modules/store/interface/store.routes';
import { productRoutes } from '@modules/product/interface/product.routes';
import voucherRoutes from '@modules/voucher/interface/voucher.routes';
import orderRoutes from '@modules/order/interface/order.routes';
const customerRoutes = require('@modules/customer/interface/customer.routes');
import { UserController } from '@modules/user/interface/user.controller';
import { UserService } from '@modules/user/application/user.service';
import { MongoUserRepository } from '@modules/user/infrastructure/user.repository';

dotenv.config();

const app = express();

// Initialize user controller for login route
const userRepository = new MongoUserRepository();
const userService = new UserService(userRepository);
const userController = new UserController(userService);

// Apply middleware
app.use(cors());
app.use(helmet());
app.use(compression());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize services
connectDB()
  .then(() => {
    logger.info('Connected to MongoDB');
    initCloudinary();
    logger.info('Cloudinary initialized');
  })
  .catch((error) => {
    logger.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  });

// Configure routes
setupRoutes(app);

// Public routes
app.post('/api/v1/login', (req: Request, res: Response, next: NextFunction) => userController.login(req, res, next));
app.use('/api/v1/auth', passwordResetRoutes);
app.use('/api/v1/customers', customerRoutes);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Protected routes
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/stores', storeRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/vouchers', voucherRoutes);
app.use('/api/v1/orders', orderRoutes);

// Setup Swagger documentation
setupSwagger(app);

// Error handling middleware
const errorHandler: ErrorRequestHandler = (
  err: AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  logger.error('Error:', err);

  if (err.isOperational) {
    res.status(err.status || 500).json({
      status: err.status || 'error',
      message: err.message,
    });
    return;
  }

  // Programming or other unknown error
  res.status(500).json({
    status: 'error',
    message: 'Something went wrong!',
  });
};

app.use(errorHandler);

export default app;
