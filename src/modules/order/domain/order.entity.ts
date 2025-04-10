import mongoose from 'mongoose';
import { ICustomer } from '@modules/customer/domain/customer.entity'; // Import Customer
import { IVoucher } from '@modules/voucher/domain/voucher.entity';
import { PaymentDetails, IPaymentDetails } from './order.interface'; // Corrected import for PaymentDetails
import { Types } from 'mongoose';

export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export interface IOrder {
  _id?: mongoose.Types.ObjectId;
  // userId?: mongoose.Types.ObjectId | null; // Removed userId
  customerId: mongoose.Types.ObjectId | ICustomer; // Added customerId (required)
  paymentDetails: IPaymentDetails; // Use IPaymentDetails type
  voucher: mongoose.Types.ObjectId | IVoucher; // Link to the generated voucher
  status: OrderStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Order implements IOrder {
  _id?: Types.ObjectId;
  // userId?: mongoose.Types.ObjectId | null;
  customerId: string | Types.ObjectId;
  voucher: any; // TODO: Add proper voucher type
  paymentDetails: IPaymentDetails;
  emailsSent: boolean;
  pdfGenerated: boolean;
  pdfUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(data: IOrder) {
    this._id = data._id;
    // this.userId = data.userId;
    this.customerId = data.customerId;
    this.voucher = data.voucher;
    this.paymentDetails = data.paymentDetails;
    this.emailsSent = data.emailsSent;
    this.pdfGenerated = data.pdfGenerated;
    this.pdfUrl = data.pdfUrl;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}
