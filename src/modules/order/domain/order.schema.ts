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

// Mercado Pago Info Sub-Schema
const MercadoPagoInfoSchema = new Schema(
  {
    mp_payment_id: { type: String, required: true, index: true },
    status: { type: String, required: true },
    status_detail: { type: String, required: true },
    payment_method_id: { type: String, required: true },
    transaction_amount: { type: Number, required: true },
    installments: { type: Number, required: true },
    payer_email: { type: String, required: true },
  },
  { _id: false }
);

// PayPal Info Sub-Schema
const PaypalInfoSchema = new Schema(
  {
    paypal_payment_id: { type: String, required: true, index: true },
    status: { type: String, required: true },
    payer_email: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, required: true },
    // Agrega aquí otros campos relevantes de PayPal
  },
  { _id: false }
);

// Bank Transfer Info Sub-Schema
const BankTransferInfoSchema = new Schema(
  {
    bank_name: { type: String, required: true },
    account_number: { type: String, required: true },
    cbu: { type: String },
    transaction_id: { type: String, required: true, index: true },
    payer_name: { type: String, required: true },
    payer_email: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, required: true },
    status: { type: String, required: true },
    // Agrega aquí otros campos relevantes de transferencias
  },
  { _id: false }
);

// Cash Info Sub-Schema
const CashInfoSchema = new Schema(
  {
    receipt_number: { type: String, required: true, index: true },
    location: { type: String },
    payer_name: { type: String, required: true },
    payer_email: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, required: true },
    // Agrega aquí otros campos relevantes de pagos en efectivo
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
    paypalInfo: { type: PaypalInfoSchema, required: false },
    mercadoPagoInfo: { type: MercadoPagoInfoSchema, required: false },
    bankTransferInfo: { type: BankTransferInfoSchema, required: false },
    cashInfo: { type: CashInfoSchema, required: false },
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
OrderSchema.index({ 'mercadoPagoInfo.mp_payment_id': 1 });
OrderSchema.index({ 'paypalInfo.paypal_payment_id': 1 });
OrderSchema.index({ 'bankTransferInfo.transaction_id': 1 });
OrderSchema.index({ 'cashInfo.receipt_number': 1 });

// Export the model
export const OrderModel = mongoose.model<IOrderDocument>('Order', OrderSchema);
