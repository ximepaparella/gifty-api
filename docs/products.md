# Products

This section describes the endpoints for product management in the Gifty API.

## Get All Products

Retrieves a list of all products.

**URL**: `/products`

**Method**: `GET`

**Authentication Required**: Yes

**Query Parameters**:
- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Number of items per page (default: 10)
- `sort` (optional): Sort criteria (e.g., "price:desc")

**Success Response**:
```json
{
  "status": "success",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439031",
      "storeId": "507f1f77bcf86cd799439021",
      "name": "Coffee Gift Card",
      "description": "Gift card for coffee and pastries",
      "price": 25.00,
      "isActive": true,
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    },
    {
      "_id": "507f1f77bcf86cd799439032",
      "storeId": "507f1f77bcf86cd799439022",
      "name": "Book Voucher",
      "description": "Voucher for any book in store",
      "price": 50.00,
      "isActive": true,
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

## Get Product by ID

Retrieves a product by its ID.

**URL**: `/products/:id`

**Method**: `GET`

**Authentication Required**: Yes

**URL Parameters**:
- `id`: ID of the product to retrieve

**Success Response**:
```json
{
  "status": "success",
  "data": {
    "_id": "507f1f77bcf86cd799439031",
    "storeId": "507f1f77bcf86cd799439021",
    "name": "Coffee Gift Card",
    "description": "Gift card for coffee and pastries",
    "price": 25.00,
    "isActive": true,
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

**Error Response**:
```json
{
  "status": "error",
  "message": "Product not found"
}
```

## Get Products by Store ID

Retrieves all products belonging to a specific store.

**URL**: `/products/store/:storeId`

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
      "_id": "507f1f77bcf86cd799439031",
      "storeId": "507f1f77bcf86cd799439021",
      "name": "Coffee Gift Card",
      "description": "Gift card for coffee and pastries",
      "price": 25.00,
      "isActive": true,
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    },
    {
      "_id": "507f1f77bcf86cd799439033",
      "storeId": "507f1f77bcf86cd799439021",
      "name": "Premium Coffee Gift Card",
      "description": "Premium gift card for specialty coffee",
      "price": 50.00,
      "isActive": true,
      "createdAt": "2023-01-03T00:00:00.000Z",
      "updatedAt": "2023-01-03T00:00:00.000Z"
    }
  ]
}
```

## Create Product

Creates a new product.

**URL**: `/products`

**Method**: `POST`

**Authentication Required**: Yes (Admin or Store Owner)

**Request Body**:
```json
{
  "storeId": "507f1f77bcf86cd799439021",
  "name": "New Product",
  "description": "Description of the new product",
  "price": 35.00,
  "isActive": true
}
```

**Success Response**:
```json
{
  "status": "success",
  "data": {
    "_id": "507f1f77bcf86cd799439034",
    "storeId": "507f1f77bcf86cd799439021",
    "name": "New Product",
    "description": "Description of the new product",
    "price": 35.00,
    "isActive": true,
    "createdAt": "2023-01-04T00:00:00.000Z",
    "updatedAt": "2023-01-04T00:00:00.000Z"
  }
}
```

**Error Response**:
```json
{
  "status": "error",
  "message": "Store not found"
}
```

## Update Product

Updates a product's information.

**URL**: `/products/:id`

**Method**: `PUT`

**Authentication Required**: Yes (Admin or Store Owner)

**URL Parameters**:
- `id`: ID of the product to update

**Request Body**:
```json
{
  "name": "Updated Product Name",
  "description": "Updated product description",
  "price": 45.00,
  "isActive": true
}
```

**Success Response**:
```json
{
  "status": "success",
  "data": {
    "_id": "507f1f77bcf86cd799439031",
    "storeId": "507f1f77bcf86cd799439021",
    "name": "Updated Product Name",
    "description": "Updated product description",
    "price": 45.00,
    "isActive": true,
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-05T00:00:00.000Z"
  }
}
```

**Error Response**:
```json
{
  "status": "error",
  "message": "Product not found"
}
```

## Delete Product

Deletes a product.

**URL**: `/products/:id`

**Method**: `DELETE`

**Authentication Required**: Yes (Admin or Store Owner)

**URL Parameters**:
- `id`: ID of the product to delete

**Success Response**:
```json
{
  "status": "success",
  "message": "Product deleted successfully"
}
```

**Error Response**:
```json
{
  "status": "error",
  "message": "Product not found"
}
``` 