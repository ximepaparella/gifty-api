// Import bootstrap file to set up module aliases
import './bootstrap';

import express, { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import passport from 'passport';
import dotenv from 'dotenv';
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
import { errorHandler as globalErrorHandler, notFoundHandler } from '@shared/infrastructure/errors/errorHandler';
import { setupSwagger } from '@shared/infrastructure/swagger/swagger';
import { applySecurityMiddleware } from '@shared/infrastructure/middleware/security';
import { setupRoutes } from '@modules/routes';
import { authenticate } from '@shared/infrastructure/middleware/auth';

// Import routes and controllers
import userRoutes from '@modules/user/interface/user.routes';
import passwordResetRoutes from '@modules/user/interface/passwordReset.routes';
import { storeRoutes } from '@modules/store/interface/store.routes';
import { productRoutes } from '@modules/product/interface/product.routes';
import voucherRoutes from '@modules/voucher/interface/voucher.routes';
import orderRoutes from '@modules/order/interface/order.routes';

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

// Customer routes
app.get('/api/v1/customers-test', (req: Request, res: Response) => {
  res.status(200).json({ message: 'Customer test route is working!' });
});

app.get('/api/v1/customers', authenticate, (req: Request, res: Response, next: NextFunction) => {
  customerController.getCustomers(req, res, next);
});

app.post('/api/v1/customers', (req: Request, res: Response, next: NextFunction) => {
  customerController.createCustomer(req, res, next);
});

app.post('/api/v1/customers/get-or-create', (req: Request, res: Response, next: NextFunction) => {
  customerController.getOrCreateCustomer(req, res, next);
});

app.get('/api/v1/customers/:id', authenticate, (req: Request, res: Response, next: NextFunction) => {
  customerController.getCustomerById(req, res, next);
});

app.put('/api/v1/customers/:id', authenticate, (req: Request, res: Response, next: NextFunction) => {
  customerController.updateCustomer(req, res, next);
});

app.delete('/api/v1/customers/:id', authenticate, (req: Request, res: Response, next: NextFunction) => {
  customerController.deleteCustomer(req, res, next);
});

// Setup Swagger documentation
setupSwagger(app);

// Add 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(globalErrorHandler);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});

export default app;
