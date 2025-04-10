import { Request, Response, NextFunction } from 'express';
import { Schema } from 'joi';
import { ErrorTypes } from '../../types/appError';

/**
 * Middleware to validate request data against a Joi schema
 * @param schema - Joi schema to validate against
 * @returns Express middleware function
 */
const validateRequest = (schema: Schema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      const errorMessage = error.details.map((detail) => detail.message).join(', ');

      return next(ErrorTypes.VALIDATION(errorMessage));
    }

    next();
  };
};

export default validateRequest;
