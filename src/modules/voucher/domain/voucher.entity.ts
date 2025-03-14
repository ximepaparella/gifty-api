import mongoose from 'mongoose';

export interface IVoucher {
  _id?: string;
  storeId: mongoose.Types.ObjectId | string;
  productId: mongoose.Types.ObjectId | string;
  customerId: mongoose.Types.ObjectId | string | null;
  amount: number;
  code: string;
  status: 'active' | 'redeemed' | 'expired';
  isRedeemed: boolean;
  redeemedAt?: Date | null;
  expirationDate: Date;
  qrCode: string;
  sender_name: string;
  sender_email: string;
  receiver_name: string;
  receiver_email: string;
  message: string;
  template: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IVoucherInput {
  storeId: string;
  productId: string;
  customerId?: string | null;
  amount: number;
  code?: string;
  status?: 'active' | 'redeemed' | 'expired';
  isRedeemed?: boolean;
  redeemedAt?: Date | null;
  expirationDate: Date;
  qrCode?: string;
  sender_name: string;
  sender_email: string;
  receiver_name: string;
  receiver_email: string;
  message: string;
  template?: string;
}

export interface IVoucherRepository {
  findAll(): Promise<IVoucher[]>;
  findById(id: string): Promise<IVoucher | null>;
  findByCode(code: string): Promise<IVoucher | null>;
  findByStoreId(storeId: string): Promise<IVoucher[]>;
  findByCustomerId(customerId: string): Promise<IVoucher[]>;
  create(voucher: IVoucherInput): Promise<IVoucher>;
  update(id: string, voucher: Partial<IVoucherInput>): Promise<IVoucher | null>;
  delete(id: string): Promise<IVoucher | null>;
  redeemVoucher(code: string): Promise<IVoucher | null>;
} 