# Orders

This section describes the endpoints for order management in the Gifty API.

## Get All Orders

Retrieves a list of all orders. Admin can access all orders, store managers can only access orders for their stores, and customers can only access their own orders.

**URL**: `/orders`

**Method**: `GET`

**Authentication Required**: Yes

**Query Parameters**:
- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Number of items per page (default: 10)
- `sort` (optional): Sort criteria (e.g., "createdAt:desc")

**Success Response**:
```json
{
  "status": "success",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439051",
      "customerId": "507f1f77bcf86cd799439011",
      "paymentDetails": {
        "paymentId": "pay_123456789",
        "paymentStatus": "completed",
        "paymentEmail": "john@example.com",
        "amount": 25.00,
        "provider": "stripe"
      },
      "voucher": {
        "_id": "507f1f77bcf86cd799439041",
        "code": "COFFEE-123-ABC",
        "storeId": "507f1f77bcf86cd799439021",
        "productId": "507f1f77bcf86cd799439031",
        "status": "active",
        "expirationDate": "2023-12-31T23:59:59.000Z",
        "senderName": "John Doe",
        "senderEmail": "john@example.com",
        "receiverName": "Jane Smith",
        "receiverEmail": "jane@example.com",
        "message": "Happy Birthday! Enjoy your coffee.",
        "template": "birthday"
      },
      "status": "completed",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    },
    {
      "_id": "507f1f77bcf86cd799439052",
      "customerId": "507f1f77bcf86cd799439012",
      "paymentDetails": {
        "paymentId": "pay_987654321",
        "paymentStatus": "completed",
        "paymentEmail": "alice@example.com",
        "amount": 50.00,
        "provider": "paypal"
      },
      "voucher": {
        "_id": "507f1f77bcf86cd799439042",
        "code": "BOOK-456-DEF",
        "storeId": "507f1f77bcf86cd799439022",
        "productId": "507f1f77bcf86cd799439032",
        "status": "active",
        "expirationDate": "2023-12-31T23:59:59.000Z",
        "senderName": "Alice Brown",
        "senderEmail": "alice@example.com",
        "receiverName": "Bob Green",
        "receiverEmail": "bob@example.com",
        "message": "Happy Holidays! Enjoy your book.",
        "template": "holiday"
      },
      "status": "completed",
      "createdAt": "2023-01-02T00:00:00.000Z",
      "updatedAt": "2023-01-02T00:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 10,
    "page": 1,
    "limit": 10,
    "pages": 1
  }
}
```

## Get Order by ID

Retrieves an order by its ID.

**URL**: `/orders/:id`

**Method**: `GET`

**Authentication Required**: Yes

**URL Parameters**:
- `id`: ID of the order to retrieve

