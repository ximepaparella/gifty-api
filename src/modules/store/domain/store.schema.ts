import mongoose from 'mongoose';
import Joi from 'joi';
import { IStore } from './store.entity';

const StoreSchema = new mongoose.Schema<IStore>({
  _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
  name: { type: String, required: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  logo: { type: String, default: null },
  social: {
    instagram: { type: String, default: null },
    facebook: { type: String, default: null },
    tiktok: { type: String, default: null },
    youtube: { type: String, default: null },
    others: [{ name: String, url: String }],
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Add indexes
StoreSchema.index({ ownerId: 1 });
StoreSchema.index({ email: 1 }, { unique: true });

// Validation schema using Joi
export const validateStore = (store: any) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    ownerId: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .required(),
    email: Joi.string().email().required(),
    phone: Joi.string().required(),
    address: Joi.string().required(),
    logo: Joi.string().allow(null),
    social: Joi.object({
      instagram: Joi.string().allow(null),
      facebook: Joi.string().allow(null),
      tiktok: Joi.string().allow(null),
      youtube: Joi.string().allow(null),
      others: Joi.array()
        .items(
          Joi.object({
            name: Joi.string().required(),
            url: Joi.string().required(),
          })
        )
        .default([]),
    }).default({}),
  });
  return schema.validate(store);
};

export const Store = mongoose.model<IStore>('Store', StoreSchema);
export default Store;
