// Import bootstrap file to set up module aliases
import './bootstrap';

import express, { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import passport from 'passport';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

import { connectDatabase } from '@shared/infrastructure/database/connection';
import logger from '@shared/infrastructure/logging/logger';
import { initCloudinary } from '@shared/infrastructure/services/cloudinary.config';
import { AppError } from '@shared/types/appError';
import { errorHandler as globalErrorHandler } from '@shared/infrastructure/errors/errorHandler';
import { setupSwagger } from '@shared/infrastructure/swagger/swagger';

// Import routes
import userRoutes from '@modules/user/interface/user.routes';
import passwordResetRoutes from '@modules/user/interface/passwordReset.routes';
import { storeRoutes } from '@modules/store/interface/store.routes';
import { productRoutes } from '@modules/product/interface/product.routes';
import voucherRoutes from '@modules/voucher/interface/voucher.routes';
import { UserController } from '@modules/user/interface/user.controller';
import { UserService } from '@modules/user/application/user.service';
import { MongoUserRepository } from '@modules/user/infrastructure/user.repository';

dotenv.config();

const app = express();

// Initialize user controller for login route
const userRepository = new MongoUserRepository();
const userService = new UserService(userRepository);
const userController = new UserController(userService);

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(passport.initialize());

// Login route - separate from user routes for better accessibility
app.post('/api/v1/login', (req: Request, res: Response) => userController.login(req, res));

// Test route for vouchers
app.get('/api/v1/test-vouchers', (req: Request, res: Response) => {
  res.status(200).json({ success: true, message: 'Voucher test route is working' });
});

// Routes
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/auth', passwordResetRoutes);
app.use('/api/v1/stores', storeRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/vouchers', voucherRoutes);

// Setup Swagger documentation
setupSwagger(app);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
const errorHandler: ErrorRequestHandler = (err: AppError, req: Request, res: Response, next: NextFunction): void => {
  logger.error('Error:', err);
  
  if (err.isOperational) {
    res.status(err.statusCode || 500).json({
      status: err.status || 'error',
      message: err.message
    });
    return;
  }

  // Programming or other unknown error
  res.status(500).json({
    status: 'error',
    message: 'Something went wrong!'
  });
};

app.use(globalErrorHandler);

// Database connection
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  throw new Error('MONGO_URI environment variable is not defined');
}

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  });

export default app; 