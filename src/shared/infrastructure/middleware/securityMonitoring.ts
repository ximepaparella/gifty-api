import { Request, Response, NextFunction } from 'express';
import logger from '../logging/logger';
import { securityConfig } from '../config/security.config';

// In-memory store for IP violations (in production, use Redis or similar)
const ipViolations = new Map<string, { count: number; timestamp: number }>();

// Clean up old IP violations periodically
setInterval(
  () => {
    const now = Date.now();
    for (const [ip, data] of ipViolations.entries()) {
      if (now - data.timestamp > securityConfig.ipBlacklist.blacklistDuration * 60 * 60 * 1000) {
        ipViolations.delete(ip);
      }
    }
  },
  60 * 60 * 1000
); // Clean up every hour

export const monitorRateLimitHit = (req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip;

  // Log rate limit hit
  logger.warn('Rate limit exceeded', {
    ip,
    path: req.path,
    method: req.method,
    userAgent: req.get('user-agent'),
  });

  // Track IP violations
  const violations = ipViolations.get(ip) || { count: 0, timestamp: Date.now() };
  violations.count++;
  ipViolations.set(ip, violations);

  // Check if IP should be blacklisted
  if (violations.count >= securityConfig.ipBlacklist.maxViolations) {
    logger.error('IP blacklisted due to excessive violations', {
      ip,
      violations: violations.count,
    });
    return res.status(403).json({
      status: 'error',
      message: 'Access denied due to excessive violations',
    });
  }

  next();
};

export const monitorFileUpload = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  const originalEnd = res.end;

  // Override end method to log after response is sent
  res.end = function (chunk?: any, encoding?: any, callback?: any) {
    const duration = Date.now() - startTime;
    const fileSize = req.file?.size || 0;
    const success = res.statusCode >= 200 && res.statusCode < 300;

    logger.info('File upload attempt', {
      success,
      statusCode: res.statusCode,
      duration,
      fileSize,
      mimeType: req.file?.mimetype,
      path: req.path,
      ip: req.ip,
    });

    return originalEnd.call(this, chunk, encoding, callback);
  };

  next();
};

export const validateApiKey = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.header('X-API-Key');

  if (apiKey && securityConfig.apiKeys.includes(apiKey)) {
    // For trusted clients with valid API keys, we can bypass some rate limits
    req.trusted = true;
    next();
  } else {
    // For regular clients, proceed without trusted status
    next();
  }
};

// Middleware to limit request body size
export const requestSizeLimiter = (req: Request, res: Response, next: NextFunction) => {
  const contentLength = parseInt(req.get('content-length') || '0', 10);
  const maxSize = parseInt(securityConfig.requestLimits.json.replace('mb', ''), 10) * 1024 * 1024;

  if (contentLength > maxSize) {
    logger.warn('Request body size exceeded limit', {
      size: contentLength,
      limit: maxSize,
      path: req.path,
      ip: req.ip,
    });

    return res.status(413).json({
      status: 'error',
      message: 'Request entity too large',
    });
  }

  next();
};
