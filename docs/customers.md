# Customers

This section describes the endpoints for customer management in the Gifty API.

## Get All Customers

Retrieves a list of all customers. This endpoint is only accessible by administrators.

**URL**: `/customers`

**Method**: `GET`

**Authentication Required**: Yes (Admin only)

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
            "_id": "67eea5db0f236e3a654ae140",
            "firstName": "John",
            "lastName": "Doe",
            "email": "john@example.com",
            "phone": "+5491134209650",
            "address": {
                "street": "123 Main St",
                "city": "Buenos Aires",
                "state": "CABA",
                "country": "Argentina",
                "zipCode": "1425"
            },
            "createdAt": "2025-04-03T15:45:23.107Z",
            "updatedAt": "2025-04-03T15:45:23.107Z",
            "__v": 0
        }
    ]
}
```

## Get Customer by ID

Retrieves a customer by their ID.

**URL**: `/customers/:id`

**Method**: `GET`

**Authentication Required**: Yes (Admin or Owner)

**URL Parameters**:
- `id`: ID of the customer to retrieve

**Success Response**:
```json
{
    "status": "success",
    "data": {
        "_id": "67eea5db0f236e3a654ae140",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com",
        "phone": "+5491134209650",
        "address": {
            "street": "123 Main St",
            "city": "Buenos Aires",
            "state": "CABA",
            "country": "Argentina",
            "zipCode": "1425"
        },
        "createdAt": "2025-04-03T15:45:23.107Z",
        "updatedAt": "2025-04-03T15:45:23.107Z",
        "__v": 0
    }
}
```

## Create Customer

Creates a new customer.

**URL**: `/customers`

**Method**: `POST`

**Authentication Required**: Yes

**Request Body**:
```json
{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+5491134209650",
    "address": {
        "street": "123 Main St",
        "city": "Buenos Aires",
        "state": "CABA",
        "country": "Argentina",
        "zipCode": "1425"
    }
}
```

**Success Response**:
```json
{
    "status": "success",
    "data": {
        "_id": "67eea5db0f236e3a654ae140",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com",
        "phone": "+5491134209650",
        "address": {
            "street": "123 Main St",
            "city": "Buenos Aires",
            "state": "CABA",
            "country": "Argentina",
            "zipCode": "1425"
        },
        "createdAt": "2025-04-03T15:45:23.107Z",
        "updatedAt": "2025-04-03T15:45:23.107Z",
        "__v": 0
    }
}
```

## Update Customer

Updates a customer's information.

**URL**: `/customers/:id`

**Method**: `PUT`

**Authentication Required**: Yes (Admin or Owner)

**URL Parameters**:
- `id`: ID of the customer to update

**Request Body**:
```json
{
    "firstName": "John",
    "lastName": "Doe Updated",
    "phone": "+5491134209651",
    "address": {
        "street": "124 Main St",
        "city": "Buenos Aires",
        "state": "CABA",
        "country": "Argentina",
        "zipCode": "1425"
    }
}
```

**Success Response**:
```json
{
    "status": "success",
    "data": {
        "_id": "67eea5db0f236e3a654ae140",
        "firstName": "John",
        "lastName": "Doe Updated",
        "email": "john@example.com",
        "phone": "+5491134209651",
        "address": {
            "street": "124 Main St",
            "city": "Buenos Aires",
            "state": "CABA",
            "country": "Argentina",
            "zipCode": "1425"
        },
        "createdAt": "2025-04-03T15:45:23.107Z",
        "updatedAt": "2025-04-03T15:46:12.342Z",
        "__v": 0
    }
}
```

## Delete Customer

Deletes a customer.

**URL**: `/customers/:id`

**Method**: `DELETE`

**Authentication Required**: Yes (Admin or Owner)

**URL Parameters**:
- `id`: ID of the customer to delete

**Success Response**:
```json
{
    "status": "success",
    "message": "Customer deleted successfully"
}
```

## Get Customer Orders

Retrieves all orders belonging to a specific customer.

**URL**: `/customers/:id/orders`

**Method**: `GET`

**Authentication Required**: Yes (Admin or Owner)

**URL Parameters**:
- `id`: ID of the customer

**Success Response**:
```json
{
    "status": "success",
    "data": [
        {
            "_id": "67ef44fc1617af9e74818e60",
            "customerId": "67eea5db0f236e3a654ae140",
            "voucher": {
                "storeId": "67eed05824675522cea87ee5",
                "productId": "67ef0286963bc2fd531e77f3",
                "code": "7U3X8VA0FQ",
                "status": "active",
                "isRedeemed": false,
                "redeemedAt": null,
                "senderName": "ximena",
                "senderEmail": "ximena@ximena.com",
                "receiverName": "Daniela",
                "receiverEmail": "daniela@daniela.com",
                "message": "test csf atre w",
                "qrCode": "data:image/png;base64,...",
                "amount": 65000,
                "expirationDate": "2026-04-04T02:33:32.407Z",
                "template": "template3"
            },
            "paymentDetails": {
                "paymentId": "mock_1743734012407",
                "status": "completed",
                "paymentEmail": "ximena@ximena.com",
                "amount": 65000,
                "provider": "paypal"
            },
            "emailsSent": true,
            "pdfGenerated": true,
            "createdAt": "2025-04-04T02:33:32.452Z",
            "updatedAt": "2025-04-04T02:33:38.317Z",
            "__v": 0,
            "pdfUrl": "/uploads/vouchers/voucher-7U3X8VA0FQ-1743734012700.pdf"
        }
    ]
}
``` 