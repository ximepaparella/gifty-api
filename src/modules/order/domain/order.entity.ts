import mongoose from 'mongoose';
import { ICustomer } from '@modules/customer/domain/customer.entity'; // Import Customer
import { IVoucher } from '@modules/voucher/domain/voucher.entity';
import { PaymentDetails } from './order.interface'; // Corrected import for PaymentDetails

export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export interface IOrder {
  _id?: mongoose.Types.ObjectId;
  // userId?: mongoose.Types.ObjectId | null; // Removed userId
  customerId: mongoose.Types.ObjectId | ICustomer; // Added customerId (required)
  paymentDetails: PaymentDetails; // Use PaymentDetails type
  voucher: mongoose.Types.ObjectId | IVoucher; // Link to the generated voucher
  status: OrderStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Order implements IOrder {
  _id?: mongoose.Types.ObjectId;
  // userId?: mongoose.Types.ObjectId | null;
  customerId: mongoose.Types.ObjectId | ICustomer;
  paymentDetails: PaymentDetails;
  voucher: mongoose.Types.ObjectId | IVoucher;
  status: OrderStatus;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(order: IOrder) {
    this._id = order._id;
    // this.userId = order.userId;
    this.customerId = order.customerId;
    this.paymentDetails = order.paymentDetails;
    this.voucher = order.voucher;
    this.status = order.status;
    this.createdAt = order.createdAt;
    this.updatedAt = order.updatedAt;
  }
} 