import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

/**
 * Swagger configuration options
 */
const swaggerOptions: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Gifty API',
      version: '1.0.0',
      description: 'A modern, TypeScript-based RESTful API for gift card management',
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
        url: 'http://localhost:3000/api/v1',
        description: 'Development server'
      },
      {
        url: 'https://api.gifty-api.com/api/v1',
        description: 'Production server'
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
          required: ['name', 'email', 'password', 'role'],
          properties: {
            id: {
              type: 'string',
              description: 'User ID',
              example: '60d21b4667d0d8992e610c85'
            },
            name: {
              type: 'string',
              description: 'User name',
              example: 'John Doe'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email',
              example: 'user@example.com'
            },
            role: {
              type: 'string',
              enum: ['admin', 'store_manager', 'customer'],
              description: 'User role',
              example: 'customer'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp',
              example: '2023-06-21T15:24:38.235Z'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp',
              example: '2023-06-21T15:24:38.235Z'
            }
          }
        },
        GiftCard: {
          type: 'object',
          required: ['code', 'amount', 'currency'],
          properties: {
            id: {
              type: 'string',
              description: 'Gift card ID',
              example: '60d21b4667d0d8992e610c86'
            },
            code: {
              type: 'string',
              description: 'Gift card code',
              example: 'GIFT123'
            },
            amount: {
              type: 'number',
              description: 'Gift card amount',
              example: 50
            },
            currency: {
              type: 'string',
              description: 'Gift card currency',
              example: 'USD'
            },
            expiryDate: {
              type: 'string',
              format: 'date-time',
              description: 'Expiry date',
              example: '2024-12-31T23:59:59.999Z'
            },
            isActive: {
              type: 'boolean',
              description: 'Whether the gift card is active',
              example: true
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp',
              example: '2023-06-21T15:24:38.235Z'
            }
          }
        },
        Transaction: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Transaction ID',
              example: '60d21b4667d0d8992e610c87'
            },
            giftCardId: {
              type: 'string',
              description: 'Gift card ID',
              example: '60d21b4667d0d8992e610c86'
            },
            userId: {
              type: 'string',
              description: 'User ID',
              example: '60d21b4667d0d8992e610c85'
            },
            amount: {
              type: 'number',
              description: 'Transaction amount',
              example: 50
            },
            currency: {
              type: 'string',
              description: 'Transaction currency',
              example: 'USD'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp',
              example: '2023-06-21T15:24:38.235Z'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              description: 'Error status',
              example: 'error'
            },
            code: {
              type: 'integer',
              description: 'HTTP status code',
              example: 400
            },
            message: {
              type: 'string',
              description: 'Error message',
              example: 'Error message description'
            },
            errors: {
              type: 'array',
              description: 'List of validation errors',
              items: {
                type: 'object',
                properties: {
                  field: {
                    type: 'string',
                    description: 'Field with error',
                    example: 'email'
                  },
                  message: {
                    type: 'string',
                    description: 'Error message for the field',
                    example: 'Invalid email format'
                  }
                }
              }
            }
          }
        }
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
          description: 'Validation error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                status: 'fail',
                message: 'Validation failed',
                errors: [
                  {
                    field: 'email',
                    message: 'Invalid email format'
                  }
                ]
              }
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ],
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
        name: 'Gift Cards',
        description: 'Gift card management endpoints'
      },
      {
        name: 'Transactions',
        description: 'Transaction management endpoints'
      }
    ]
  },
  apis: [
    './src/modules/**/interface/*.routes.ts',
    './src/modules/**/interface/*.swagger.ts'
  ]
};

/**
 * Swagger specification
 */
const swaggerSpec = swaggerJsdoc(swaggerOptions);

/**
 * Initialize Swagger documentation
 * @param app Express application
 */
export const setupSwagger = (app: Express): void => {
  // Serve Swagger UI
  app.use('/api-docs', swaggerUi.serve);
  app.get('/api-docs', swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Gifty API Documentation'
  }));

  // Serve Swagger spec as JSON
  app.get('/swagger.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
}; 