// Import bootstrap file to set up module aliases
import './bootstrap';

import express, { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import passport from 'passport';
import dotenv from 'dotenv';

import { connectDatabase } from '@shared/infrastructure/database/connection';
import logger from '@shared/infrastructure/logging/logger';
import { initCloudinary } from '@shared/infrastructure/services/cloudinary.config';
import { AppError } from '@shared/types/appError';

// Import routes
import userRoutes from '@modules/user/interface/user.routes';
import passwordResetRoutes from '@modules/user/interface/passwordReset.routes';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(passport.initialize());

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Gifty API',
      version: '1.0.0',
      description: 'Gift Voucher API with Hexagonal Architecture',
      contact: {
        name: 'Gifty Tech Team',
        email: 'tech@gifty.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [{
      bearerAuth: []
    }],
    tags: [
      {
        name: 'Auth',
        description: 'Authentication endpoints'
      },
      {
        name: 'Users',
        description: 'User management endpoints'
      },
      {
        name: 'Roles',
        description: 'Role management endpoints'
      }
    ]
  },
  apis: [
    './src/modules/**/*.routes.ts',
    './src/modules/**/*.swagger.ts'
  ]
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Serve Swagger docs
app.use('/api-docs', swaggerUi.serve);
app.get('/api-docs', swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Gifty API Documentation',
  customfavIcon: '/assets/favicon.ico'
}));

// Also serve swagger spec as JSON if needed
app.get('/swagger.json', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/auth', passwordResetRoutes);

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

app.use(errorHandler);

const PORT = process.env.PORT || 3000;

const startServer = async (): Promise<void> => {
  try {
    await connectDatabase();
    initCloudinary();
    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app; 