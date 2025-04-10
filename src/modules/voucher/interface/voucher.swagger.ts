export const voucherSwagger = {
  components: {
    schemas: {
      Voucher: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            description: 'Unique identifier for the voucher',
            example: '60d21b4667d0d8992e610c85',
          },
          code: {
            type: 'string',
            description: 'Unique code for the voucher',
            example: 'GIFT123',
          },
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
          amount: {
            type: 'number',
            description: 'Amount of the voucher',
            example: 50,
          },
          expirationDate: {
            type: 'string',
            format: 'date-time',
            description: 'Date when the voucher expires',
            example: '2023-12-31T23:59:59Z',
          },
          isRedeemed: {
            type: 'boolean',
            description: 'Whether the voucher has been redeemed',
            example: false,
          },
          redeemedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Date when the voucher was redeemed',
            example: null,
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
            enum: ['template1', 'template2', 'template3', 'template4'],
            description: 'Template design for the voucher',
            example: 'template1',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Date when the voucher was created',
            example: '2023-01-01T12:00:00Z',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Date when the voucher was last updated',
            example: '2023-01-01T12:00:00Z',
          },
        },
        required: [
          'code',
          'storeId',
          'productId',
          'amount',
          'expirationDate',
          'senderName',
          'senderEmail',
          'receiverName',
          'receiverEmail',
          'message',
          'template',
        ],
      },
      VoucherInput: {
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
          amount: {
            type: 'number',
            description: 'Amount of the voucher',
            example: 50,
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
            enum: ['template1', 'template2', 'template3', 'template4'],
            description: 'Template design for the voucher',
            example: 'template1',
          },
        },
        required: [
          'storeId',
          'productId',
          'amount',
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
  },
  paths: {
    '/api/v1/vouchers': {
      get: {
        tags: ['Vouchers'],
        summary: 'Get all vouchers',
        description: 'Retrieve a list of all vouchers',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'A list of vouchers',
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
                        $ref: '#/components/schemas/Voucher',
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
        tags: ['Vouchers'],
        summary: 'Create a new voucher',
        description: 'Create a new gift voucher',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/VoucherInput',
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Voucher created successfully',
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
                      $ref: '#/components/schemas/Voucher',
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
    '/api/v1/vouchers/{id}': {
      get: {
        tags: ['Vouchers'],
        summary: 'Get a voucher by ID',
        description: 'Retrieve a specific voucher by its ID',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'ID of the voucher to retrieve',
            schema: {
              type: 'string',
            },
          },
        ],
        responses: {
          200: {
            description: 'Voucher retrieved successfully',
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
                      $ref: '#/components/schemas/Voucher',
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
        tags: ['Vouchers'],
        summary: 'Update a voucher',
        description: 'Update an existing voucher by its ID',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'ID of the voucher to update',
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
                $ref: '#/components/schemas/VoucherInput',
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Voucher updated successfully',
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
                      $ref: '#/components/schemas/Voucher',
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
        tags: ['Vouchers'],
        summary: 'Delete a voucher',
        description: 'Delete an existing voucher by its ID',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'ID of the voucher to delete',
            schema: {
              type: 'string',
            },
          },
        ],
        responses: {
          200: {
            description: 'Voucher deleted successfully',
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
                      example: 'Voucher deleted successfully',
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
    '/api/v1/vouchers/code/{code}': {
      get: {
        tags: ['Vouchers'],
        summary: 'Get a voucher by code',
        description: 'Retrieve a specific voucher by its unique code',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'code',
            in: 'path',
            required: true,
            description: 'Code of the voucher to retrieve',
            schema: {
              type: 'string',
            },
          },
        ],
        responses: {
          200: {
            description: 'Voucher retrieved successfully',
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
                      $ref: '#/components/schemas/Voucher',
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
    '/api/v1/vouchers/code/{code}/redeem': {
      put: {
        tags: ['Vouchers'],
        summary: 'Redeem a voucher',
        description: 'Redeem a voucher by its unique code',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'code',
            in: 'path',
            required: true,
            description: 'Code of the voucher to redeem',
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
                      $ref: '#/components/schemas/Voucher',
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
          401: { $ref: '#/components/responses/UnauthorizedError' },
          403: { $ref: '#/components/responses/ForbiddenError' },
          404: { $ref: '#/components/responses/NotFoundError' },
        },
      },
    },
    '/api/v1/vouchers/store/{storeId}': {
      get: {
        tags: ['Vouchers'],
        summary: 'Get vouchers by store ID',
        description: 'Retrieve all vouchers for a specific store',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'storeId',
            in: 'path',
            required: true,
            description: 'ID of the store to get vouchers for',
            schema: {
              type: 'string',
            },
          },
        ],
        responses: {
          200: {
            description: 'Vouchers retrieved successfully',
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
                        $ref: '#/components/schemas/Voucher',
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
    '/api/v1/vouchers/customer/{email}': {
      get: {
        tags: ['Vouchers'],
        summary: 'Get vouchers by customer email',
        description: 'Retrieve all vouchers for a specific customer by email',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'email',
            in: 'path',
            required: true,
            description: 'Email of the customer to get vouchers for',
            schema: {
              type: 'string',
            },
          },
        ],
        responses: {
          200: {
            description: 'Vouchers retrieved successfully',
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
                        $ref: '#/components/schemas/Voucher',
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
  },
} as const;
