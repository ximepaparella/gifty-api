import { Request, Response, NextFunction } from 'express';
import { redisClient } from '@shared/infrastructure/cache/redis';
import logger from '@shared/infrastructure/logging/logger';

// Define a type for the json method to fix the return type issue
type JsonMethod = (body: any) => any;

// Define a custom response interface that extends Express Response
interface CustomResponse extends Response {
  json: JsonMethod;
}

export const cache = (duration: number = 3600) => {
  return async (req: Request, res: CustomResponse, next: NextFunction): Promise<void> => {
    if (req.method !== 'GET') {
      return next();
    }

    const key = `cache:${req.originalUrl}`;

    try {
      const cachedData = await redisClient.get(key);

      if (cachedData) {
        logger.info(`Cache hit for ${key}`);
        res.json(JSON.parse(cachedData));
        return;
      }

      // Store original send function
      const originalSend = res.json;

      // Override res.json method
      res.json = function (body: any) {
        // Store the response in cache
        redisClient
          .setEx(key, duration, JSON.stringify(body))
          .catch((err: Error) => logger.error('Redis cache error:', err));

        // Call original send function
        return originalSend.call(this, body);
      };

      next();
    } catch (error) {
      logger.error('Cache middleware error:', error);
      next();
    }
  };
};
