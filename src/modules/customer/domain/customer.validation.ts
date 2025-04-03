import Joi from 'joi';

export const customerValidationSchema = Joi.object({
  userId: Joi.string().hex().length(24).optional().allow(null),
  fullName: Joi.string().min(3).max(100).required(),
  email: Joi.string().email().required(),
  phoneNumber: Joi.string().min(7).max(20).required(),
  address: Joi.string().min(5).max(255).required(),
  city: Joi.string().min(2).max(100).required(),
  zipCode: Joi.string().min(3).max(20).required(),
  country: Joi.string().min(2).max(100).required()
});

export const updateCustomerValidationSchema = Joi.object({
  userId: Joi.string().hex().length(24).optional().allow(null),
  fullName: Joi.string().min(3).max(100).optional(),
  email: Joi.string().email().optional(),
  phoneNumber: Joi.string().min(7).max(20).optional(),
  address: Joi.string().min(5).max(255).optional(),
  city: Joi.string().min(2).max(100).optional(),
  zipCode: Joi.string().min(3).max(20).optional(),
  country: Joi.string().min(2).max(100).optional()
}).min(1); // Ensure at least one field is being updated 