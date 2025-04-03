import express, { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import passport from 'passport';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';

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
import orderRoutes from '@modules/order/interface/order.routes';
// Customer routes are handled directly for stability

import { UserController } from '@modules/user/interface/user.controller';
import { UserService } from '@modules/user/application/user.service';
import { MongoUserRepository } from '@modules/user/infrastructure/user.repository';

// Import customer components directly
import { CustomerController } from '@modules/customer/interface/customer.controller';
import { CustomerService } from '@modules/customer/application/customer.service';
import { CustomerRepository } from '@modules/customer/domain/customer.repository';

// Load environment variables
dotenv.config();

const app = express();

// Initialize user controller for login route
const userRepository = new MongoUserRepository();
const userService = new UserService(userRepository);
const userController = new UserController(userService);

// Initialize customer controller directly
const customerRepository = new CustomerRepository();
const customerService = new CustomerService(customerRepository);
const customerController = new CustomerController(customerService);

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(passport.initialize());

// Create uploads directory for voucher PDFs
const uploadsDir = path.join(__dirname, '../uploads');
const vouchersDir = path.join(uploadsDir, 'vouchers');

if (!fs.existsSync(uploadsDir)) {
  logger.info(`Creating uploads directory: ${uploadsDir}`);
  fs.mkdirSync(uploadsDir, { recursive: true });
}

if (!fs.existsSync(vouchersDir)) {
  logger.info(`Creating vouchers directory: ${vouchersDir}`);
  fs.mkdirSync(vouchersDir, { recursive: true });
}

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Public routes
app.post('/api/v1/login', (req: Request, res: Response) => userController.login(req, res));
app.use('/api/v1/auth', passwordResetRoutes);

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

// Customer routes defined directly (hardcoded)
// We're defining these routes directly in server.ts for maximum stability

// Simple test endpoint (public)
app.get('/api/v1/customers-test', (req: Request, res: Response) => {
  res.status(200).json({ message: 'Customer test route is working!' });
});

// Authentication middleware for customer routes
import { authenticate } from '@shared/infrastructure/middleware/auth';
const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  authenticate(req, res, next);
};

// Get all customers
app.get('/api/v1/customers', authMiddleware, (req: Request, res: Response, next: NextFunction) => {
  customerController.getCustomers(req, res, next);
});

// Create new customer
app.post('/api/v1/customers', authMiddleware, (req: Request, res: Response, next: NextFunction) => {
  customerController.createCustomer(req, res, next);
});

// Get customer by ID
app.get('/api/v1/customers/:id', authMiddleware, (req: Request, res: Response, next: NextFunction) => {
  customerController.getCustomerById(req, res, next);
});

// Update customer
app.put('/api/v1/customers/:id', authMiddleware, (req: Request, res: Response, next: NextFunction) => {
  customerController.updateCustomer(req, res, next);
});

// Delete customer
app.delete('/api/v1/customers/:id', authMiddleware, (req: Request, res: Response, next: NextFunction) => {
  customerController.deleteCustomer(req, res, next);
});

// Setup Swagger documentation
setupSwagger(app);

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