import mongoose, { Schema } from 'mongoose';
import { IOrder } from './order.interface';
import { isValidEmail } from '@modules/voucher/application/voucher.validator';
import { generateRandomCode } from '@shared/utils/codeGenerator';
import { generateQRCode } from '@shared/utils/qrCodeGenerator';

// Create a type that extends the interface
export type IOrderDocument = mongoose.Document & IOrder;

// Create the schema
const OrderSchema = new Schema(
  {
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Customer ID is required'],
    },
    paymentDetails: {
      paymentId: {
        type: String,
        required: [true, 'Payment ID is required'],
      },
      paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending',
        required: [true, 'Payment status is required'],
      },
      paymentEmail: {
        type: String,
        required: [true, 'Payment email is required'],
      },
      amount: {
        type: Number,
        min: [0, 'Amount must be positive'],
        required: [true, 'Amount is required'],
      },
      provider: {
        type: String,
        enum: ['mercadopago', 'paypal', 'stripe'],
        required: [true, 'Payment provider is required'],
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
      updatedAt: {
        type: Date,
        default: Date.now,
      },
    },
    voucher: {
      storeId: {
        type: Schema.Types.ObjectId,
        ref: 'Store',
        required: [true, 'Store ID is required'],
      },
      productId: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: [true, 'Product ID is required'],
      },
      code: {
        type: String,
        unique: true,
        required: [true, 'Voucher code is required'],
      },
      status: {
        type: String,
        enum: ['active', 'redeemed', 'expired'],
        default: 'active',
        required: [true, 'Voucher status is required'],
      },
      isRedeemed: {
        type: Boolean,
        default: false,
      },
      redeemedAt: {
        type: Date,
        default: null,
      },
      expirationDate: {
        type: Date,
        required: [true, 'Expiration date is required'],
      },
      qrCode: {
        type: String,
      },
      senderName: {
        type: String,
        required: [true, 'Sender name is required'],
      },
      senderEmail: {
        type: String,
        required: [true, 'Sender email is required'],
      },
      receiverName: {
        type: String,
        required: [true, 'Receiver name is required'],
      },
      receiverEmail: {
        type: String,
        required: [true, 'Receiver email is required'],
      },
      message: {
        type: String,
        required: [true, 'Message is required'],
      },
      template: {
        type: String,
        enum: [
          'template1',
          'template2',
          'template3',
          'template4',
          'template5',
          'birthday',
          'christmas',
          'valentine',
          'general',
        ],
        default: 'general',
        required: [true, 'Template is required'],
      },
    },
    emailsSent: {
      type: Boolean,
      default: false,
    },
    pdfGenerated: {
      type: Boolean,
      default: false,
    },
    pdfUrl: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for better query performance
OrderSchema.index({ 'voucher.code': 1 }, { unique: true });
OrderSchema.index({ customerId: 1 });
OrderSchema.index({ 'voucher.storeId': 1 });
OrderSchema.index({ 'voucher.receiverEmail': 1 });
OrderSchema.index({ 'voucher.senderEmail': 1 });

// Check if voucher has expired before saving
OrderSchema.pre('save', function (next) {
  const order = this as IOrderDocument;
  
  if (order.voucher.expirationDate < new Date()) {
    order.voucher.status = 'expired';
  }
  
  next();
});

// Create and export the model
export const Order = mongoose.model<IOrderDocument>('Order', OrderSchema); 