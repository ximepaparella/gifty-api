import mongoose, { Schema, Document } from 'mongoose';
import { ICustomer } from '@modules/customer/domain/customer.entity';
import { IVoucher } from '@modules/voucher/domain/voucher.entity';

// --- Define Sub-Schemas First ---

// Payment Details Sub-Schema
// Interface for PaymentDetails (without Mongoose specifics)
interface IPaymentDetails {
  paymentId: string;
  paymentStatus: 'pending' | 'completed' | 'failed';
  paymentEmail: string;
  amount: number;
  provider: 'mercadopago' | 'paypal' | 'stripe';
}

const PaymentDetailsSchema = new Schema<IPaymentDetails>({
  paymentId: { type: String, required: true },
  paymentStatus: { type: String, enum: ['pending', 'completed', 'failed'], required: true },
  paymentEmail: { type: String, required: true },
  amount: { type: Number, required: true, min: 0 },
  provider: { type: String, enum: ['mercadopago', 'paypal', 'stripe'], required: true },
}, { _id: false });

// --- Define Main Order Interface & Schema ---

// Order Status Enum
export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

// Define the core Order interface (without Mongoose Document fields)
export interface IOrder {
  customerId: mongoose.Types.ObjectId | ICustomer; // Reference Customer
  paymentDetails: IPaymentDetails;
  voucher: IVoucher;
  status: OrderStatus;
  emailsSent: boolean;
  pdfGenerated: boolean;
  pdfUrl: string | null;
  // Mongoose handles _id, createdAt, updatedAt
}

// Define the Mongoose Document interface extending the core interface
export interface IOrderDocument extends IOrder, Document {}

// Main Order Schema using IOrderDocument
const OrderSchema = new Schema<IOrderDocument>(
  {
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'Customer',
      required: [true, 'Customer ID is required'],
      index: true,
    },
    paymentDetails: {
      type: PaymentDetailsSchema,
      required: [true, 'Payment details are required'],
    },
    voucher: {
      type: Schema.Types.Mixed,
      required: [true, 'Voucher is required'],
    },
    status: {
      type: String,
      enum: Object.values(OrderStatus),
      default: OrderStatus.PENDING,
      required: true,
    },
    emailsSent: { type: Boolean, default: false },
    pdfGenerated: { type: Boolean, default: false },
    pdfUrl: { type: String, default: null },
  },
  {
    timestamps: true, // Let Mongoose manage createdAt and updatedAt
  }
);

// Pre-save hook (commented out for now to isolate potential issues)
/*
OrderSchema.pre('save', function (next) {
  const order = this as IOrderDocument;
  // Need to populate voucher to check expiration/status
  // This logic might be better placed in the service layer before saving
  // Example (requires populating voucher first):
  // if (order.voucher && order.voucher instanceof VoucherModel && order.voucher.expirationDate < new Date()) {
  //   return next(new Error('Cannot create order with expired voucher'));
  // }
  // if (order.voucher && order.voucher instanceof VoucherModel && order.voucher.status !== 'active') {
  //   return next(new Error('Cannot create order with non-active voucher'));
  // }
  next();
});
*/

// Export the model
export const OrderModel = mongoose.model<IOrderDocument>('Order', OrderSchema); 