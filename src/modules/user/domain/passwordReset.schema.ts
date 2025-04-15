import Joi from 'joi';

const passwordResetSchema = {
  requestReset: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
    }),
  }),

  resetPassword: Joi.object({
    password: Joi.string()
      .min(8)
      .max(32)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
      .required()
      .messages({
        'string.min': 'Password must be at least 8 characters long',
        'string.max': 'Password cannot exceed 32 characters',
        'string.pattern.base':
          'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character',
        'any.required': 'Password is required',
      }),
    confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
      'any.only': 'Passwords do not match',
      'any.required': 'Password confirmation is required',
    }),
  }),
};

export { passwordResetSchema };
