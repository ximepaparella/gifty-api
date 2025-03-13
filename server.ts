import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import passport from 'passport';
import dotenv from 'dotenv';
import { connectDatabase } from '@database/connection';
import logger from '@shared/infrastructure/logging/logger';
import { initCloudinary } from './src/shared/infrastructure/services/cloudinary.config';
import { AppError } from '@shared/types/appError';
import { setupSwagger } from './src/shared/infrastructure/swagger/swagger';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(passport.initialize());

// Setup Swagger documentation
setupSwagger(app);

// Routes
import userRoutes from './src/modules/user/interface/user.routes';
app.use('/api/v1/users', userRoutes);

// Password reset routes
import passwordResetRoutes from './src/modules/user/interface/passwordReset.routes';
app.use('/api/v1/auth', passwordResetRoutes);

import storeRoutes from './src/modules/store/interface/store.routes';
app.use('/api/v1/stores', storeRoutes);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err: Error | AppError, req: Request, res: Response, next: NextFunction): void => {
  logger.error('Error:', err);
  
  if ('isOperational' in err && err.isOperational) {
    res.status((err as AppError).statusCode).json({
      status: (err as AppError).status,
      message: err.message
    });
    return;
  }

  // Programming or other unknown error
  res.status(500).json({
    status: 'error',
    message: 'Something went wrong!'
  });
});

const PORT = process.env.PORT || 3000;

const startServer = async (): Promise<void> => {
  try {
    await connectDatabase();
    initCloudinary();
    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
      logger.info(`API Documentation available at http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app; 