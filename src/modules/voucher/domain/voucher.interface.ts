import { Types } from 'mongoose';

export interface IVoucher {
  _id?: string;
  code: string;
  storeId: string | Types.ObjectId;
  productId: string | Types.ObjectId;
  customerId?: string | Types.ObjectId;
  amount: number;
  expirationDate: Date;
  isRedeemed: boolean;
  redeemedAt?: Date;
  status?: string;
  qrCode?: string;
  sender_name: string;
  sender_email: string;
  receiver_name: string;
  receiver_email: string;
  message: string;
  template: 'birthday' | 'christmas' | 'valentine' | 'general' | 'template1';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IVoucherInput {
  storeId: string;
  productId: string;
  customerId?: string;
  code?: string;
  status?: string;
  amount: number;
  expirationDate: Date;
  qrCode?: string;
  sender_name: string;
  sender_email: string;
  receiver_name: string;
  receiver_email: string;
  message: string;
  template: 'birthday' | 'christmas' | 'valentine' | 'general' | 'template1';
}

export interface IVoucherRepository {
  findAll(): Promise<IVoucher[]>;
  findById(id: string): Promise<IVoucher | null>;
  findByCode(code: string): Promise<IVoucher | null>;
  findByStoreId(storeId: string): Promise<IVoucher[]>;
  findByCustomerEmail(email: string): Promise<IVoucher[]>;
  create(voucher: IVoucherInput): Promise<IVoucher>;
  update(id: string, voucher: Partial<IVoucherInput>): Promise<IVoucher | null>;
  delete(id: string): Promise<boolean>;
  redeem(code: string): Promise<IVoucher | null>;
} 