# Gifty API

A modern, TypeScript-based RESTful API for gift card management built with Node.js, Express, and MongoDB. This API follows clean architecture principles and provides robust user management functionality.

## Features

- **TypeScript Integration**: Fully typed codebase for improved developer experience and code quality
- **Clean Architecture**: Organized in layers (domain, application, infrastructure, interface) for better maintainability
- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **MongoDB Integration**: Mongoose ODM for MongoDB interaction
- **API Documentation**: Swagger/OpenAPI documentation
- **Error Handling**: Centralized error handling with custom error classes
- **Validation**: Request validation using Joi
- **Logging**: Structured logging with Winston
- **QR Code Generation**: Automatic QR code generation for voucher redemption
- **PDF Generation**: Dynamic PDF generation for vouchers using Puppeteer
- **Email Notifications**: Automated email sending to customers, receivers, and stores
- **Voucher Management**: Complete voucher lifecycle with creation, redemption, and expiration handling
- **Responsive Templates**: Customizable email and PDF templates for vouchers

## Project Structure

```
src/
├── modules/              # Feature modules
│   └── user/             # User module
│       ├── domain/       # Domain layer (entities, interfaces)
│       ├── application/  # Application layer (services, use cases)
│       ├── infrastructure/ # Infrastructure layer (repositories, models)
│       └── interface/    # Interface layer (controllers, routes)
└── shared/               # Shared code
    ├── types/            # Shared types and interfaces
    └── infrastructure/   # Shared infrastructure
        ├── middleware/   # Express middleware
        ├── errors/       # Error handling
        ├── logging/      # Logging
        └── database/     # Database connection
```

## QR Code Functionality

The Gifty API features a robust QR code generation system for voucher redemption:

### How It Works

1. **QR Code Generation**: When an order is created, a QR code is automatically generated containing a URL with the voucher code.
   
2. **Storage**: The QR code is stored as a base64-encoded data URL in the database, attached to the voucher.
   
3. **PDF Integration**: The QR code is embedded in the PDF voucher that is generated for each order.
   
4. **Email Distribution**: The PDF containing the QR code is sent via email to the customer, receiver, and store.
   
5. **Redemption Process**: Store staff can scan the QR code using any standard QR code reader. The code redirects to a redemption URL, which calls the API endpoint to redeem the voucher.

### Implementation Details

- QR codes are generated using the `qrcode` npm package
- The QR code contains a URL in the format: `{FRONTEND_URL}/vouchers/redeem/{VOUCHER_CODE}`
- The QR code generation is handled by the `generateVoucherRedemptionQRCode` utility function
- When a voucher is redeemed via QR code, the same API endpoint is used as for manual code entry

### Benefits

- **Faster Redemption**: Store staff can quickly scan QR codes instead of manually entering voucher codes
- **Reduced Errors**: Eliminates typing errors that can occur with manual code entry
- **Enhanced Customer Experience**: Professional-looking vouchers with modern redemption options
- **Tracking Capability**: Each redemption is logged with a timestamp for better tracking and reporting

## Voucher PDF and Email System

The Gifty API includes a comprehensive system for generating and distributing vouchers:

### PDF Generation

1. **Dynamic Generation**: Each voucher is dynamically rendered as a PDF using Puppeteer
   
2. **Custom Templates**: The system supports multiple voucher templates (e.g., "birthday", "christmas", "general")
   
3. **Data Replacement**: Template placeholders are replaced with actual order and voucher data
   
4. **Storage**: Generated PDFs are stored in the `uploads/vouchers` directory and referenced in the database

### Email Distribution

The system automatically sends emails to multiple recipients:

1. **Customer Email**: Sent to the person who purchased the voucher
   
2. **Receiver Email**: Sent to the intended recipient of the gift
   
3. **Store Email**: Sent to the store where the voucher can be redeemed
   
Each email includes:
- Personalized greeting and message
- Voucher details (amount, expiration date, etc.)
- The voucher PDF as an attachment
- The QR code for redemption

### Resend Capabilities

If an email fails to deliver or needs to be sent again, the API provides endpoints to:
- Resend all emails for an order
- Resend only to the customer
- Resend only to the receiver
- Resend only to the store

This feature ensures that all parties receive the necessary voucher information, even in case of delivery issues.

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/gifty-api.git
   cd gifty-api
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/gifty
   JWT_SECRET=your_jwt_secret_key
   NODE_ENV=development
   
   # Email configuration
   EMAIL_HOST=smtp.example.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@example.com
   EMAIL_PASSWORD=your_email_password
   EMAIL_FROM=Gifty <noreply@gifty.com>
   
   # Frontend URL (used for QR code generation)
   FRONTEND_URL=http://localhost:3000
   
   # PDF storage path
   UPLOAD_DIR=uploads
   ```

4. Create the uploads directory for storing PDFs:
   ```bash
   mkdir -p uploads/vouchers
   ```
   
5. Install the required dependencies:
   ```bash
   npm install qrcode puppeteer
   ```

6. Start the development server:
   ```bash
   npm run dev
   ```

### Initial Setup

Before using the API, you need to create an admin user:

1. Use the `/api/v1/users/setup-admin` endpoint to create the first admin user
2. Login with the admin credentials to get a JWT token
3. Use the token for authenticated requests

## API Documentation

See [DOCUMENTATION.md](./DOCUMENTATION.md) for detailed API documentation.

## Available Scripts

- `npm run dev` - Start the development server with hot-reload
- `npm run build` - Build the project for production
- `npm start` - Start the production server
- `npm test` - Run tests

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.