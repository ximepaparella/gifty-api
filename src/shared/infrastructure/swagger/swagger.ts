import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';
import { storePaths } from './paths/store.paths';
import { storeSchemas } from './schemas/store.schema';
import { userSwagger } from '@modules/user/interface/user.swagger';
import { authSwagger } from '@modules/user/interface/auth.swagger';
import { productSwagger } from '@modules/product/interface/product.swagger';
import { voucherSwagger } from '@modules/voucher/interface/voucher.swagger';
import { orderSwagger } from '@modules/order/interface/order.swagger';

// Define Error schema that's referenced in responses
const errorSchema = {
  Error: {
    type: 'object',
    properties: {
      status: {
        type: 'string',
        description: 'Error status',
        example: 'error'
      },
      message: {
        type: 'string',
        description: 'Error message',
        example: 'Error message description'
      }
    }
  }
};

/**
 * Swagger configuration options
 */
const swaggerOptions: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Gifty API',
      version: '1.0.0',
      description: 'API for the Gifty gift vouchers platform',
      contact: {
        name: 'Gifty API Team',
        email: 'support@gifty-api.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
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
        ...errorSchema,
        ...storeSchemas,
        ...userSwagger.components.schemas,
        ...authSwagger.components.schemas,
        ...productSwagger.components.schemas,
        ...voucherSwagger.components.schemas,
        ...orderSwagger.components.schemas
      },
      responses: {
        UnauthorizedError: {
          description: 'Authentication is required or failed',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                status: 'fail',
                message: 'Authentication required. Please log in.'
              }
            }
          }
        },
        ForbiddenError: {
          description: 'User does not have permission to access the resource',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                status: 'fail',
                message: 'You do not have permission to perform this action'
              }
            }
          }
        },
        NotFoundError: {
          description: 'The requested resource was not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                status: 'fail',
                message: 'Resource not found'
              }
            }
          }
        },
        ValidationError: {
          description: 'Invalid input data',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                status: 'fail',
                message: 'Validation error'
              }
            }
          }
        }
      }
    },
    paths: {
      '/api/v1/auth/login': authSwagger.paths['/auth/login'],
      '/api/v1/auth/register': authSwagger.paths['/auth/register'],
      '/api/v1/auth/forgot-password': authSwagger.paths['/auth/forgot-password'],
      '/api/v1/auth/reset-password': authSwagger.paths['/auth/reset-password'],
      '/api/v1/users': userSwagger.paths['/users'],
      '/api/v1/users/{id}': userSwagger.paths['/users/{id}'],
      '/api/v1/stores': {
        ...storePaths['/stores'],
        get: {
          ...storePaths['/stores'].get,
          responses: {
            200: {
              description: 'List of stores',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status: { type: 'string', example: 'success' },
                      data: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/Store' }
                      }
                    }
                  }
                }
              }
            },
            401: { $ref: '#/components/responses/UnauthorizedError' }
          }
        }
      },
      '/api/v1/stores/{id}': storePaths['/stores/{id}'],
      '/api/v1/stores/owner/{ownerId}': storePaths['/stores/owner/{ownerId}'],
      '/api/v1/products': productSwagger.paths['/products'],
      '/api/v1/products/{id}': productSwagger.paths['/products/{id}'],
      '/api/v1/products/store/{storeId}': productSwagger.paths['/products/store/{storeId}'],
      ...voucherSwagger.paths,
      ...orderSwagger.paths
    },
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
        name: 'Stores',
        description: 'Store management endpoints'
      },
      {
        name: 'Products',
        description: 'Product management endpoints'
      },
      {
        name: 'Vouchers',
        description: 'Voucher management endpoints'
      },
      {
        name: 'Orders',
        description: 'Order management endpoints'
      }
    ]
  },
  apis: []  // We're defining everything in the definition
};

/**
 * Sets up Swagger documentation for the API
 */
export const setupSwagger = (app: Express): void => {
  const swaggerSpec = swaggerJsdoc(swaggerOptions) as {
    components: { schemas: Record<string, any> },
    paths: Record<string, any>
  };

  // Debug: Log the available schemas
  console.log('Available schemas:', Object.keys(swaggerSpec.components.schemas));
  console.log('Available paths:', Object.keys(swaggerSpec.paths));

  app.use('/api-docs', swaggerUi.serve);
  app.get('/api-docs', swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Gifty API Documentation',
    customfavIcon: '/assets/favicon.ico'
  }));

  // Also serve swagger spec as JSON if needed
  app.get('/swagger.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
}; 