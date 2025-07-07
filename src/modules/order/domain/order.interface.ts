import { Types } from 'mongoose';

export interface IPaymentDetails {
  paymentId: string;
  status: 'pending' | 'completed' | 'failed';
  paymentEmail: string;
  amount: number;
  provider: 'mercadopago' | 'paypal' | 'bank_transfer' | 'cash' | 'stripe';
  currency?: string;
  paymentMethod?: string;
  transactionId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface VoucherDetails {
  storeId: string | Types.ObjectId;
  productId: string | Types.ObjectId;
  code: string;
  status: 'active' | 'redeemed' | 'expired';
  expirationDate: Date;
  qrCode: string;
  senderName: string;
  senderEmail: string;
  receiverName: string;
  receiverEmail: string;
  message: string;
  template: 'template1' | 'template2' | 'template3' | 'template4' | 'template5';
  redeemedAt?: Date;
}

export interface IVoucher {
  storeId: string | Types.ObjectId;
  productId: string | Types.ObjectId;
  code: string;
  status: 'active' | 'redeemed' | 'expired';
  isRedeemed: boolean;
  redeemedAt: Date | null;
  senderName: string;
  senderEmail: string;
  receiverName: string;
  receiverEmail: string;
  message?: string;
  qrCode?: string;
  amount: number;
  expirationDate: Date;
  template: 'template1' | 'template2' | 'template3' | 'template4' | 'template5';
}

export interface IMercadoPagoInfo {
  mp_payment_id: string;
  status: string;
  status_detail: string;
  payment_method_id: string;
  transaction_amount: number;
  installments: number;
  payer_email: string;
}

export interface IPaypalInfo {
  paypal_payment_id: string;
  status: string;
  payer_email: string;
  amount: number;
  currency: string;
  // Agrega aquí otros campos relevantes de PayPal
}

export interface IBankTransferInfo {
  bank_name: string;
  account_number: string;
  cbu?: string;
  transaction_id: string;
  payer_name: string;
  payer_email: string;
  amount: number;
  currency: string;
}

export interface ICashInfo {
  receipt_number: string;
  location?: string;
  payer_name: string;
  payer_email: string;
  amount: number;
  currency: string;
}

export interface IPaymentInfo {
  mp_payment_id: string;
  status: string;
  status_detail: string;
  payment_method_id: string;
  transaction_amount: number;
  installments: number;
  payer_email: string;
}

export interface IOrder {
  _id?: Types.ObjectId;
  customerId: string | Types.ObjectId;
  voucher: IVoucher;
  paymentDetails: IPaymentDetails;
  mercadoPagoInfo?: IMercadoPagoInfo;
  paypalInfo?: IPaypalInfo;
  bankTransferInfo?: IBankTransferInfo;
  cashInfo?: ICashInfo;
  emailsSent: boolean;
  pdfGenerated: boolean;
  pdfUrl?: string;
  paymentInfo?: IPaymentInfo;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IOrderInput {
  customerId: string;
  voucher: Omit<IVoucher, 'status' | 'isRedeemed' | 'redeemedAt' | 'qrCode'>;
  paymentDetails: Omit<IPaymentDetails, 'status' | 'createdAt' | 'updatedAt'>;
  pdfUrl?: string;
  pdfGenerated?: boolean;
}

export interface IOrderRepository {
  create(order: IOrderInput): Promise<IOrder>;
  findAll(): Promise<IOrder[]>;
  findById(id: string): Promise<IOrder | null>;
  findByCustomerId(customerId: string): Promise<IOrder[]>;
  findByVoucherCode(code: string): Promise<IOrder | null>;
  update(id: string, order: Partial<IOrderInput>): Promise<IOrder | null>;
  delete(id: string): Promise<boolean>;
}
