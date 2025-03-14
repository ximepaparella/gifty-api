import mongoose from 'mongoose';

export interface PaymentDetails {
  paymentId: string;
  paymentStatus: 'pending' | 'completed' | 'failed';
  paymentEmail: string;
  amount: number;
  provider: 'mercadopago' | 'paypal' | 'stripe';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface VoucherDetails {
  storeId: string | mongoose.Types.ObjectId;
  productId: string | mongoose.Types.ObjectId;
  code: string;
  status: 'active' | 'redeemed' | 'expired';
  expirationDate: Date;
  qrCode: string;
  senderName: string;
  senderEmail: string;
  receiverName: string;
  receiverEmail: string;
  message: string;
  template: 'template1' | 'template2' | 'template3' | 'template4' | 'template5' ;
  redeemedAt?: Date;
}

export interface IOrder {
  _id?: mongoose.Types.ObjectId;
  customerId: mongoose.Types.ObjectId | string;
  paymentDetails: {
    paymentId: string;
    paymentStatus: 'pending' | 'completed' | 'failed';
    paymentEmail: string;
    amount: number;
    provider: 'mercadopago' | 'paypal' | 'stripe';
    createdAt?: Date;
    updatedAt?: Date;
  };
  voucher: {
    storeId: mongoose.Types.ObjectId | string;
    productId: mongoose.Types.ObjectId | string;
    code: string;
    status: 'active' | 'redeemed' | 'expired';
    isRedeemed: boolean;
    redeemedAt: Date | null;
    expirationDate: Date;
    qrCode?: string;
    senderName: string;
    senderEmail: string;
    receiverName: string;
    receiverEmail: string;
    message: string;
    template: 'template1' | 'template2' | 'template3' | 'template4' | 'template5';
  };
  emailsSent: boolean;
  pdfGenerated: boolean;
  pdfUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IOrderInput {
  customerId: string;
  paymentDetails: {
    paymentId: string;
    paymentStatus: 'pending' | 'completed' | 'failed';
    paymentEmail: string;
    amount: number;
    provider: 'mercadopago' | 'paypal' | 'stripe';
  };
  voucher: {
    storeId: string;
    productId: string;
    code?: string;
    expirationDate: Date;
    senderName: string;
    senderEmail: string;
    receiverName: string;
    receiverEmail: string;
    message: string;
    template: 'template1' | 'template2' | 'template3' | 'template4' | 'template5';
  };
}

export interface IOrderRepository {
  findAll(): Promise<IOrder[]>;
  findById(id: string): Promise<IOrder | null>;
  findByCustomerId(customerId: string): Promise<IOrder[]>;
  findByVoucherCode(code: string): Promise<IOrder | null>;
  create(order: IOrderInput): Promise<IOrder>;
  update(id: string, order: Partial<IOrderInput>): Promise<IOrder | null>;
  delete(id: string): Promise<boolean>;
  updateEmailSentStatus(id: string, status: boolean): Promise<IOrder | null>;
  updatePdfGeneratedStatus(id: string, status: boolean): Promise<IOrder | null>;
  updatePdfUrl(id: string, pdfUrl: string): Promise<IOrder | null>;
  redeemVoucher(voucherCode: string): Promise<IOrder | null>;
} 