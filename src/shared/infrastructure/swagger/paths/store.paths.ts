export const storePaths = {
  '/stores': {
    get: {
      tags: ['Stores'],
      summary: 'Get all stores',
      security: [{ bearerAuth: [] }],
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
    },
    post: {
      tags: ['Stores'],
      summary: 'Create a new store',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/StoreInput' }
          }
        }
      },
      responses: {
        201: {
          description: 'Store created successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: { type: 'string', example: 'success' },
                  data: { $ref: '#/components/schemas/Store' }
                }
              }
            }
          }
        },
        401: { $ref: '#/components/responses/UnauthorizedError' },
        422: { $ref: '#/components/responses/ValidationError' }
      }
    }
  },
  '/stores/{id}': {
    get: {
      tags: ['Stores'],
      summary: 'Get store by ID',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'string' },
          description: 'Store ID'
        }
      ],
      responses: {
        200: {
          description: 'Store found',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: { type: 'string', example: 'success' },
                  data: { $ref: '#/components/schemas/Store' }
                }
              }
            }
          }
        },
        401: { $ref: '#/components/responses/UnauthorizedError' },
        404: { $ref: '#/components/responses/NotFoundError' }
      }
    },
    put: {
      tags: ['Stores'],
      summary: 'Update store by ID',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'string' },
          description: 'Store ID'
        }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/StoreInput' }
          }
        }
      },
      responses: {
        200: {
          description: 'Store updated successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: { type: 'string', example: 'success' },
                  data: { $ref: '#/components/schemas/Store' }
                }
              }
            }
          }
        },
        401: { $ref: '#/components/responses/UnauthorizedError' },
        404: { $ref: '#/components/responses/NotFoundError' },
        422: { $ref: '#/components/responses/ValidationError' }
      }
    },
    delete: {
      tags: ['Stores'],
      summary: 'Delete store by ID',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'string' },
          description: 'Store ID'
        }
      ],
      responses: {
        200: {
          description: 'Store deleted successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: { type: 'string', example: 'success' },
                  data: { $ref: '#/components/schemas/Store' }
                }
              }
            }
          }
        },
        401: { $ref: '#/components/responses/UnauthorizedError' },
        403: { $ref: '#/components/responses/ForbiddenError' },
        404: { $ref: '#/components/responses/NotFoundError' }
      }
    }
  },
  '/stores/owner/{ownerId}': {
    get: {
      tags: ['Stores'],
      summary: 'Get stores by owner ID',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'ownerId',
          in: 'path',
          required: true,
          schema: { type: 'string' },
          description: 'Owner ID'
        }
      ],
      responses: {
        200: {
          description: 'List of stores for the owner',
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
  }
}; 