import { Request, Response, NextFunction } from 'express';
import { Schema } from 'joi';
import { validationError } from '@shared/types/appError';

/**
 * Middleware to validate request data against a Joi schema
 * @param schema - Joi schema to validate against
 * @returns Express middleware function
 */
const validateRequest = (schema: Schema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errorMessage = error.details.map((detail) => detail.message).join(', ');

      return next(validationError(errorMessage));
    }

    next();
  };
};

export default validateRequest;
