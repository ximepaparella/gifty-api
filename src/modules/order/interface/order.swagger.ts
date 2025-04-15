export const orderSwagger = {
  components: {
    schemas: {
      Order: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            description: 'Unique identifier for the order',
            example: '60d21b4667d0d8992e610c85',
          },
          customerId: {
            type: 'string',
            description: 'ID of the customer who placed the order',
            example: '60d21b4667d0d8992e610c80',
          },
          paymentDetails: {
            type: 'object',
            properties: {
              paymentId: {
                type: 'string',
                description: 'Unique identifier for the payment',
                example: 'pay_1234567890',
              },
              paymentStatus: {
                type: 'string',
                enum: ['pending', 'completed', 'failed'],
                description: 'Current status of the payment',
                example: 'completed',
              },
              paymentEmail: {
                type: 'string',
                description: 'Email used for payment',
                example: 'customer@example.com',
              },
              amount: {
                type: 'number',
                description: 'Payment amount',
                example: 50,
              },
              provider: {
                type: 'string',
                enum: ['mercadopago', 'paypal', 'stripe'],
                description: 'Payment provider used',
                example: 'stripe',
              },
              createdAt: {
                type: 'string',
                format: 'date-time',
                description: 'Date when the payment was created',
                example: '2023-01-01T12:00:00Z',
              },
              updatedAt: {
                type: 'string',
                format: 'date-time',
                description: 'Date when the payment was last updated',
                example: '2023-01-01T12:00:00Z',
              },
            },
            required: ['paymentId', 'paymentStatus', 'paymentEmail', 'amount', 'provider'],
          },
          voucher: {
            type: 'object',
            properties: {
              storeId: {
                type: 'string',
                description: 'ID of the store that issued the voucher',
                example: '60d21b4667d0d8992e610c80',
              },
              productId: {
                type: 'string',
                description: 'ID of the product the voucher is for',
                example: '60d21b4667d0d8992e610c81',
              },
              code: {
                type: 'string',
                description: 'Unique code for the voucher',
                example: 'GIFT123',
              },
              status: {
                type: 'string',
                enum: ['active', 'redeemed', 'expired'],
                description: 'Current status of the voucher',
                example: 'active',
              },
              expirationDate: {
                type: 'string',
                format: 'date-time',
                description: 'Date when the voucher expires',
                example: '2023-12-31T23:59:59Z',
              },
              qrCode: {
                type: 'string',
                description: 'QR code data for the voucher',
                example: 'data:image/png;base64,iVBORw0KGgo...',
              },
              senderName: {
                type: 'string',
                description: 'Name of the person who sent the voucher',
                example: 'John Doe',
              },
              senderEmail: {
                type: 'string',
                description: 'Email of the person who sent the voucher',
                example: 'john.doe@example.com',
              },
              receiverName: {
                type: 'string',
                description: 'Name of the person who received the voucher',
                example: 'Jane Smith',
              },
              receiverEmail: {
                type: 'string',
                description: 'Email of the person who received the voucher',
                example: 'jane.smith@example.com',
              },
              message: {
                type: 'string',
                description: 'Personal message included with the voucher',
                example: 'Happy Birthday! Enjoy your gift!',
              },
              template: {
                type: 'string',
                enum: [
                  'template1',
                  'template2',
                  'template3',
                  'template4',
                  'template5',
                  'birthday',
                  'christmas',
                  'valentine',
                  'general',
                ],
                description: 'Template design for the voucher',
                example: 'birthday',
              },
              redeemedAt: {
                type: 'string',
                format: 'date-time',
                description: 'Date when the voucher was redeemed',
                example: null,
              },
            },
            required: [
              'storeId',
              'productId',
              'code',
              'status',
              'expirationDate',
              'senderName',
              'senderEmail',
              'receiverName',
              'receiverEmail',
              'message',
              'template',
            ],
          },
          emailsSent: {
            type: 'boolean',
            description: 'Whether the voucher emails have been sent',
            example: false,
          },
          pdfGenerated: {
            type: 'boolean',
            description: 'Whether the voucher PDF has been generated',
            example: false,
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Date when the order was created',
            example: '2023-01-01T12:00:00Z',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Date when the order was last updated',
            example: '2023-01-01T12:00:00Z',
          },
        },
        required: ['customerId', 'paymentDetails', 'voucher'],
      },
      OrderInput: {
        type: 'object',
        properties: {
          customerId: {
            type: 'string',
            description: 'ID of the customer who placed the order',
            example: '60d21b4667d0d8992e610c80',
          },
          paymentDetails: {
            type: 'object',
            properties: {
              paymentId: {
                type: 'string',
                description: 'Unique identifier for the payment',
                example: 'pay_1234567890',
              },
              paymentStatus: {
                type: 'string',
                enum: ['pending', 'completed', 'failed'],
                description: 'Current status of the payment',
                example: 'completed',
              },
              paymentEmail: {
                type: 'string',
                description: 'Email used for payment',
                example: 'customer@example.com',
              },
              amount: {
                type: 'number',
                description: 'Payment amount',
                example: 50,
              },
              provider: {
                type: 'string',
                enum: ['mercadopago', 'paypal', 'stripe'],
                description: 'Payment provider used',
                example: 'stripe',
              },
            },
            required: ['paymentId', 'paymentStatus', 'paymentEmail', 'amount', 'provider'],
          },
          voucher: {
            type: 'object',
            properties: {
              storeId: {
                type: 'string',
                description: 'ID of the store that issued the voucher',
                example: '60d21b4667d0d8992e610c80',
              },
              productId: {
                type: 'string',
                description: 'ID of the product the voucher is for',
                example: '60d21b4667d0d8992e610c81',
              },
              expirationDate: {
                type: 'string',
                format: 'date-time',
                description: 'Date when the voucher expires',
                example: '2023-12-31T23:59:59Z',
              },
              senderName: {
                type: 'string',
                description: 'Name of the person who sent the voucher',
                example: 'John Doe',
              },
              senderEmail: {
                type: 'string',
                description: 'Email of the person who sent the voucher',
                example: 'john.doe@example.com',
              },
              receiverName: {
                type: 'string',
                description: 'Name of the person who received the voucher',
                example: 'Jane Smith',
              },
              receiverEmail: {
                type: 'string',
                description: 'Email of the person who received the voucher',
                example: 'jane.smith@example.com',
              },
              message: {
                type: 'string',
                description: 'Personal message included with the voucher',
                example: 'Happy Birthday! Enjoy your gift!',
              },
              template: {
                type: 'string',
                enum: [
                  'template1',
                  'template2',
                  'template3',
                  'template4',
                  'template5',
                  'birthday',
                  'christmas',
                  'valentine',
                  'general',
                ],
                description: 'Template design for the voucher',
                example: 'birthday',
              },
            },
            required: [
              'storeId',
              'productId',
              'expirationDate',
              'senderName',
              'senderEmail',
              'receiverName',
              'receiverEmail',
              'message',
              'template',
            ],
          },
        },
        required: ['customerId', 'paymentDetails', 'voucher'],
      },
    },
  },
  paths: {
    '/api/v1/orders': {
      get: {
        tags: ['Orders'],
        summary: 'Get all orders',
        description: 'Retrieve a list of all orders',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'A list of orders',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: {
                      type: 'boolean',
                      example: true,
                    },
                    data: {
                      type: 'array',
                      items: {
                        $ref: '#/components/schemas/Order',
                      },
                    },
                  },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/UnauthorizedError' },
          403: { $ref: '#/components/responses/ForbiddenError' },
        },
      },
      post: {
        tags: ['Orders'],
        summary: 'Create a new order',
        description: 'Create a new order with payment and voucher details',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/OrderInput',
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Order created successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: {
                      type: 'boolean',
                      example: true,
                    },
                    data: {
                      $ref: '#/components/schemas/Order',
                    },
                  },
                },
              },
            },
          },
          400: { $ref: '#/components/responses/ValidationError' },
          401: { $ref: '#/components/responses/UnauthorizedError' },
          403: { $ref: '#/components/responses/ForbiddenError' },
        },
      },
    },
    '/api/v1/orders/{id}': {
      get: {
        tags: ['Orders'],
        summary: 'Get an order by ID',
        description: 'Retrieve an order by its ID',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'ID of the order to retrieve',
            schema: {
              type: 'string',
            },
          },
        ],
        responses: {
          200: {
            description: 'Order retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: {
                      type: 'boolean',
                      example: true,
                    },
                    data: {
                      $ref: '#/components/schemas/Order',
                    },
                  },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/UnauthorizedError' },
          403: { $ref: '#/components/responses/ForbiddenError' },
          404: { $ref: '#/components/responses/NotFoundError' },
        },
      },
      put: {
        tags: ['Orders'],
        summary: 'Update an order',
        description: 'Update an existing order by its ID',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'ID of the order to update',
            schema: {
              type: 'string',
            },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/OrderInput',
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Order updated successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: {
                      type: 'boolean',
                      example: true,
                    },
                    data: {
                      $ref: '#/components/schemas/Order',
                    },
                  },
                },
              },
            },
          },
          400: { $ref: '#/components/responses/ValidationError' },
          401: { $ref: '#/components/responses/UnauthorizedError' },
          403: { $ref: '#/components/responses/ForbiddenError' },
          404: { $ref: '#/components/responses/NotFoundError' },
        },
      },
      delete: {
        tags: ['Orders'],
        summary: 'Delete an order',
        description: 'Delete an existing order by its ID',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'ID of the order to delete',
            schema: {
              type: 'string',
            },
          },
        ],
        responses: {
          200: {
            description: 'Order deleted successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: {
                      type: 'boolean',
                      example: true,
                    },
                    message: {
                      type: 'string',
                      example: 'Order deleted successfully',
                    },
                  },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/UnauthorizedError' },
          403: { $ref: '#/components/responses/ForbiddenError' },
          404: { $ref: '#/components/responses/NotFoundError' },
        },
      },
    },
    '/api/v1/orders/customer/{customerId}': {
      get: {
        tags: ['Orders'],
        summary: 'Get orders by customer ID',
        description: 'Retrieve orders by customer ID',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'customerId',
            in: 'path',
            required: true,
            description: 'ID of the customer',
            schema: {
              type: 'string',
            },
          },
        ],
        responses: {
          200: {
            description: 'Orders retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: {
                      type: 'boolean',
                      example: true,
                    },
                    data: {
                      type: 'array',
                      items: {
                        $ref: '#/components/schemas/Order',
                      },
                    },
                  },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/UnauthorizedError' },
          403: { $ref: '#/components/responses/ForbiddenError' },
        },
      },
    },
    '/api/v1/orders/voucher/{code}': {
      get: {
        tags: ['Orders'],
        summary: 'Get order by voucher code',
        description: 'Retrieve an order by voucher code',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'code',
            in: 'path',
            required: true,
            description: 'Voucher code',
            schema: {
              type: 'string',
            },
          },
        ],
        responses: {
          200: {
            description: 'Order retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: {
                      type: 'boolean',
                      example: true,
                    },
                    data: {
                      $ref: '#/components/schemas/Order',
                    },
                  },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/UnauthorizedError' },
          403: { $ref: '#/components/responses/ForbiddenError' },
          404: { $ref: '#/components/responses/NotFoundError' },
        },
      },
    },
    '/api/v1/orders/voucher/{code}/redeem': {
      put: {
        tags: ['Orders'],
        summary: 'Redeem a voucher',
        description: 'Redeem a voucher by its code',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'code',
            in: 'path',
            required: true,
            description: 'Voucher code',
            schema: {
              type: 'string',
            },
          },
        ],
        responses: {
          200: {
            description: 'Voucher redeemed successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: {
                      type: 'boolean',
                      example: true,
                    },
                    data: {
                      $ref: '#/components/schemas/Order',
                    },
                    message: {
                      type: 'string',
                      example: 'Voucher redeemed successfully',
                    },
                  },
                },
              },
            },
          },
          400: { $ref: '#/components/responses/ValidationError' },
          401: { $ref: '#/components/responses/UnauthorizedError' },
          403: { $ref: '#/components/responses/ForbiddenError' },
          404: { $ref: '#/components/responses/NotFoundError' },
        },
      },
    },
    '/api/v1/orders/{id}/resend-emails': {
      post: {
        tags: ['Orders'],
        summary: 'Resend voucher emails',
        description: 'Resend voucher emails for an order',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'ID of the order',
            schema: {
              type: 'string',
            },
          },
        ],
        responses: {
          200: {
            description: 'Emails sent successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: {
                      type: 'boolean',
                      example: true,
                    },
                    message: {
                      type: 'string',
                      example: 'Voucher emails sent successfully',
                    },
                  },
                },
              },
            },
          },
          400: { $ref: '#/components/responses/ValidationError' },
          401: { $ref: '#/components/responses/UnauthorizedError' },
          403: { $ref: '#/components/responses/ForbiddenError' },
          404: { $ref: '#/components/responses/NotFoundError' },
        },
      },
    },
    '/api/v1/orders/{id}/download-pdf': {
      get: {
        tags: ['Orders'],
        summary: 'Download voucher PDF',
        description: 'Download a PDF version of the voucher',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'ID of the order',
            schema: {
              type: 'string',
            },
          },
        ],
        responses: {
          200: {
            description: 'PDF downloaded successfully',
            content: {
              'application/pdf': {
                schema: {
                  type: 'string',
                  format: 'binary',
                },
              },
            },
          },
          401: { $ref: '#/components/responses/UnauthorizedError' },
          403: { $ref: '#/components/responses/ForbiddenError' },
          404: { $ref: '#/components/responses/NotFoundError' },
        },
      },
    },
  },
} as const;
