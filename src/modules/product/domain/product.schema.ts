import Joi from 'joi';
import mongoose from 'mongoose';

export const ProductSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

ProductSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

ProductSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: new Date() });
  next();
});

export const validateProduct = (product: unknown) => {
  const schema = Joi.object({
    storeId: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .required()
      .messages({
        'string.pattern.base': 'Store ID must be a valid MongoDB ObjectId',
        'any.required': 'Store ID is required'
      }),
    name: Joi.string().required().messages({
      'string.empty': 'Name cannot be empty',
      'any.required': 'Name is required'
    }),
    description: Joi.string().required().messages({
      'string.empty': 'Description cannot be empty',
      'any.required': 'Description is required'
    }),
    price: Joi.number().positive().required().messages({
      'number.base': 'Price must be a number',
      'number.positive': 'Price must be positive',
      'any.required': 'Price is required'
    }),
    isActive: Joi.boolean().default(true)
  });

  return schema.validate(product);
}; 