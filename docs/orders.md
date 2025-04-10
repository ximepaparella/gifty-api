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
  "success": true,
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
        "qrCode": "data:image/png;base64,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",
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
    "_id": "67ef466d86cd793aa50aa6fb",
    "customerId": "67eea5db0f236e3a654ae140",
    "voucher": {
      "storeId": "67eed05824675522cea87ee5",
      "productId": "67eef2fe164e6492a9133084",
      "code": "T0N8E3UGIE",
      "status": "active",
      "isRedeemed": false,
      "redeemedAt": null,
      "senderName": "ximena",
      "senderEmail": "ximena@ximena.com",
      "receiverName": "Daniela",
      "receiverEmail": "daniela@daniela.comtes",
      "message": "testets res tw",
      "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAAEsCAYAAAB5fY51AAAAAklEQVR4AewaftIAAAvCSURBVO3BUa4cSHIEwfBC3//KrvldiEmIhWLr5U6Y4T9SVbXASVXVEidVVUucVFUtcVJVtcRJVdUSJ1VVS3zyG0C2UzMB8pqaG0C+Sc0EyA01N4BM1NwA8k1qXgMyUTMBsp2aXzmpqlripKpqiZOqqiVOqqqWOKmqWuKkqmqJTy6p+SmAvKZmAmQC5IaaG0AmaiZA6s+ouQFkomai5jU1PwWQP3VSVbXESVXVEidVVUucVFUtcVJVtcRJVdUSn/wFQF5T81OomQCZqJkAuaHmNTUTIBMgrwGZqLmhZgLkNTUbAHlNzUsnVVVLnFRVLXFSVbXESVXVEidVVUucVFUt8cm/mJobQCZqJkAmal4DMlEzATJRMwFyQ80EyATIRM0EyETNBMhEzQTIRE39351UVS1xUlW1xElV1RInVVVLnFRVLXFSVbXEJ/U1aiZAbqi5AWSiZgLkNSATNRMgN9S8BmSiZgLkhpp/o5OqqiVOqqqWOKmqWuKkqmqJk6qqJU6qqpb45C9QswGQiZqJmgmQ19T8FGo2ADJRMwHyTWp+CjU/3UlV1RInVVVLnFRVLXFSVbXESVXVEidVVUt8cgnIvxWQiZoJkImaCZCJmhtqJkAmaiZAJmomQCZqbqiZAJmomQCZqJkAmaiZAJmouQFks5OqqiVOqqqWOKmqWuKkqmqJk6qqJU6qqpb45DfU1P8/NTfU3FBzQ81rQF5TMwHympoJkNfU/Lc6qapa4qSqaomTqqolTqqqljipqlripKpqiU/+AiCvqZkAmai5AWSiZgJkomYCZKLmBpCJmhtAJmomQCZqvgnIDTUTIBM1EzU3gLym5gaQ19T8yklV1RInVVVLnFRVLXFSVbXESVXVEidVVUt88oOouaFmAmSi5jU1EyCvAfkpgNwA8lOomQC5AWQDIBM1P8FJVdUSJ1VVS5xUVS1xUlW1xElV1RInVVVLfPIbQF5TMwHymprXgEzU3FAzAXJDzQTIBmpeAzIBMlEzATJR8xqQiZobQG6omQCZqPlTJ1VVS5xUVS1xUlW1xElV1RInVVVLnFRVLYH/yAUgEzUTIBM12wHZQM0EyETNfzMgEzXfBGSi5gaQ19RMgNxQ8ysnVVVLnFRVLXFSVbXESVXVEidVVUucVFUt8clvAHlNzQTIRM0EyA01EyATNTfUbAfkhpobQG6ouaFmAuSGmgmQiZoJkImaG2omQCZAJmomQP7USVXVEidVVUucVFUtcVJVtcRJVdUSJ1VVS3zyG2puALmh5oaabwLyTUC+Sc0EyETNBMhram4AuaFmAuSGmgmQiZobaiZAbqiZAHnppKpqiZOqqiVOqqqWOKmqWuKkqmqJk6qqJT65BOQ1IK+puaHmBpAbQCZqbgCZqJkAmaiZALmhZgJkAmSiZqJmAmQC5DUgEzUTIDfU3FDzmpo/dVJVtcRJVdUSJ1VVS5xUVS1xUlW1xElV1RKf/AaQ19TcADJR8xqQ14DcAHJDzTepmQCZAJmoeQ3IDTUTIK8B2U7NBMhEza+cVFUtcVJVtcRJVdUSJ1VVS5xUVS1xUlW1BP4jjwG5oWYC5DU1PwWQiZoJkBtqbgCZqLkBZKJmAuSGmgmQn0LNBMhEzQTIRM0EyGtq/tRJVdUSJ1VVS5xUVS1xUlW1xElV1RInVVVLfPJlaiZAJmpeA/JNal5TcwPIDTUTIBM1N4BM1NwA8t8MyETNBMhraiZAJmp+5aSqaomTqqolTqqqljipqlripKpqiZOqqiU++Q0gEzU3gNwA8k1qvknNBMgNNTfUTIBM1NxQ8xqQG2omQG6ouQHkhpoN1Pypk6qqJU6qqpY4qapa4qSqaomTqqolTqqqlvjkL1AzATJR8xqQ14BM1HyTmvrf1NwA8hqQiZrt1NwAMlHzKydVVUucVFUtcVJVtcRJVdUSJ1VVS5xUVS3xyW+o+SmA3FDzTUAmaiZAJmomQCZqJmpeAzJRMwEyUfNTqHkNyHZAbqj5UydVVUucVFUtcVJVtcRJVdUSJ1VVS5xUVS2B/8gFIBM1EyCvqZkA+SY1rwG5oWYC5IaabwIyUTMBMlFzA8hEzQTIa2omQG6oeQ3IDTW/clJVtcRJVdUSJ1VVS5xUVS1xUlW1xElV1RL4jwyA/BRqJkBuqJkAeU3NDSATNRMgN9RMgNxQMwHympoJkBtqJkBuqJkAmaj5JiA31Lx0UlW1xElV1RInVVVLnFRVLXFSVbXESVXVEp9cUjMBMlHzmpobQCZqJkBuAJmomaiZAJmo+SY1PwWQiZoJkBtqbgD5JiATNRM1EyDfclJVtcRJVdUSJ1VVS5xUVS1xUlW1xElV1RL4j3wRkBtqJkAmaiZAbqiZAJmomQC5oeYGkImaG0BuqJkAmaiZAJmoeQ3IRM0EyERN/aeTqqolTqqqljipqlripKpqiZOqqiVOqqqW+OQ3gEzUTIDcUHNDzQTIRM0NIDeATNRMgNwA8hqQiZoJkNeATNRMgEzUTIBM1EyA3ACygZoJkBtqfuWkqmqJk6qqJU6qqpY4qapa4qSqaomTqqolPvlBgLymZgLkhpoJkA3U3FAzAXIDyGtAJmomQCZqbqi5AWSiZgLkNTU/wUlV1RInVVVLnFRVLXFSVbXESVXVEidVVUt88htqJkBuqJkAmai5AWSiZgLkhpoJkBtqbqi5AeSGmp8CyGtAJmpuALkB5JuATNR8y0lV1RInVVVLnFRVLXFSVbXESVXVEidVVUt88htAJmp+CiA/BZAbQCZqJkC+Sc1rQCZqbqi5oeYGkIma19RMgNxQMwEyAXJDzZ86qapa4qSqaomTqqolTqqqljipqlripKpqCfxHBkAmaiZAJmomQG6omQCZqPkmIBM1EyA31NwA8pqaG0AmaiZAJmomQL5JzQ0gEzU3gEzUTIBM1EyATNT8yklV1RInVVVLnFRVLXFSVbXESVXVEidVVUt88heomQB5DchEzQTIDTUTIBM1N9T8FGomQDYAMlHzUwCZqJkAuaHmm9T8qZOqqiVOqqqWOKmqWuKkqmqJk6qqJU6qqpb45C8AckPNBMhEzWtqXgMyUTMBMlFzA8gNIBM1N4DcADJR8xqQiZoJkImaiZrX1EyATNRM1EyA3FDzKydVVUucVFUtcVJVtcRJVdUSJ1VVS5xUVS3xyQ8CZKJmAmSi5gaQG2omQCZAJmomQF5TcwPIN6mZALmhZqLmm4C8BuQGkNfU/KmTqqolTqqqljipqlripKpqiZOqqiVOqqqW+OQ31NxQ801qvknNT6FmAmSiZgLkm9S8pmYC5AaQiZpvUvMakIma14BM1PzKSVXVEidVVUucVFUtcVJVtcRJVdUSJ1VVS3zyG0C2UzNRMwEyATJRM1HzGpCJmtfUvAZkomYC5IaaG2peA/IakIma14BM1EzU/KmTqqolTqqqljipqlripKpqiZOqqiVOqqqW+OSSmp8CyL+VmtfU3AByQ80NNRMgP4WaCZDX1LwGZKLmBpCJml85qapa4qSqaomTqqolTqqqljipqlripKpqiU/+AiCvqXkNyETNa0AmaiZAXlPzTWomQG6omai5AWSi5gaQiZoJkAmQb1IzATJR89JJVdUSJ1VVS5xUVS1xUlW1xElV1RInVVVLfFJ/DMhEzWtqbgCZAPkmIDfU3AAyUTNRMwEyUTNRMwEyUTMBMlEzATJRc0PNBMhLJ1VVS5xUVS1xUlW1xElV1RInVVVLnFRVLfFJ/RKQiZrXgEzU3FAzATJR81MAmaiZqJkA+SYg3wTkBpCJmtfU/KmTqqolTqqqljipqlripKpqiZOqqiVOqqqW+OQvULOBmhtAJmomarYD8pqa14BM1HyTmhtAbqi5AeSnO6mqWuKkqmqJk6qqJU6qqpY4qapa4qSqaolPLgH5t1LzGpCJmg3UTIBMgHwTkBtqJkAmam6oeQ3IN6l56aSqaomTqqolTqqqljipqlripKpqiZOqqiXwH6mqWuCkqmqJk6qqJU6qqpY4qapa4qSqaon/AbIB9lORriP0AAAAAElFTkSuQmCC",
      "amount": 65000,
      "expirationDate": "2026-04-04T02:39:41.113Z",
      "template": "template3"
    },
    "paymentDetails": {
      "paymentId": "mock_1743734381113",
      "status": "completed",
      "paymentEmail": "ximena@ximena.com",
      "amount": 65000,
      "provider": "stripe"
    },
    "emailsSent": true,
    "pdfGenerated": true,
    "createdAt": "2025-04-04T02:39:41.161Z",
    "updatedAt": "2025-04-04T02:39:47.045Z",
    "__v": 0,
    "pdfUrl": "C:\\Users\\ximen\\OneDrive\\Documentos\\Estudio Equis\\repositorios\\ai4devs\\gifty-api\\uploads\\vouchers\\voucher-T0N8E3UGIE-1743734381447.pdf"
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
        "amount": 25.0,
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
      "amount": 25.0,
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
  "customerId": "67eea5db0f236e3a654ae140",
  "paymentDetails": {
    "paymentId": "mock_1743734012407",
    "status": "completed",
    "paymentEmail": "ximena@ximena.com",
    "amount": 65000,
    "provider": "paypal"
  },
  "voucher": {
    "storeId": "67eed05824675522cea87ee5",
    "productId": "67ef0286963bc2fd531e77f3",
    "senderName": "ximena",
    "senderEmail": "ximena@ximena.com",
    "receiverName": "Daniela",
    "receiverEmail": "daniela@daniela.com",
    "message": "test csf atre w",
    "template": "template3",
    "expirationDate": "2026-04-04T02:33:32.407Z"
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
      "amount": 25.0,
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
    "amount": 30.0,
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
      "amount": 30.0,
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
        "amount": 25.0,
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
