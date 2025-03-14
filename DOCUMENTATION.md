# Gifty API Documentation

This document provides detailed information about the Gifty API endpoints, request/response formats, and authentication requirements.

## Base URL

All API endpoints are prefixed with `/api/v1`.

## Authentication

Most endpoints require authentication using a JWT token. To authenticate:

1. Obtain a JWT token by logging in via the `/api/v1/auth/login` endpoint
2. Include the token in the Authorization header of your requests:
   ```
   Authorization: Bearer <your_jwt_token>
   ```

## Error Handling

All errors follow a standard format:

```json
{
  "status": "error",
  "code": 400,
  "message": "Error message description",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

## API Endpoints

### Authentication

#### Register a new user

```
POST /api/v1/auth/register
```

Request body:
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe"
}
```

Response (201 Created):
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "60d21b4667d0d8992e610c85",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "user",
      "createdAt": "2023-06-21T15:24:38.235Z"
    }
  }
}
```

#### Login

```
POST /api/v1/auth/login
```

Request body:
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

Response (200 OK):
```json
{
  "status": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "60d21b4667d0d8992e610c85",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "user"
    }
  }
}
```

### Users

#### Get Current User

```
GET /api/v1/users/me
```

Authentication: Required

Response (200 OK):
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "60d21b4667d0d8992e610c85",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "user",
      "createdAt": "2023-06-21T15:24:38.235Z"
    }
  }
}
```

#### Get All Users (Admin only)

```
GET /api/v1/users
```

Authentication: Required (Admin role)
Query Parameters:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

Response (200 OK):
```json
{
  "status": "success",
  "data": {
    "users": [
      {
        "id": "60d21b4667d0d8992e610c85",
        "email": "user@example.com",
        "firstName": "John",
        "lastName": "Doe",
        "role": "user",
        "createdAt": "2023-06-21T15:24:38.235Z"
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 10,
      "pages": 1
    }
  }
}
```

#### Get User by ID (Admin only)

```
GET /api/v1/users/:id
```

Authentication: Required (Admin role)

Response (200 OK):
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "60d21b4667d0d8992e610c85",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "user",
      "createdAt": "2023-06-21T15:24:38.235Z"
    }
  }
}
```

#### Update User

```
PATCH /api/v1/users/:id
```

Authentication: Required (Admin role or own user)

Request body:
```json
{
  "firstName": "Johnny",
  "lastName": "Doe"
}
```

Response (200 OK):
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "60d21b4667d0d8992e610c85",
      "email": "user@example.com",
      "firstName": "Johnny",
      "lastName": "Doe",
      "role": "user",
      "createdAt": "2023-06-21T15:24:38.235Z"
    }
  }
}
```

#### Delete User

```
DELETE /api/v1/users/:id
```

Authentication: Required (Admin role or own user)

Response (204 No Content)

#### Setup Admin User (First-time setup only)

```
POST /api/v1/users/setup-admin
```

Request body:
```json
{
  "email": "admin@example.com",
  "password": "secureAdminPassword123",
  "firstName": "Admin",
  "lastName": "User"
}
```

