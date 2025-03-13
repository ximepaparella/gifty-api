export const storeSchemas = {
  Store: {
    type: 'object',
    required: ['name', 'ownerId', 'email', 'phone', 'address'],
    properties: {
      _id: {
        type: 'string',
        description: 'Store ID',
        example: '60d21b4667d0d8992e610c85'
      },
      name: {
        type: 'string',
        description: 'Store name',
        example: 'My Awesome Store'
      },
      ownerId: {
        type: 'string',
        description: 'ID of the store owner',
        example: '60d21b4667d0d8992e610c86'
      },
      email: {
        type: 'string',
        format: 'email',
        description: 'Store contact email',
        example: 'store@example.com'
      },
      phone: {
        type: 'string',
        description: 'Store contact phone number',
        example: '1234567890'
      },
      address: {
        type: 'string',
        description: 'Store physical address',
        example: '123 Main St, City, Country'
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
  StoreInput: {
    type: 'object',
    required: ['name', 'ownerId', 'email', 'phone', 'address'],
    properties: {
      name: {
        type: 'string',
        description: 'Store name',
        example: 'My Awesome Store'
      },
      ownerId: {
        type: 'string',
        description: 'ID of the store owner',
        example: '60d21b4667d0d8992e610c86'
      },
      email: {
        type: 'string',
        format: 'email',
        description: 'Store contact email',
        example: 'store@example.com'
      },
      phone: {
        type: 'string',
        description: 'Store contact phone number',
        example: '1234567890'
      },
      address: {
        type: 'string',
        description: 'Store physical address',
        example: '123 Main St, City, Country'
      }
    }
  }
}; 