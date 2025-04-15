import mongoose, { Schema, Document } from 'mongoose';
import { IOrder, IPaymentDetails, IVoucher } from './order.interface';

// Payment Details Sub-Schema
const PaymentDetailsSchema = new Schema<IPaymentDetails>(
  {
    paymentId: { type: String, required: true },
    status: { type: String, enum: ['pending', 'completed', 'failed'], required: true },
    paymentEmail: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    provider: { type: String, enum: ['mercadopago', 'paypal', 'stripe'], required: true },
    currency: { type: String },
    paymentMethod: { type: String },
    transactionId: { type: String },
    createdAt: { type: Date },
    updatedAt: { type: Date },
  },
  { _id: false }
);

// Voucher Sub-Schema
const VoucherSchema = new Schema<IVoucher>(
  {
    storeId: { type: Schema.Types.ObjectId, required: true, ref: 'Store' },
    productId: { type: Schema.Types.ObjectId, required: true, ref: 'Product' },
    code: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ['active', 'redeemed', 'expired'],
      required: true,
      default: 'active',
    },
    isRedeemed: { type: Boolean, default: false },
    redeemedAt: { type: Date, default: null },
    senderName: { type: String, required: true },
    senderEmail: { type: String, required: true },
    receiverName: { type: String, required: true },
    receiverEmail: { type: String, required: true },
    message: { type: String },
    qrCode: { type: String },
    amount: { type: Number, required: true },
    expirationDate: { type: Date, required: true },
    template: {
      type: String,
      enum: ['template1', 'template2', 'template3', 'template4', 'template5'],
      required: true,
    },
  },
  { _id: false }
);

// Define the Mongoose Document interface
export interface IOrderDocument extends Omit<IOrder, '_id'>, Document {}

// Main Order Schema
const OrderSchema = new Schema<IOrderDocument>(
  {
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'Customer',
      required: [true, 'Customer ID is required'],
      index: true,
    },
    voucher: {
      type: VoucherSchema,
      required: [true, 'Voucher is required'],
    },
    paymentDetails: {
      type: PaymentDetailsSchema,
      required: [true, 'Payment details are required'],
    },
    emailsSent: { type: Boolean, default: false },
    pdfGenerated: { type: Boolean, default: false },
    pdfUrl: { type: String },
  },
  {
    timestamps: true,
  }
);

// Create indexes
OrderSchema.index({ 'voucher.code': 1 }, { unique: true });
OrderSchema.index({ customerId: 1 });
OrderSchema.index({ 'voucher.storeId': 1 });
OrderSchema.index({ createdAt: 1 });
OrderSchema.index({ updatedAt: 1 });

// Export the model
export const OrderModel = mongoose.model<IOrderDocument>('Order', OrderSchema);
