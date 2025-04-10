import { Types } from 'mongoose';

export interface IVoucher {
  _id?: string;
  code: string;
  storeId: string | Types.ObjectId;
  productId: string | Types.ObjectId;
  customerId?: string | Types.ObjectId;
  amount: number;
  expirationDate: Date;
  status: 'active' | 'redeemed' | 'expired';
  isRedeemed: boolean;
  redeemedAt?: Date | null;
  qrCode?: string;
  senderName: string;
  senderEmail: string;
  receiverName: string;
  receiverEmail: string;
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
  status?: 'active' | 'redeemed' | 'expired';
  isRedeemed?: boolean;
  redeemedAt?: Date | null;
  amount: number;
  expirationDate: Date;
  qrCode?: string;
  senderName: string;
  senderEmail: string;
  receiverName: string;
  receiverEmail: string;
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
  generateVoucher(input: IVoucherInput): Promise<IVoucher>;
}
