import { Types } from 'mongoose';

export interface IVoucher {
  _id?: string;
  code: string;
  storeId: string | Types.ObjectId;
  productId: string | Types.ObjectId;
  amount: number;
  expirationDate: Date;
  isRedeemed: boolean;
  redeemedAt?: Date;
  sender_name: string;
  sender_email: string;
  receiver_name: string;
  receiver_email: string;
  message: string;
  template: 'template1' | 'template2' | 'template3' | 'template4';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IVoucherInput {
  storeId: string;
  productId: string;
  amount: number;
  expirationDate: Date;
  sender_name: string;
  sender_email: string;
  receiver_name: string;
  receiver_email: string;
  message: string;
  template: 'template1' | 'template2' | 'template3' | 'template4';
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