# Vouchers

This section describes the endpoints for voucher management in the Gifty API.

## Get All Vouchers

Retrieves a list of all vouchers. Admin can access all vouchers, store managers can only access vouchers for their stores.

**URL**: `/vouchers`

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
      "_id": "507f1f77bcf86cd799439041",
      "code": "COFFEE-123-ABC",
      "storeId": "507f1f77bcf86cd799439021",
      "productId": "507f1f77bcf86cd799439031",
      "status": "active",
      "expirationDate": "2023-12-31T23:59:59.000Z",
      "amount": 25.0,
      "senderName": "John Doe",
      "senderEmail": "john@example.com",
      "receiverName": "Jane Smith",
      "receiverEmail": "jane@example.com",
      "message": "Happy Birthday! Enjoy your coffee.",
      "template": "birthday",
      "qrCode": "https://example.com/qr/COFFEE-123-ABC.png",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    },
    {
      "_id": "507f1f77bcf86cd799439042",
      "code": "BOOK-456-DEF",
      "storeId": "507f1f77bcf86cd799439022",
      "productId": "507f1f77bcf86cd799439032",
      "status": "active",
      "expirationDate": "2023-12-31T23:59:59.000Z",
      "amount": 50.0,
      "senderName": "Alice Brown",
      "senderEmail": "alice@example.com",
      "receiverName": "Bob Green",
      "receiverEmail": "bob@example.com",
      "message": "Happy Holidays! Enjoy your book.",
      "template": "holiday",
      "qrCode": "https://example.com/qr/BOOK-456-DEF.png",
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

## Get Voucher by ID

Retrieves a voucher by its ID.

**URL**: `/vouchers/:id`

**Method**: `GET`

**Authentication Required**: Yes

**URL Parameters**:

- `id`: ID of the voucher to retrieve

**Success Response**:

```json
{
  "status": "success",
  "data": {
    "_id": "507f1f77bcf86cd799439041",
    "code": "COFFEE-123-ABC",
    "storeId": "507f1f77bcf86cd799439021",
    "productId": "507f1f77bcf86cd799439031",
    "status": "active",
    "expirationDate": "2023-12-31T23:59:59.000Z",
    "amount": 25.0,
    "senderName": "John Doe",
    "senderEmail": "john@example.com",
    "receiverName": "Jane Smith",
    "receiverEmail": "jane@example.com",
    "message": "Happy Birthday! Enjoy your coffee.",
    "template": "birthday",
    "qrCode": "https://example.com/qr/COFFEE-123-ABC.png",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

**Error Response**:

```json
{
  "status": "error",
  "message": "Voucher not found"
}
```

## Get Voucher by Code

Retrieves a voucher by its unique code.

**URL**: `/vouchers/code/:code`

**Method**: `GET`

**Authentication Required**: Yes

**URL Parameters**:

- `code`: Code of the voucher to retrieve

**Success Response**:

```json
{
  "status": "success",
  "data": {
    "_id": "507f1f77bcf86cd799439041",
    "code": "COFFEE-123-ABC",
    "storeId": "507f1f77bcf86cd799439021",
    "productId": "507f1f77bcf86cd799439031",
    "status": "active",
    "expirationDate": "2023-12-31T23:59:59.000Z",
    "amount": 25.0,
    "senderName": "John Doe",
    "senderEmail": "john@example.com",
    "receiverName": "Jane Smith",
    "receiverEmail": "jane@example.com",
    "message": "Happy Birthday! Enjoy your coffee.",
    "template": "birthday",
    "qrCode": "https://example.com/qr/COFFEE-123-ABC.png",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

**Error Response**:

```json
{
  "status": "error",
  "message": "Voucher not found"
}
```

## Get Vouchers by Store ID

Retrieves all vouchers belonging to a specific store.

**URL**: `/vouchers/store/:storeId`

**Method**: `GET`

**Authentication Required**: Yes

**URL Parameters**:

- `storeId`: ID of the store

**Success Response**:

```json
{
  "status": "success",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439041",
      "code": "COFFEE-123-ABC",
      "storeId": "507f1f77bcf86cd799439021",
      "productId": "507f1f77bcf86cd799439031",
      "status": "active",
      "expirationDate": "2023-12-31T23:59:59.000Z",
      "amount": 25.0,
      "senderName": "John Doe",
      "senderEmail": "john@example.com",
      "receiverName": "Jane Smith",
      "receiverEmail": "jane@example.com",
      "message": "Happy Birthday! Enjoy your coffee.",
      "template": "birthday",
      "qrCode": "https://example.com/qr/COFFEE-123-ABC.png",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  ]
}
```

## Create Voucher

Creates a new voucher.

**URL**: `/vouchers`

**Method**: `POST`

**Authentication Required**: Yes

**Request Body**:

```json
{
  "storeId": "507f1f77bcf86cd799439021",
  "productId": "507f1f77bcf86cd799439031",
  "expirationDate": "2023-12-31T23:59:59.000Z",
  "amount": 25.0,
  "senderName": "John Doe",
  "senderEmail": "john@example.com",
  "receiverName": "Jane Smith",
  "receiverEmail": "jane@example.com",
  "message": "Happy Birthday! Enjoy your coffee.",
  "template": "birthday"
}
```

**Success Response**:

```json
{
  "status": "success",
  "data": {
    "_id": "507f1f77bcf86cd799439043",
    "code": "COFFEE-789-GHI",
    "storeId": "507f1f77bcf86cd799439021",
    "productId": "507f1f77bcf86cd799439031",
    "status": "active",
    "expirationDate": "2023-12-31T23:59:59.000Z",
    "amount": 25.0,
    "senderName": "John Doe",
    "senderEmail": "john@example.com",
    "receiverName": "Jane Smith",
    "receiverEmail": "jane@example.com",
    "message": "Happy Birthday! Enjoy your coffee.",
    "template": "birthday",
    "qrCode": "https://example.com/qr/COFFEE-789-GHI.png",
    "createdAt": "2023-01-03T00:00:00.000Z",
    "updatedAt": "2023-01-03T00:00:00.000Z"
  }
}
```

**Error Response**:

```json
{
  "status": "error",
  "message": "Store or product not found"
}
```

## Update Voucher

Updates a voucher's information.

**URL**: `/vouchers/:id`

**Method**: `PUT`

**Authentication Required**: Yes (Admin or Store Owner)

**URL Parameters**:

- `id`: ID of the voucher to update

**Request Body**:

```json
{
  "status": "redeemed",
  "receiverName": "Updated Receiver",
  "receiverEmail": "updated@example.com",
  "message": "Updated message for your gift",
  "template": "custom"
}
```

**Success Response**:

```json
{
  "status": "success",
  "data": {
    "_id": "507f1f77bcf86cd799439041",
    "code": "COFFEE-123-ABC",
    "storeId": "507f1f77bcf86cd799439021",
    "productId": "507f1f77bcf86cd799439031",
    "status": "redeemed",
    "expirationDate": "2023-12-31T23:59:59.000Z",
    "amount": 25.0,
    "senderName": "John Doe",
    "senderEmail": "john@example.com",
    "receiverName": "Updated Receiver",
    "receiverEmail": "updated@example.com",
    "message": "Updated message for your gift",
    "template": "custom",
    "qrCode": "https://example.com/qr/COFFEE-123-ABC.png",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-04T00:00:00.000Z"
  }
}
```

**Error Response**:

```json
{
  "status": "error",
  "message": "Voucher not found"
}
```

## Delete Voucher

Deletes a voucher.

**URL**: `/vouchers/:id`

**Method**: `DELETE`

**Authentication Required**: Yes (Admin or Store Owner)

**URL Parameters**:

- `id`: ID of the voucher to delete

**Success Response**:

```json
{
  "status": "success",
  "message": "Voucher deleted successfully"
}
```

**Error Response**:

```json
{
  "status": "error",
  "message": "Voucher not found"
}
```

## Validate Voucher

Validates a voucher by its code (checks if it's active and not expired).

**URL**: `/vouchers/validate/:code`

**Method**: `GET`

**Authentication Required**: Yes

**URL Parameters**:

- `code`: Code of the voucher to validate

**Success Response**:

```json
{
  "status": "success",
  "data": {
    "isValid": true,
    "voucher": {
      "_id": "507f1f77bcf86cd799439041",
      "code": "COFFEE-123-ABC",
      "storeId": "507f1f77bcf86cd799439021",
      "productId": "507f1f77bcf86cd799439031",
      "status": "active",
      "expirationDate": "2023-12-31T23:59:59.000Z",
      "amount": 25.0
    }
  }
}
```

**Error Response**:

```json
{
  "status": "error",
  "message": "Voucher is expired"
}
```

## Voucher Status Values

The voucher status can have the following values:

- `active`: Voucher is valid and can be redeemed
- `redeemed`: Voucher has been used
- `expired`: Voucher has expired (past expiration date)
- `cancelled`: Voucher has been cancelled
