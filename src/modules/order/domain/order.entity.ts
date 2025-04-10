import { Types } from 'mongoose';
import { ICustomer } from '@modules/customer/domain/customer.entity';
import { IVoucher } from '@modules/voucher/domain/voucher.entity';
import { IPaymentDetails } from './order.interface';

export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export interface IOrder {
  _id?: Types.ObjectId;
  customerId: Types.ObjectId | ICustomer;
  paymentDetails: IPaymentDetails;
  voucher: Types.ObjectId | IVoucher;
  status: OrderStatus;
  emailsSent: boolean;
  pdfGenerated: boolean;
  pdfUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Order implements IOrder {
  _id?: Types.ObjectId;
  customerId: Types.ObjectId | ICustomer;
  voucher: Types.ObjectId | IVoucher;
  paymentDetails: IPaymentDetails;
  status: OrderStatus;
  emailsSent: boolean;
  pdfGenerated: boolean;
  pdfUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(data: IOrder) {
    this._id = data._id;
    this.customerId = data.customerId;
    this.voucher = data.voucher;
    this.paymentDetails = data.paymentDetails;
    this.status = data.status;
    this.emailsSent = data.emailsSent;
    this.pdfGenerated = data.pdfGenerated;
    this.pdfUrl = data.pdfUrl;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}
