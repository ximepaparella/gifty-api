// Import bootstrap file to set up module aliases
import './bootstrap';

import express, { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import passport from 'passport';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

import { connectDatabase } from '@shared/infrastructure/database/connection';
import logger from '@shared/infrastructure/logging/logger';
import { initCloudinary } from '@shared/infrastructure/services/cloudinary.config';
import { AppError } from '@shared/types/appError';
import { errorHandler as globalErrorHandler } from '@shared/infrastructure/errors/errorHandler';

// Import routes
import userRoutes from '@modules/user/interface/user.routes';
import passwordResetRoutes from '@modules/user/interface/passwordReset.routes';
import { storeRoutes } from '@modules/store/interface/store.routes';
import { productRoutes } from '@modules/product/interface/product.routes';

// Import swagger docs
import { storeSwagger } from '@modules/store/interface/store.swagger';
import { productSwagger } from '@modules/product/interface/product.swagger';

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
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            name: { type: 'string', example: 'John Doe' },
            email: { type: 'string', format: 'email', example: 'john@example.com' },
            password: { type: 'string', format: 'password' },
            role: { type: 'string', enum: ['user', 'admin'], example: 'user' },
            isActive: { type: 'boolean', example: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        LoginInput: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'john@example.com' },
            password: { type: 'string', format: 'password', example: 'password123' }
          }
        },
        RegisterInput: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            name: { type: 'string', example: 'John Doe' },
            email: { type: 'string', format: 'email', example: 'john@example.com' },
            password: { type: 'string', format: 'password', example: 'password123' }
          }
        },
        PasswordResetRequest: {
          type: 'object',
          required: ['email'],
          properties: {
            email: { type: 'string', format: 'email', example: 'john@example.com' }
          }
        },
        PasswordReset: {
          type: 'object',
          required: ['token', 'password'],
          properties: {
            token: { type: 'string' },
            password: { type: 'string', format: 'password', example: 'newpassword123' }
          }
        },
        ...storeSwagger.components.schemas,
        ...productSwagger.components.schemas
      },
      responses: {
        UnauthorizedError: {
          description: 'Authentication information is missing or invalid',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: { type: 'string', example: 'error' },
                  message: { type: 'string', example: 'Unauthorized' }
                }
              }
            }
          }
        },
        ValidationError: {
          description: 'Invalid input data',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: { type: 'string', example: 'error' },
                  message: { type: 'string', example: 'Validation error' }
                }
              }
            }
          }
        },
        NotFoundError: {
          description: 'The requested resource was not found',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: { type: 'string', example: 'error' },
                  message: { type: 'string', example: 'Resource not found' }
                }
              }
            }
          }
        },
        ForbiddenError: {
          description: 'The user does not have permission to perform this action',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: { type: 'string', example: 'error' },
                  message: { type: 'string', example: 'Forbidden' }
                }
              }
            }
          }
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
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/auth', passwordResetRoutes);
app.use('/api/v1/stores', storeRoutes);
app.use('/api/v1/products', productRoutes);

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