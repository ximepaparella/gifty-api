import Joi from 'joi';
import mongoose from 'mongoose';
import { IProduct } from './product.entity';

const ProductSchema = new mongoose.Schema<IProduct>({
  _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
  image: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Add indexes
ProductSchema.index({ storeId: 1 });
ProductSchema.index({ name: 1 });

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
    isActive: Joi.boolean().default(true),
    image: Joi.string().allow(null).optional()
  });

  return schema.validate(product);
};

export const Product = mongoose.model<IProduct>('Product', ProductSchema);
export default Product; 