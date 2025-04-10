/**
 * @swagger
 * tags:
 *   name: Stores
 *   description: Store management endpoints
 */

/**
 * @swagger
 * /stores:
 *   get:
 *     summary: Get all stores
 *     description: Retrieve a list of all stores. Accessible by authenticated users.
 *     tags: [Stores]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of stores
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Store'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *   post:
 *     summary: Create a new store
 *     description: Create a new store. Accessible by authenticated users.
 *     tags: [Stores]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StoreInput'
 *     responses:
 *       201:
 *         description: Store created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Store'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

/**
 * @swagger
 * /stores/{id}:
 *   get:
 *     summary: Get store by ID
 *     description: Retrieve a store by its ID. Accessible by authenticated users.
 *     tags: [Stores]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Store ID
 *     responses:
 *       200:
 *         description: Store details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Store'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *   put:
 *     summary: Update store
 *     description: Update a store's information. Accessible by authenticated users.
 *     tags: [Stores]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Store ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StoreInput'
 *     responses:
 *       200:
 *         description: Store updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Store'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *   delete:
 *     summary: Delete store
 *     description: Delete a store. Only accessible by admins.
 *     tags: [Stores]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Store ID
 *     responses:
 *       200:
 *         description: Store deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Store'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */

/**
 * @swagger
 * /stores/owner/{ownerId}:
 *   get:
 *     summary: Get stores by owner ID
 *     description: Retrieve all stores belonging to a specific owner. Accessible by authenticated users.
 *     tags: [Stores]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ownerId
 *         required: true
 *         schema:
 *           type: string
 *         description: Owner ID
 *     responses:
 *       200:
 *         description: List of stores for the owner
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Store'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

export const storeSwagger = {
  paths: {
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
                      items: { $ref: '#/components/schemas/Store' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Stores'],
        summary: 'Create a new store',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'ownerId', 'email', 'phone', 'address'],
                properties: {
                  name: { type: 'string', example: 'Store Name' },
                  ownerId: { type: 'string', example: '507f1f77bcf86cd799439011' },
                  email: { type: 'string', example: 'store@example.com' },
                  phone: { type: 'string', example: '+1234567890' },
                  address: { type: 'string', example: '123 Store St, City, Country' },
                },
              },
            },
          },
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
                    data: { $ref: '#/components/schemas/Store' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/stores/{id}': {
      get: {
        tags: ['Stores'],
        summary: 'Get a store by ID',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Store ID',
          },
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
                    data: { $ref: '#/components/schemas/Store' },
                  },
                },
              },
            },
          },
        },
      },
      put: {
        tags: ['Stores'],
        summary: 'Update a store',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Store ID',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string', example: 'Updated Store Name' },
                  email: { type: 'string', example: 'updated@example.com' },
                  phone: { type: 'string', example: '+0987654321' },
                  address: { type: 'string', example: '456 Updated St, City, Country' },
                },
              },
            },
          },
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
                    data: { $ref: '#/components/schemas/Store' },
                  },
                },
              },
            },
          },
        },
      },
      delete: {
        tags: ['Stores'],
        summary: 'Delete a store',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Store ID',
          },
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
                    data: { $ref: '#/components/schemas/Store' },
                  },
                },
              },
            },
          },
        },
      },
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
            description: 'Owner ID',
          },
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
                      items: { $ref: '#/components/schemas/Store' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  components: {
    schemas: {
      Store: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
          name: { type: 'string', example: 'Store Name' },
          ownerId: { type: 'string', example: '507f1f77bcf86cd799439011' },
          email: { type: 'string', example: 'store@example.com' },
          phone: { type: 'string', example: '+1234567890' },
          address: { type: 'string', example: '123 Store St, City, Country' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  },
} as const;
