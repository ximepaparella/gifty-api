# Users

This section describes the endpoints for user management in the Gifty API.

## Get All Users

Retrieves a list of all users. Only accessible by administrators.

**URL**: `/users`

**Method**: `GET`

**Authentication Required**: Yes (Admin role)

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
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "customer",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    },
    {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "role": "store_manager",
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

**Error Response**:
```json
{
  "status": "error",
  "message": "You do not have permission to perform this action"
}
```

## Get User by ID

Retrieves a user by their ID. Admins can access any user, users can only access their own profile.

**URL**: `/users/:id`

**Method**: `GET`

**Authentication Required**: Yes

**URL Parameters**:
- `id`: ID of the user to retrieve

**Success Response**:
```json
{
  "status": "success",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "customer",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

**Error Response**:
```json
{
  "status": "error",
  "message": "User not found"
}
```

## Create User

Creates a new user. Only accessible by administrators.

**URL**: `/users`

**Method**: `POST`

**Authentication Required**: Yes (Admin role)

**Request Body**:
```json
{
  "name": "New User",
  "email": "newuser@example.com",
  "password": "password123",
  "role": "customer"
}
```

**Success Response**:
```json
{
  "status": "success",
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "name": "New User",
    "email": "newuser@example.com",
    "role": "customer",
    "createdAt": "2023-01-03T00:00:00.000Z",
    "updatedAt": "2023-01-03T00:00:00.000Z"
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

## Update User

Updates a user's information. Admins can update any user, users can only update their own profile.

**URL**: `/users/:id`

**Method**: `PATCH`

**Authentication Required**: Yes

**URL Parameters**:
- `id`: ID of the user to update

**Request Body**:
```json
{
  "name": "Updated Name",
  "email": "updated@example.com",
  "password": "newpassword123"
}
```

**Success Response**:
```json
{
  "status": "success",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Updated Name",
    "email": "updated@example.com",
    "role": "customer",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-04T00:00:00.000Z"
  }
}
```

**Error Response**:
```json
{
  "status": "error",
  "message": "User not found"
}
```

## Delete User

Deletes a user. Admins can delete any user, users can only delete their own profile.

**URL**: `/users/:id`

**Method**: `DELETE`

**Authentication Required**: Yes

**URL Parameters**:
- `id`: ID of the user to delete

**Success Response**:
```json
{
  "status": "success",
  "message": "User deleted successfully"
}
```

**Error Response**:
```json
{
  "status": "error",
  "message": "User not found"
}
```

## User Roles

The system supports the following user roles:

- `admin`: System administrators with full access to all features
- `store_manager`: Store owners/managers who can manage their own stores, products, and vouchers
- `customer`: Regular users who can purchase and redeem vouchers 