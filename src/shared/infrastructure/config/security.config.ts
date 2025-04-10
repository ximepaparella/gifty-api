import dotenv from 'dotenv';

dotenv.config();

export const securityConfig = {
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
    allowedOrigins: [
      'http://localhost:3001',
      'http://localhost:8080',
      process.env.PRODUCTION_FRONTEND_URL,
    ].filter(Boolean),
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
