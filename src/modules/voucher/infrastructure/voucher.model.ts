import { Schema, model } from 'mongoose';
import { IVoucher, IVoucherDocument } from '../domain/voucher.entity';
import { generateVoucherCode } from '@shared/utils/codeGenerator';

export const VoucherSchema: Schema = new Schema(
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

// Add indexes
VoucherSchema.index({ code: 1 });
VoucherSchema.index({ storeId: 1 });
VoucherSchema.index({ customerId: 1 });
VoucherSchema.index({ status: 1 });

export const VoucherModel = model<IVoucherDocument>('Voucher', VoucherSchema);
