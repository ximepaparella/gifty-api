# Gifty API Documentation

## Overview

Gifty is a gift voucher platform API that allows businesses to create and manage digital gift vouchers for their products. This documentation provides comprehensive information about the available endpoints, request/response formats, and authentication mechanisms.

## Base URL

All API requests should be prefixed with the following base URL:

```
https://api.gifty.com/api/v1
```

For local development:

```
http://localhost:3000/api/v1
```

## Authentication

The API uses JWT (JSON Web Token) Bearer authentication. Include your authentication token in the Authorization header for protected endpoints:

```
Authorization: Bearer <your_token>
```

See the [Authentication](./authentication.md) section for more details.

## API Sections

- [Authentication](./authentication.md) - Login, registration, and password reset
- [Users](./users.md) - User management endpoints
- [Stores](./stores.md) - Store management endpoints
- [Products](./products.md) - Product management endpoints
- [Vouchers](./vouchers.md) - Voucher management endpoints
- [Orders](./orders.md) - Order management endpoints

## Response Format

All responses follow a standard format:

### Success Response

```json
{
  "status": "success",
  "data": {
    // Response data here
  },
  "pagination": {
    // Pagination information (if applicable)
    "total": 100,
    "page": 1,
    "limit": 10,
    "pages": 10
  }
}
```

### Error Response

```json
{
  "status": "error",
  "message": "Error description"
}
```

## Rate Limiting

API requests are limited to 100 requests per minute per IP address. When the rate limit is exceeded, requests will receive a 429 Too Many Requests status code.

## Versioning

The current version of the API is v1. The version is included in the URL path.

## Support

For API support, please contact support@gifty-api.com or open an issue in our GitHub repository. 