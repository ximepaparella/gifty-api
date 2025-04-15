import Joi from 'joi';
import { UserRole } from './user.entity';

const userSchemas = {
  create: Joi.object({
    name: Joi.string().min(2).max(50).required().messages({
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name cannot exceed 50 characters',
      'any.required': 'Name is required',
    }),
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
    }),
    password: Joi.string().min(8).required().messages({
      'string.min': 'Password must be at least 8 characters long',
      'any.required': 'Password is required',
    }),
    role: Joi.string()
      .valid(...Object.values(UserRole))
      .default(UserRole.CUSTOMER)
      .messages({
        'any.only': `Role must be one of: ${Object.values(UserRole).join(', ')}`,
      }),
  }),

  update: Joi.object({
    name: Joi.string().min(2).max(50).messages({
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name cannot exceed 50 characters',
    }),
    email: Joi.string().email().messages({
      'string.email': 'Please provide a valid email address',
    }),
    password: Joi.string().min(8).messages({
      'string.min': 'Password must be at least 8 characters long',
    }),
    role: Joi.string()
      .valid(...Object.values(UserRole))
      .messages({
        'any.only': `Role must be one of: ${Object.values(UserRole).join(', ')}`,
      }),
  }).min(1),

  login: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
    }),
    password: Joi.string().required().messages({
      'any.required': 'Password is required',
    }),
  }),
};

export { userSchemas };
