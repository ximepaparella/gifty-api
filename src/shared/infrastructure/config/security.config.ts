import dotenv from 'dotenv';
import { ErrorTypes } from '@shared/types/appError';

dotenv.config();

interface RateLimitConfig {
  windowMs: number;
  max: number;
}

interface CorsConfig {
  allowedOrigins: string[];
  maxAge: number;
}

interface RequestLimits {
  json: string;
  urlencoded: string;
}

interface IpBlacklistConfig {
  maxViolations: number;
  blacklistDuration: number;
}

interface SecurityConfig {
  rateLimits: {
    general: RateLimitConfig;
    login: RateLimitConfig;
  };
  cors: CorsConfig;
  requestLimits: RequestLimits;
  apiKeys: string[];
  ipBlacklist: IpBlacklistConfig;
}

const validateConfig = (config: SecurityConfig): void => {
  if (!config.rateLimits.general.windowMs || !config.rateLimits.general.max) {
    throw ErrorTypes.INTERNAL('Invalid rate limit configuration');
  }

  if (!config.rateLimits.login.windowMs || !config.rateLimits.login.max) {
    throw ErrorTypes.INTERNAL('Invalid login rate limit configuration');
  }

  if (!config.cors.allowedOrigins.length) {
    throw ErrorTypes.INTERNAL('No allowed CORS origins configured');
  }
};

const allowedOrigins = [
  'http://localhost:3001',
  'http://localhost:8080',
  process.env.PRODUCTION_FRONTEND_URL,
].filter((origin): origin is string => origin !== undefined);

export const securityConfig: SecurityConfig = {
  // Rate limiting
  rateLimits: {
    general: {
      windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
      max: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    },
    login: {
      windowMs: Number(process.env.LOGIN_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
      max: Number(process.env.LOGIN_RATE_LIMIT_MAX_ATTEMPTS) || 5,
    },
  },

  // CORS
  cors: {
    allowedOrigins,
    maxAge: Number(process.env.CORS_MAX_AGE) || 86400,
  },

  // Request size limits
  requestLimits: {
    json: process.env.MAX_JSON_SIZE || '10mb',
    urlencoded: process.env.MAX_URLENCODED_SIZE || '10mb',
  },

  // API Keys (for trusted clients)
  apiKeys: (process.env.TRUSTED_API_KEYS || '').split(',').filter(Boolean),

  // IP Blacklist
  ipBlacklist: {
    maxViolations: Number(process.env.MAX_VIOLATIONS_BEFORE_BLACKLIST) || 10,
    blacklistDuration: Number(process.env.IP_BLACKLIST_DURATION_HOURS) || 24, // hours
  },
};

// Validate configuration on startup
validateConfig(securityConfig);
