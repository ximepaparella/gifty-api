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
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
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
    status: {
      type: String,
      enum: ['active', 'expired', 'redeemed'],
      default: 'active',
    },
    isRedeemed: {
      type: Boolean,
      default: false,
    },
    redeemedAt: {
      type: Date,
      default: null,
    },
    qrCode: {
      type: String,
    },
    senderName: {
      type: String,
      required: true,
    },
    senderEmail: {
      type: String,
      required: true,
    },
    receiverName: {
      type: String,
      required: true,
    },
    receiverEmail: {
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
      enum: ['birthday', 'christmas', 'valentine', 'general', 'template1'],
      default: 'general',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IVoucherDocument>('Voucher', VoucherSchema); 