# Stores

This section describes the endpoints for store management in the Gifty API.

## Get All Stores

Retrieves a list of all stores.

**URL**: `/stores`

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
      "social": {
        "instagram": "@wspa",
        "facebook": "https://facebook.com/wspa",
        "tiktok": "@wspa",
        "youtube": "https://youtube.com/@wspa",
        "others": [
          {
            "name": "LinkedIn",
            "url": "https://linkedin.com/company/wspa",
            "_id": "67eed05824675522cea87ee6"
          }
        ]
      },
      "_id": "67eed05824675522cea87ee5",
      "name": "WSpa",
      "ownerId": "67eed02624675522cea87ede",
      "email": "info@wspa.com.ar",
      "phone": "+5491134209650",
      "address": "Avenida del puerto 240, Bahía Grande, Nordelta",
      "logo": "https://res.cloudinary.com/estudio-equis/image/upload/v1743716936/stores/67eed05824675522cea87ee5/logo.png",
      "createdAt": "2025-04-03T18:15:52.107Z",
      "updatedAt": "2025-04-03T21:46:47.044Z",
      "__v": 0
    }
  ]
}
```

## Get Store by ID

Retrieves a store by its ID.

**URL**: `/stores/:id`

**Method**: `GET`

**Authentication Required**: Yes

**URL Parameters**:

- `id`: ID of the store to retrieve

**Success Response**:

```json
{
  "status": "success",
  "data": {
    "_id": "507f1f77bcf86cd799439021",
    "ownerId": "507f1f77bcf86cd799439011",
    "name": "Coffee Shop",
    "description": "Specialty coffee and pastries",
    "logo": "https://example.com/logo.jpg",
    "address": "123 Main St, City",
    "phone": "+1234567890",
    "email": "contact@coffeeshop.com",
    "website": "https://coffeeshop.com",
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
  "message": "Store not found"
}
```

## Get Stores by Owner ID

Retrieves all stores belonging to a specific owner.

**URL**: `/stores/owner/:ownerId`

**Method**: `GET`

**Authentication Required**: Yes

**URL Parameters**:

- `ownerId`: ID of the store owner

**Success Response**:

```json
{
  "status": "success",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439021",
      "ownerId": "507f1f77bcf86cd799439011",
      "name": "Coffee Shop",
      "description": "Specialty coffee and pastries",
      "logo": "https://example.com/logo.jpg",
      "address": "123 Main St, City",
      "phone": "+1234567890",
      "email": "contact@coffeeshop.com",
      "website": "https://coffeeshop.com",
      "isActive": true,
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  ]
}
```

## Create Store

Creates a new store.

**URL**: `/stores`

**Method**: `POST`

**Authentication Required**: Yes (Admin or Store Manager role)

**Request Body**:

```json
{
  "name": "WSpa",
  "ownerId": "67eed02624675522cea87ede",
  "email": "info@wspa.com.ar",
  "phone": "+5491134209650",
  "address": "Avenida del puerto 240, Bahía Grande, Nordelta",
  "logo": "https://res.cloudinary.com/estudio-equis/image/upload/v1743716936/stores/67eed05824675522cea87ee5/logo.png",
  "social": {
    "instagram": "@wspa",
    "facebook": "https://facebook.com/wspa",
    "tiktok": "@wspa",
    "youtube": "https://youtube.com/@wspa",
    "others": [
      {
        "name": "LinkedIn",
        "url": "https://linkedin.com/company/wspa"
      }
    ]
  }
}
```

**Success Response**:

```json
{
  "status": "success",
  "data": {
    "_id": "507f1f77bcf86cd799439023",
    "ownerId": "507f1f77bcf86cd799439011",
    "name": "New Store",
    "description": "Store description",
    "logo": "https://example.com/new-logo.jpg",
    "address": "789 Pine St, City",
    "phone": "+1234567892",
    "email": "contact@newstore.com",
    "website": "https://newstore.com",
    "isActive": true,
    "createdAt": "2023-01-03T00:00:00.000Z",
    "updatedAt": "2023-01-03T00:00:00.000Z"
  }
}
```

**Error Response**:

```json
{
  "status": "error",
  "message": "Store name already exists"
}
```

## Update Store

Updates a store's information.

**URL**: `/stores/:id`

**Method**: `PUT`

**Authentication Required**: Yes (Admin or Store Owner)

**URL Parameters**:

- `id`: ID of the store to update

**Request Body**:

```json
{
  "name": "Updated Store Name",
  "description": "Updated store description",
  "logo": "https://example.com/updated-logo.jpg",
  "address": "101 Elm St, City",
  "phone": "+1234567893",
  "email": "new-contact@store.com",
  "website": "https://updated-store.com",
  "isActive": true
}
```

**Success Response**:

```json
{
  "status": "success",
  "data": {
    "_id": "507f1f77bcf86cd799439021",
    "ownerId": "507f1f77bcf86cd799439011",
    "name": "Updated Store Name",
    "description": "Updated store description",
    "logo": "https://example.com/updated-logo.jpg",
    "address": "101 Elm St, City",
    "phone": "+1234567893",
    "email": "new-contact@store.com",
    "website": "https://updated-store.com",
    "isActive": true,
    "createdAt": "2023-01-01T00:00:00.000Z",
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

## Delete Store

Deletes a store.

**URL**: `/stores/:id`

**Method**: `DELETE`

**Authentication Required**: Yes (Admin or Store Owner)

**URL Parameters**:

- `id`: ID of the store to delete

**Success Response**:

```json
{
  "status": "success",
  "message": "Store deleted successfully"
}
```

**Error Response**:

```json
{
  "status": "error",
  "message": "Store not found"
}
```