**Success Response**:
```json
{
  "status": "success",
  "data": {
    "_id": "507f1f77bcf86cd799439051",
    "customerId": "507f1f77bcf86cd799439011",
    "paymentDetails": {
      "paymentId": "pay_123456789",
      "paymentStatus": "completed",
      "paymentEmail": "john@example.com",
      "amount": 25.00,
      "provider": "stripe"
    },
    "voucher": {
      "_id": "507f1f77bcf86cd799439041",
      "code": "COFFEE-123-ABC",
      "storeId": "507f1f77bcf86cd799439021",
      "productId": "507f1f77bcf86cd799439031",
      "status": "active",
      "expirationDate": "2023-12-31T23:59:59.000Z",
      "senderName": "John Doe",
      "senderEmail": "john@example.com",
      "receiverName": "Jane Smith",
      "receiverEmail": "jane@example.com",
      "message": "Happy Birthday! Enjoy your coffee.",
      "template": "birthday"
    },
    "status": "completed",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

**Error Response**:
```json
{
  "status": "error",
  "message": "Order not found"
}
```

## Get Orders by Customer ID

Retrieves all orders belonging to a specific customer.

**URL**: `/orders/customer/:customerId`

**Method**: `GET`

**Authentication Required**: Yes

**URL Parameters**:
- `customerId`: ID of the customer

**Success Response**:
```json
{
  "status": "success",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439051",
      "customerId": "507f1f77bcf86cd799439011",
      "paymentDetails": {
        "paymentId": "pay_123456789",
        "paymentStatus": "completed",
        "paymentEmail": "john@example.com",
        "amount": 25.00,
        "provider": "stripe"
      },
      "voucher": {
        "_id": "507f1f77bcf86cd799439041",
        "code": "COFFEE-123-ABC",
        "storeId": "507f1f77bcf86cd799439021",
        "productId": "507f1f77bcf86cd799439031",
        "status": "active",
        "expirationDate": "2023-12-31T23:59:59.000Z",
        "senderName": "John Doe",
        "senderEmail": "john@example.com",
        "receiverName": "Jane Smith",
        "receiverEmail": "jane@example.com",
        "message": "Happy Birthday! Enjoy your coffee.",
        "template": "birthday"
      },
      "status": "completed",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  ]
}
```

## Get Order by Voucher Code

Retrieves an order by the associated voucher code.

**URL**: `/orders/voucher/:code`

**Method**: `GET`

**Authentication Required**: Yes

**URL Parameters**:
- `code`: Code of the voucher

**Success Response**:
```json
{
  "status": "success",
  "data": {
    "_id": "507f1f77bcf86cd799439051",
    "customerId": "507f1f77bcf86cd799439011",
    "paymentDetails": {
      "paymentId": "pay_123456789",
      "paymentStatus": "completed",
      "paymentEmail": "john@example.com",
      "amount": 25.00,
      "provider": "stripe"
    },
    "voucher": {
      "_id": "507f1f77bcf86cd799439041",
      "code": "COFFEE-123-ABC",
      "storeId": "507f1f77bcf86cd799439021",
      "productId": "507f1f77bcf86cd799439031",
      "status": "active",
      "expirationDate": "2023-12-31T23:59:59.000Z",
      "senderName": "John Doe",
      "senderEmail": "john@example.com",
      "receiverName": "Jane Smith",
      "receiverEmail": "jane@example.com",
      "message": "Happy Birthday! Enjoy your coffee.",
      "template": "birthday"
    },
    "status": "completed",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

**Error Response**:
```json
{
  "status": "error",
  "message": "Order not found"
}
```

## Create Order

Creates a new order, which typically also creates a new voucher.

**URL**: `/orders`

**Method**: `POST`

**Authentication Required**: Yes

**Request Body**:
```json
{
  "customerId": "507f1f77bcf86cd799439011",
  "paymentDetails": {
    "paymentId": "pay_123456789",
    "paymentStatus": "completed",
    "paymentEmail": "john@example.com",
    "amount": 25.00,
    "provider": "stripe"
  },
  "voucher": {
    "storeId": "507f1f77bcf86cd799439021",
    "productId": "507f1f77bcf86cd799439031",
    "expirationDate": "2023-12-31T23:59:59.000Z",
    "senderName": "John Doe",
    "senderEmail": "john@example.com",
    "receiverName": "Jane Smith",
    "receiverEmail": "jane@example.com",
    "message": "Happy Birthday! Enjoy your coffee.",
    "template": "birthday"
  }
}
```

**Success Response**:
```json
{
  "status": "success",
  "data": {
    "_id": "507f1f77bcf86cd799439053",
    "customerId": "507f1f77bcf86cd799439011",
    "paymentDetails": {
      "paymentId": "pay_123456789",
      "paymentStatus": "completed",
      "paymentEmail": "john@example.com",
      "amount": 25.00,
      "provider": "stripe"
    },
    "voucher": {
      "_id": "507f1f77bcf86cd799439043",
      "code": "COFFEE-789-GHI",
      "storeId": "507f1f77bcf86cd799439021",
      "productId": "507f1f77bcf86cd799439031",
      "status": "active",
      "expirationDate": "2023-12-31T23:59:59.000Z",
      "senderName": "John Doe",
      "senderEmail": "john@example.com",
      "receiverName": "Jane Smith",
      "receiverEmail": "jane@example.com",
      "message": "Happy Birthday! Enjoy your coffee.",
      "template": "birthday"
    },
    "status": "completed",
    "createdAt": "2023-01-03T00:00:00.000Z",
    "updatedAt": "2023-01-03T00:00:00.000Z"
  }
}
```

**Error Response**:
```json
{
  "status": "error",
  "message": "Invalid payment details"
}
```

## Update Order

Updates an order's information.

**URL**: `/orders/:id`

**Method**: `PUT`

**Authentication Required**: Yes (Admin or Customer who created the order)

**URL Parameters**:
- `id`: ID of the order to update

**Request Body**:
```json
{
  "paymentDetails": {
    "paymentId": "pay_updated123456",
    "paymentStatus": "completed",
    "paymentEmail": "updated@example.com",
    "amount": 30.00,
    "provider": "stripe"
  },
  "voucher": {
    "senderName": "Updated Sender",
    "senderEmail": "updated.sender@example.com",
    "receiverName": "Updated Receiver",
    "receiverEmail": "updated.receiver@example.com",
    "message": "Updated message for the gift voucher",
    "template": "general"
  },
  "status": "completed"
}
```

**Success Response**:
```json
{
  "status": "success",
  "data": {
    "_id": "507f1f77bcf86cd799439051",
    "customerId": "507f1f77bcf86cd799439011",
    "paymentDetails": {
      "paymentId": "pay_updated123456",
      "paymentStatus": "completed",
      "paymentEmail": "updated@example.com",
      "amount": 30.00,
      "provider": "stripe"
    },
    "voucher": {
      "_id": "507f1f77bcf86cd799439041",
      "code": "COFFEE-123-ABC",
      "storeId": "507f1f77bcf86cd799439021",
      "productId": "507f1f77bcf86cd799439031",
      "status": "active",
      "expirationDate": "2023-12-31T23:59:59.000Z",
      "senderName": "Updated Sender",
      "senderEmail": "updated.sender@example.com",
      "receiverName": "Updated Receiver",
      "receiverEmail": "updated.receiver@example.com",
      "message": "Updated message for the gift voucher",
      "template": "general"
    },
    "status": "completed",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-04T00:00:00.000Z"
  }
}
```

**Error Response**:
```json
{
  "status": "error",
  "message": "Order not found"
}
```

## Delete Order

Deletes an order.

**URL**: `/orders/:id`

**Method**: `DELETE`

**Authentication Required**: Yes (Admin or Customer who created the order)

**URL Parameters**:
- `id`: ID of the order to delete

**Success Response**:
```json
{
  "status": "success",
  "message": "Order deleted successfully"
}
```

**Error Response**:
```json
{
  "status": "error",
  "message": "Order not found"
}
```

## Redeem Voucher

Redeems a voucher associated with an order.

**URL**: `/orders/voucher/:code/redeem`

**Method**: `PUT`

**Authentication Required**: Yes (Admin or Store Owner)

**URL Parameters**:
- `code`: Code of the voucher to redeem

**Success Response**:
```json
{
  "status": "success",
  "data": {
    "voucher": {
      "_id": "507f1f77bcf86cd799439041",
      "code": "COFFEE-123-ABC",
      "storeId": "507f1f77bcf86cd799439021",
      "productId": "507f1f77bcf86cd799439031",
      "status": "redeemed",
      "expirationDate": "2023-12-31T23:59:59.000Z",
      "senderName": "John Doe",
      "senderEmail": "john@example.com",
      "receiverName": "Jane Smith",
      "receiverEmail": "jane@example.com",
      "message": "Happy Birthday! Enjoy your coffee.",
      "template": "birthday"
    },
    "order": {
      "_id": "507f1f77bcf86cd799439051",
      "customerId": "507f1f77bcf86cd799439011",
      "paymentDetails": {
        "paymentId": "pay_123456789",
        "paymentStatus": "completed",
        "paymentEmail": "john@example.com",
        "amount": 25.00,
        "provider": "stripe"
      },
      "status": "completed",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-05T00:00:00.000Z"
    }
  }
}
```

**Error Response**:
```json
{
  "status": "error",
  "message": "Voucher already redeemed"
}
```

## Order Status Values

The order status can have the following values:

- `pending`: Payment initiated but not completed
- `processing`: Payment completed, voucher being generated
- `completed`: Order fully processed and voucher delivered
- `failed`: Order failed due to payment or other issues
- `cancelled`: Order cancelled by customer or admin 