import mongoose from 'mongoose';
import { ICustomer } from './customer.entity';

export const CustomerSchema = new mongoose.Schema<ICustomer>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false, // User association is optional
      default: null
    },
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phoneNumber: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true }
  },
  {
    timestamps: true // Automatically adds createdAt and updatedAt
  }
);

// Index for efficient email lookups
CustomerSchema.index({ email: 1 });

// Export the model
export const CustomerModel = mongoose.model<ICustomer>('Customer', CustomerSchema); 