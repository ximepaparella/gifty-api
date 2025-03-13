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
import mongoose from 'mongoose';
import swaggerUi from 'swagger-ui-express';
import { errorHandler as globalErrorHandler } from '@shared/infrastructure/errors/errorHandler';
import { storeRoutes } from '@modules/store/interface/store.routes';
import { storeSwagger } from '@modules/store/interface/store.swagger';
import { productRoutes } from '@modules/product/interface/product.routes';
import { productSwagger } from '@modules/product/interface/product.swagger';

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

app.use('/api/v1/stores', storeRoutes);
app.use('/api/v1/products', productRoutes);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use(globalErrorHandler);

// Swagger documentation
const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Gifty API',
    version: '1.0.0',
    description: 'API documentation for Gifty'
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    },
    ...storeSwagger.components,
    ...productSwagger.components
  },
  paths: {
    ...storeSwagger.paths,
    ...productSwagger.paths
  }
};

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const startServer = async (): Promise<void> => {
  try {
    await connectDatabase();
    initCloudinary();
    const MONGO_URI = process.env.MONGO_URI;
    if (!MONGO_URI) {
      logger.error('MONGO_URI environment variable is not defined');
      process.exit(1);
    }

    await mongoose.connect(MONGO_URI);
    logger.info('Connected to MongoDB');
    const PORT = process.env.PORT || 3000;
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