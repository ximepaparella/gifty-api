import rateLimit from 'express-rate-limit';
import cors from 'cors';
import helmet from 'helmet';
import express, { Express, Request } from 'express';
import { securityConfig } from '../config/security.config';
import {
  monitorRateLimitHit,
  monitorFileUpload,
  validateApiKey,
  requestSizeLimiter,
} from './securityMonitoring';

// Interface is now defined in types/express/index.d.ts

// Extend Express Request type to include trusted property
declare global {
  namespace Express {
    interface Request {
      trusted?: boolean;
    }
  }
}

// Rate limiting configuration
export const rateLimiter = rateLimit({
  windowMs: securityConfig.rateLimits.general.windowMs,
  max: (req: Request): number => {
    return req.trusted
      ? securityConfig.rateLimits.general.max * 2
      : securityConfig.rateLimits.general.max;
  },
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    monitorRateLimitHit(req, res, next);
    res.status(429).json({
      status: 'error',
      message: options.message,
    });
  },
});

// Specific limiter for login attempts
export const loginLimiter = rateLimit({
  windowMs: securityConfig.rateLimits.login.windowMs,
  max: securityConfig.rateLimits.login.max,
  message: 'Too many login attempts from this IP, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    monitorRateLimitHit(req, res, next);
    res.status(429).json({
      status: 'error',
      message: options.message,
    });
  },
});

// CORS configuration
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

// Helmet configuration
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

// Function to apply all security middleware
export const applySecurityMiddleware = (app: Express): void => {
  // API key validation
  app.use(validateApiKey);

  // Request size limits
  app.use(express.json({ limit: securityConfig.requestLimits.json }));
  app.use(express.urlencoded({ extended: true, limit: securityConfig.requestLimits.urlencoded }));

  // Apply CORS
  app.use(cors(corsOptions));

  // Apply Helmet with custom config
  app.use(helmet(helmetConfig));

  // Apply rate limiting
  app.use('/api/', rateLimiter);
  app.use('/api/v1/login', loginLimiter);

  // Monitor file uploads for specific routes
  const fileUploadPaths = [
    '/api/v1/stores/:storeId/logo',
    '/api/v1/products/:productId/image',
    '/api/v1/vouchers/:voucherId/pdf',
  ];

  fileUploadPaths.forEach((path) => {
    app.use(path, monitorFileUpload);
  });
};
