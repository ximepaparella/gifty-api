# Authentication

The Gifty API uses JWT (JSON Web Token) for authentication. This section describes the endpoints for authentication, registration, and password reset.

## Login

Authenticates a user and returns a JWT token.

**URL**: `/auth/login`

**Method**: `POST`

**Authentication Required**: No

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Success Response**:
```json
{
  "status": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "user@example.com",
      "role": "customer",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  }
}
```

**Error Response**:
```json
{
  "status": "error",
  "message": "Invalid email or password"
}
```

## Register

Registers a new user.

**URL**: `/auth/register`

**Method**: `POST`

**Authentication Required**: No

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "user@example.com",
  "password": "password123",
  "role": "customer" // Optional, defaults to "customer"
}
```

**Success Response**:
```json
{
  "status": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "user@example.com",
      "role": "customer",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  }
}
```

**Error Response**:
```json
{
  "status": "error",
  "message": "Email already in use"
}
```

## Forgot Password

Sends a password reset email to the user.

**URL**: `/auth/forgot-password`

**Method**: `POST`

**Authentication Required**: No

**Request Body**:
```json
{
  "email": "user@example.com"
}
```

**Success Response**:
```json
{
  "status": "success",
  "message": "Password reset email sent"
}
```

**Error Response**:
```json
{
  "status": "error",
  "message": "Email not found"
}
```

## Reset Password

Resets a user's password using a reset token.

**URL**: `/auth/reset-password`

**Method**: `POST`

**Authentication Required**: No

**Request Body**:
```json
{
  "token": "reset-token-from-email",
  "password": "new-password123"
}
```

**Success Response**:
```json
{
  "status": "success",
  "message": "Password reset successful"
}
```

**Error Response**:
```json
{
  "status": "error",
  "message": "Invalid or expired token"
}
```

## Using Authentication

After obtaining a JWT token through login or registration, include it in the Authorization header for all protected endpoints:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Token Expiration

JWT tokens expire after 24 hours. After expiration, you'll need to login again to obtain a new token. 