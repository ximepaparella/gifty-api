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
   ```

4. Start the development server:
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