// Import bootstrap file to set up module aliases
import './bootstrap';

import express, { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';

import { connectDB } from '@shared/infrastructure/database/connection';
import { logger } from '@shared/infrastructure/logging/logger';
import { initCloudinary } from '@shared/infrastructure/services/cloudinary.config';
import { ErrorTypes } from '@shared/types/appError';
import { errorHandler as globalErrorHandler, notFoundHandler } from '@shared/infrastructure/errors/errorHandler';
import { setupSwagger } from '@shared/infrastructure/swagger/swagger';
import { applySecurityMiddleware } from '@shared/infrastructure/middleware/security';
import { setupRoutes } from '@modules/routes';

// Import controllers
import { UserController } from '@modules/user/interface/user.controller';
import { UserService } from '@modules/user/application/user.service';
import { MongoUserRepository } from '@modules/user/infrastructure/user.repository';

import { CustomerController } from '@modules/customer/interface/customer.controller';
import { CustomerService } from '@modules/customer/application/customer.service';
import { CustomerRepository } from '@modules/customer/domain/customer.repository';

dotenv.config();

const app = express();

// Initialize controllers
const userRepository = new MongoUserRepository();
const userService = new UserService(userRepository);
const userController = new UserController(userService);

const customerRepository = new CustomerRepository();
const customerService = new CustomerService(customerRepository);
const customerController = new CustomerController(customerService);

// Apply middleware
app.use(cors());
app.use(helmet());
app.use(compression());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

// Create uploads directory for voucher PDFs
const uploadsDir = path.join(__dirname, '../uploads');
const vouchersDir = path.join(uploadsDir, 'vouchers');

try {
  if (!fs.existsSync(uploadsDir)) {
    logger.info(`Creating uploads directory: ${uploadsDir}`);
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  if (!fs.existsSync(vouchersDir)) {
    logger.info(`Creating vouchers directory: ${vouchersDir}`);
    fs.mkdirSync(vouchersDir, { recursive: true });
  }
} catch (error) {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  logger.error('Failed to create directories:', { error: errorMessage });
  throw ErrorTypes.INTERNAL(`Failed to create required directories: ${errorMessage}`);
}

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Initialize services and start server
const startServer = async () => {
  try {
    await connectDB();
    logger.info('Connected to MongoDB');

    initCloudinary();
    logger.info('Cloudinary initialized');

    // Public routes
    app.post('/api/v1/login', (req: Request, res: Response, next: NextFunction) => userController.login(req, res, next));

    // Health check endpoint
    app.get('/api/v1/health', (req: Request, res: Response) => {
      res.status(200).json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
      });
    });

    // Configure all routes
    setupRoutes(app);

    // Setup Swagger documentation
    setupSwagger(app);

    // Add 404 handler
    app.use(notFoundHandler);

    // Global error handler
    app.use(globalErrorHandler);

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Failed to start server:', { error: errorMessage });
    process.exit(1);
  }
};

startServer();

export { app };
