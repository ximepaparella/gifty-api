import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import helmet from 'helmet';
import express, { Express } from 'express';
import { securityConfig } from '../config/security.config';
import {
  monitorRateLimitHit,
  monitorFileUpload,
} from './securityMonitoring';
import { ErrorTypes } from '@shared/types/appError';

// Type declarations
declare module 'express' {
  interface Request {
    trusted?: boolean;
  }
}

// Middleware functions
export const validateApiKey = (req: Request, res: Response, next: NextFunction): void => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey || apiKey !== process.env.API_KEY) {
    throw ErrorTypes.UNAUTHORIZED('Invalid API Key');
  }
  
  next();
};

export const securityHeaders = (req: Request, res: Response, next: NextFunction): void => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
};

export const requestSizeLimiter = (maxSize: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (
      req.headers['content-length'] &&
      parseInt(req.headers['content-length']) > parseInt(maxSize)
    ) {
      throw ErrorTypes.BAD_REQUEST('Request entity too large');
    }
    next();
  };
};

// Configuration objects
export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});

export const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (!origin || securityConfig.cors.allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
  credentials: true,
  maxAge: securityConfig.cors.maxAge,
};

export const helmetConfig = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:', 'http:'],
      connectSrc: ["'self'", 'https:', 'http:'],
      fontSrc: ["'self'", 'https:', 'data:'],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: {
    policy: 'cross-origin' as const,
  },
};

// Main security setup function
export const applySecurityMiddleware = (app: Express): void => {
  // Request size limits
  app.use(express.json({ limit: securityConfig.requestLimits.json }));
  app.use(express.urlencoded({ extended: true, limit: securityConfig.requestLimits.urlencoded }));

  // Apply CORS
  app.use(cors(corsOptions));

  // Apply Helmet with custom config
  app.use(helmet(helmetConfig));

  // Apply rate limiting
  app.use('/api/', rateLimiter);

  // Monitor file uploads for specific routes
  const fileUploadPaths = [
    '/api/v1/stores/:storeId/logo',
    '/api/v1/products/:productId/image',
    '/api/v1/vouchers/:voucherId/pdf',
  ];

  fileUploadPaths.forEach((path) => {
    app.use(path, monitorFileUpload);
  });

  // Apply API key validation only to protected routes
  const protectedRoutes = [
    '/api/v1/stores',
    '/api/v1/products',
    '/api/v1/orders',
    '/api/v1/vouchers',
    '/api/v1/customers',
  ];

  protectedRoutes.forEach((path) => {
    app.use(path, validateApiKey);
  });
};