Response (201 Created):
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "60d21b4667d0d8992e610c85",
      "email": "admin@example.com",
      "firstName": "Admin",
      "lastName": "User",
      "role": "admin",
      "createdAt": "2023-06-21T15:24:38.235Z"
    }
  }
}
```

### Gift Cards

#### Create Gift Card (Admin only)

```
POST /api/v1/gift-cards
```

Authentication: Required (Admin role)

Request body:
```json
{
  "code": "GIFT123",
  "amount": 50,
  "currency": "USD",
  "expiryDate": "2024-12-31T23:59:59.999Z",
  "isActive": true
}
```

Response (201 Created):
```json
{
  "status": "success",
  "data": {
    "giftCard": {
      "id": "60d21b4667d0d8992e610c86",
      "code": "GIFT123",
      "amount": 50,
      "currency": "USD",
      "expiryDate": "2024-12-31T23:59:59.999Z",
      "isActive": true,
      "createdAt": "2023-06-21T15:24:38.235Z"
    }
  }
}
```

#### Get All Gift Cards

```
GET /api/v1/gift-cards
```

Authentication: Required
Query Parameters:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `isActive`: Filter by active status (optional)

Response (200 OK):
```json
{
  "status": "success",
  "data": {
    "giftCards": [
      {
        "id": "60d21b4667d0d8992e610c86",
        "code": "GIFT123",
        "amount": 50,
        "currency": "USD",
        "expiryDate": "2024-12-31T23:59:59.999Z",
        "isActive": true,
        "createdAt": "2023-06-21T15:24:38.235Z"
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 10,
      "pages": 1
    }
  }
}
```

#### Get Gift Card by ID

```
GET /api/v1/gift-cards/:id
```

Authentication: Required

Response (200 OK):
```json
{
  "status": "success",
  "data": {
    "giftCard": {
      "id": "60d21b4667d0d8992e610c86",
      "code": "GIFT123",
      "amount": 50,
      "currency": "USD",
      "expiryDate": "2024-12-31T23:59:59.999Z",
      "isActive": true,
      "createdAt": "2023-06-21T15:24:38.235Z"
    }
  }
}
```

#### Update Gift Card (Admin only)

```
PATCH /api/v1/gift-cards/:id
```

Authentication: Required (Admin role)

Request body:
```json
{
  "amount": 75,
  "isActive": false
}
```

Response (200 OK):
```json
{
  "status": "success",
  "data": {
    "giftCard": {
      "id": "60d21b4667d0d8992e610c86",
      "code": "GIFT123",
      "amount": 75,
      "currency": "USD",
      "expiryDate": "2024-12-31T23:59:59.999Z",
      "isActive": false,
      "createdAt": "2023-06-21T15:24:38.235Z"
    }
  }
}
```

#### Delete Gift Card (Admin only)

```
DELETE /api/v1/gift-cards/:id
```

Authentication: Required (Admin role)

Response (204 No Content)

#### Redeem Gift Card

```
POST /api/v1/gift-cards/:id/redeem
```

Authentication: Required

Response (200 OK):
```json
{
  "status": "success",
  "data": {
    "message": "Gift card redeemed successfully",
    "transaction": {
      "id": "60d21b4667d0d8992e610c87",
      "giftCardId": "60d21b4667d0d8992e610c86",
      "userId": "60d21b4667d0d8992e610c85",
      "amount": 50,
      "currency": "USD",
      "createdAt": "2023-06-21T15:24:38.235Z"
    }
  }
}
```

### Transactions

#### Get User Transactions

```
GET /api/v1/transactions
```

Authentication: Required
Query Parameters:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

Response (200 OK):
```json
{
  "status": "success",
  "data": {
    "transactions": [
      {
        "id": "60d21b4667d0d8992e610c87",
        "giftCard": {
          "id": "60d21b4667d0d8992e610c86",
          "code": "GIFT123"
        },
        "amount": 50,
        "currency": "USD",
        "createdAt": "2023-06-21T15:24:38.235Z"
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 10,
      "pages": 1
    }
  }
}
```

#### Get All Transactions (Admin only)

```
GET /api/v1/transactions/all
```

Authentication: Required (Admin role)
Query Parameters:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `userId`: Filter by user ID (optional)

Response (200 OK):
```json
{
  "status": "success",
  "data": {
    "transactions": [
      {
        "id": "60d21b4667d0d8992e610c87",
        "giftCard": {
          "id": "60d21b4667d0d8992e610c86",
          "code": "GIFT123"
        },
        "user": {
          "id": "60d21b4667d0d8992e610c85",
          "email": "user@example.com"
        },
        "amount": 50,
        "currency": "USD",
        "createdAt": "2023-06-21T15:24:38.235Z"
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 10,
      "pages": 1
    }
  }
}
```

## Status Codes

The API uses the following status codes:

- `200 OK`: The request was successful
- `201 Created`: A new resource was successfully created
- `204 No Content`: The request was successful but there is no content to return
- `400 Bad Request`: The request was malformed or invalid
- `401 Unauthorized`: Authentication is required or failed
- `403 Forbidden`: The authenticated user does not have permission to access the resource
- `404 Not Found`: The requested resource was not found
- `409 Conflict`: The request could not be completed due to a conflict with the current state of the resource
- `500 Internal Server Error`: An error occurred on the server

## Orders and Vouchers

### Create Order

```
POST /api/v1/orders
```

Authentication: Required

Request body:
```json
{
  "customer": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890"
  },
  "voucher": {
    "code": "ABC123456",
    "storeId": "60d21b4667d0d8992e610c88",
    "productId": "60d21b4667d0d8992e610c89",
    "senderName": "Jane Doe",
    "receiverName": "Bob Smith",
    "message": "Happy Birthday!",
    "expirationDate": "2024-12-31T23:59:59.999Z",
    "template": "birthday"
  },
  "paymentDetails": {
    "amount": 50,
    "currency": "USD",
    "paymentMethod": "credit_card",
    "transactionId": "pay_123456789"
  }
}
```

Response (201 Created):
```json
{
  "status": "success",
  "data": {
    "order": {
      "id": "60d21b4667d0d8992e610c90",
      "customer": {
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "+1234567890"
      },
      "voucher": {
        "code": "ABC123456",
        "storeId": "60d21b4667d0d8992e610c88",
        "productId": "60d21b4667d0d8992e610c89",
        "senderName": "Jane Doe",
        "receiverName": "Bob Smith",
        "message": "Happy Birthday!",
        "expirationDate": "2024-12-31T23:59:59.999Z",
        "template": "birthday",
        "status": "active",
        "isRedeemed": false,
        "qrCode": "data:image/png;base64,iVBORw0KGgoAAAAN..." 
      },
      "paymentDetails": {
        "amount": 50,
        "currency": "USD",
        "paymentMethod": "credit_card",
        "transactionId": "pay_123456789"
      },
      "createdAt": "2023-06-21T15:24:38.235Z"
    }
  }
}
```

Note: The `qrCode` field contains a base64-encoded QR code image that links to the voucher redemption URL. This QR code can be scanned to redeem the voucher.

### Get All Orders

```
GET /api/v1/orders
```

Authentication: Required
Query Parameters:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

Response (200 OK):
```json
{
  "status": "success",
  "data": {
    "orders": [
      {
        "id": "60d21b4667d0d8992e610c90",
        "customer": {
          "name": "John Doe",
          "email": "john@example.com",
          "phone": "+1234567890"
        },
        "voucher": {
          "code": "ABC123456",
          "status": "active",
          "isRedeemed": false
        },
        "paymentDetails": {
          "amount": 50,
          "currency": "USD"
        },
        "createdAt": "2023-06-21T15:24:38.235Z"
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 10,
      "pages": 1
    }
  }
}
```

### Get Order by ID

```
GET /api/v1/orders/:id
```

Authentication: Required

Response (200 OK):
```json
{
  "status": "success",
  "data": {
    "order": {
      "id": "60d21b4667d0d8992e610c90",
      "customer": {
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "+1234567890"
      },
      "voucher": {
        "code": "ABC123456",
        "storeId": "60d21b4667d0d8992e610c88",
        "productId": "60d21b4667d0d8992e610c89",
        "senderName": "Jane Doe",
        "receiverName": "Bob Smith",
        "message": "Happy Birthday!",
        "expirationDate": "2024-12-31T23:59:59.999Z",
        "template": "birthday",
        "status": "active",
        "isRedeemed": false,
        "qrCode": "data:image/png;base64,iVBORw0KGgoAAAAN..."
      },
      "paymentDetails": {
        "amount": 50,
        "currency": "USD",
        "paymentMethod": "credit_card",
        "transactionId": "pay_123456789"
      },
      "createdAt": "2023-06-21T15:24:38.235Z"
    }
  }
}
```

### Get Order by Voucher Code

```
GET /api/v1/orders/voucher/:code
```

Authentication: Required

Response (200 OK):
```json
{
  "status": "success",
  "data": {
    "order": {
      "id": "60d21b4667d0d8992e610c90",
      "customer": {
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "+1234567890"
      },
      "voucher": {
        "code": "ABC123456",
        "storeId": "60d21b4667d0d8992e610c88",
        "productId": "60d21b4667d0d8992e610c89",
        "senderName": "Jane Doe",
        "receiverName": "Bob Smith",
        "message": "Happy Birthday!",
        "expirationDate": "2024-12-31T23:59:59.999Z",
        "template": "birthday",
        "status": "active",
        "isRedeemed": false,
        "qrCode": "data:image/png;base64,iVBORw0KGgoAAAAN..."
      },
      "paymentDetails": {
        "amount": 50,
        "currency": "USD"
      },
      "createdAt": "2023-06-21T15:24:38.235Z"
    }
  }
}
```

### Update Order

```
PATCH /api/v1/orders/:id
```

Authentication: Required

Request body:
```json
{
  "voucher": {
    "senderName": "Jane Smith",
    "message": "Happy Birthday and have a great day!"
  }
}
```

Response (200 OK):
```json
{
  "status": "success",
  "data": {
    "order": {
      "id": "60d21b4667d0d8992e610c90",
      "customer": {
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "+1234567890"
      },
      "voucher": {
        "code": "ABC123456",
        "storeId": "60d21b4667d0d8992e610c88",
        "productId": "60d21b4667d0d8992e610c89",
        "senderName": "Jane Smith",
        "receiverName": "Bob Smith",
        "message": "Happy Birthday and have a great day!",
        "expirationDate": "2024-12-31T23:59:59.999Z",
        "template": "birthday",
        "status": "active",
        "isRedeemed": false,
        "qrCode": "data:image/png;base64,iVBORw0KGgoAAAAN..."
      },
      "paymentDetails": {
        "amount": 50,
        "currency": "USD",
        "paymentMethod": "credit_card",
        "transactionId": "pay_123456789"
      },
      "createdAt": "2023-06-21T15:24:38.235Z"
    }
  }
}
```

### Delete Order

```
DELETE /api/v1/orders/:id
```

Authentication: Required

Response (204 No Content)

### Redeem Voucher by Code

```
PUT /api/v1/orders/voucher/:code/redeem
```

Authentication: Required

Response (200 OK):
```json
{
  "status": "success",
  "data": {
    "order": {
      "id": "60d21b4667d0d8992e610c90",
      "voucher": {
        "code": "ABC123456",
        "status": "redeemed",
        "isRedeemed": true,
        "redeemedAt": "2023-06-22T10:15:20.123Z"
      },
      "customer": {
        "name": "John Doe",
        "email": "john@example.com"
      },
      "paymentDetails": {
        "amount": 50,
        "currency": "USD"
      }
    }
  }
}
```

Note: This endpoint is also used when redeeming a voucher by scanning its QR code. The QR code contains a URL with the voucher code, and this endpoint processes the redemption.

### Resend Voucher Emails

```
POST /api/v1/orders/:id/resend-emails
```

Authentication: Required

Response (200 OK):
```json
{
  "status": "success",
  "message": "Voucher emails resent successfully"
}
```

### Resend Customer Email Only

```
POST /api/v1/orders/:id/resend-customer-email
```

Authentication: Required

Response (200 OK):
```json
{
  "status": "success",
  "message": "Customer email resent successfully"
}
```

### Resend Receiver Email Only

```
POST /api/v1/orders/:id/resend-receiver-email
```

Authentication: Required

Response (200 OK):
```json
{
  "status": "success",
  "message": "Receiver email resent successfully"
}
```

### Resend Store Email Only

```
POST /api/v1/orders/:id/resend-store-email
```

Authentication: Required

Response (200 OK):
```json
{
  "status": "success",
  "message": "Store email resent successfully"
}
```

### Generate Voucher PDF

```
GET /api/v1/orders/:id/voucher-pdf
```

Authentication: Required

Response (200 OK): PDF file download

## QR Code Functionality

The API includes built-in QR code generation for vouchers. When an order is created, a QR code is automatically generated and stored with the order. This QR code contains a URL that, when scanned, allows for easy voucher redemption.

- QR codes are generated using the `qrcode` npm package
- The QR code URL format is: `{FRONTEND_URL}/vouchers/redeem/{VOUCHER_CODE}`
- QR codes are stored as base64-encoded data URLs in the `order.voucher.qrCode` field
- The QR codes are included in the PDF vouchers and in the emails sent to customers

Vouchers can be redeemed by:
1. Manually entering the voucher code
2. Scanning the QR code with a mobile device 