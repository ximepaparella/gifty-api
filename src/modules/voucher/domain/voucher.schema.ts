import mongoose, { Document, Schema } from 'mongoose';

// Explicitly define our document interface with correct types
export interface IVoucherDocument extends Document {
  storeId: mongoose.Types.ObjectId | string;
  productId: mongoose.Types.ObjectId | string;
  customerId?: mongoose.Types.ObjectId | string;
  code: string;
  status: string;
  isRedeemed: boolean;
  redeemedAt: Date | null;
  amount: number;
  expirationDate: Date;
  qrCode: string;
  senderName: string;
  senderEmail: string;
  receiverName: string;
  receiverEmail: string;
  message: string;
  template: string;
  createdAt: Date;
  updatedAt: Date;
}

const VoucherSchema = new Schema<IVoucherDocument>(
  {
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
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    code: {
      type: String,
      required: [true, 'Voucher code is required'],
      unique: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['active', 'redeemed', 'expired'],
      required: true,
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
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount must be a positive number'],
    },
    expirationDate: {
      type: Date,
      required: [true, 'Expiration date is required'],
      validate: {
        validator: function (value: Date) {
          return value > new Date();
        },
        message: 'Expiration date must be in the future',
      },
    },
    qrCode: {
      type: String,
      required: [true, 'QR code is required'],
    },
    senderName: {
      type: String,
      required: [true, 'Sender name is required'],
      trim: true,
    },
    senderEmail: {
      type: String,
      required: [true, 'Sender email is required'],
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    receiverName: {
      type: String,
      required: [true, 'Receiver name is required'],
      trim: true,
    },
    receiverEmail: {
      type: String,
      required: [true, 'Receiver email is required'],
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
      maxlength: [500, 'Message cannot be more than 500 characters'],
    },
    template: {
      type: String,
      required: [true, 'Template is required'],
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
      default: 'template1',
    },
  },
  { timestamps: true }
);

// Compound Indexes for optimized queries and to prevent race conditions
VoucherSchema.index({ code: 1 }, { unique: true }); // Prevent duplicate voucher codes
VoucherSchema.index({ code: 1, isRedeemed: 1 }); // For fast lookups during redemption
VoucherSchema.index({ code: 1, status: 1 }); // For fast lookups during redemption
VoucherSchema.index({ customerId: 1, status: 1 }); // Fetch vouchers for a user by status
VoucherSchema.index({ storeId: 1, status: 1 }); // Fetch all active vouchers for a store
VoucherSchema.index({ receiverEmail: 1, status: 1 }); // Fetch vouchers by receiver email and status

// Do not use TTL index for auto-expiration as we want to keep expired vouchers
// Instead, add a normal index on expirationDate for filtering
VoucherSchema.index({ expirationDate: 1 });

// Add pre-save middleware to validate expirationDate is in the future
VoucherSchema.pre('save', function (this: IVoucherDocument, next) {
  // Skip validation if the voucher is already redeemed or expired
  if (this.status === 'redeemed' || this.status === 'expired') {
    return next();
  }

  // Check if expiration date is in the past
  if (this.expirationDate < new Date()) {
    this.status = 'expired';
  }

  next();
});

export const Voucher = mongoose.model<IVoucherDocument>('Voucher', VoucherSchema);
