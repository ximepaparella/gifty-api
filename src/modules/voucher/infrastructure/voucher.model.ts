import mongoose, { Schema, Document } from 'mongoose';
import { IVoucher } from '../domain/voucher.interface';
import { generateVoucherCode } from '@shared/utils/codeGenerator';

export interface IVoucherDocument extends Omit<IVoucher, '_id'>, Document {}

const VoucherSchema: Schema = new Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      default: () => generateVoucherCode(),
    },
    storeId: {
      type: Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    expirationDate: {
      type: Date,
      required: true,
    },
    isRedeemed: {
      type: Boolean,
      default: false,
    },
    redeemedAt: {
      type: Date,
      default: null,
    },
    sender_name: {
      type: String,
      required: true,
    },
    sender_email: {
      type: String,
      required: true,
    },
    receiver_name: {
      type: String,
      required: true,
    },
    receiver_email: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
      maxlength: 500,
    },
    template: {
      type: String,
      enum: ['template1', 'template2', 'template3', 'template4'],
      default: 'general',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IVoucherDocument>('Voucher', VoucherSchema); 