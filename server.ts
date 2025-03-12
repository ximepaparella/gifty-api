import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import passport from 'passport';
import dotenv from 'dotenv';
import { connectDatabase } from '@database/connection';
import logger from '@shared/infrastructure/logging/logger';
import { initCloudinary } from './src/shared/infrastructure/services/cloudinary.config';
import { AppError } from '@shared/types/appError';

// Load environment variables
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
      title: 'Gifty Core API',
      version: '1.0.0',
      description: 'Gift Vouchers API with Hexagonal Architecture',
      contact: {
        name: 'Estudio equis',
        email: 'info@estudioequis.com.ar'
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
      },
      {
        name: 'PropertyTypes',
        description: 'Property type management endpoints'
      },
      {
        name: 'Amenities',
        description: 'Amenity management endpoints'
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
  customSiteTitle: 'Gifty Core API Documentation',
  customfavIcon: '/assets/favicon.ico'
}));

// Also serve swagger spec as JSON if needed
app.get('/swagger.json', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Routes
import userRoutes from './src/modules/user/interface/user.routes';
app.use('/api/v1/users', userRoutes);

// Password reset routes
import passwordResetRoutes from './src/modules/user/interface/passwordReset.routes';
app.use('/api/v1/auth', passwordResetRoutes);

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
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app; 