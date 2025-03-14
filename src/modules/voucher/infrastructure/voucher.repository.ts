import { IVoucher, IVoucherInput, IVoucherRepository } from '../domain/voucher.interface';
import VoucherModel from './voucher.model';
import { notFoundError } from '@shared/types/appError';

export class VoucherRepository implements IVoucherRepository {
  async findAll(): Promise<IVoucher[]> {
    return VoucherModel.find().lean();
  }

  async findById(id: string): Promise<IVoucher | null> {
    return VoucherModel.findById(id).lean();
  }

  async findByCode(code: string): Promise<IVoucher | null> {
    return VoucherModel.findOne({ code }).lean();
  }

  async findByStoreId(storeId: string): Promise<IVoucher[]> {
    return VoucherModel.find({ storeId }).lean();
  }

  async findByCustomerEmail(email: string): Promise<IVoucher[]> {
    return VoucherModel.find({ receiver_email: email }).lean();
  }

  async create(voucherData: IVoucherInput): Promise<IVoucher> {
    const voucher = new VoucherModel(voucherData);
    return (await voucher.save()).toObject();
  }

  async update(id: string, voucherData: Partial<IVoucherInput>): Promise<IVoucher | null> {
    const updatedVoucher = await VoucherModel.findByIdAndUpdate(
      id,
      { $set: voucherData },
      { new: true }
    ).lean();

    if (!updatedVoucher) {
      throw notFoundError(`Voucher with id ${id} not found`);
    }

    return updatedVoucher;
  }

  async delete(id: string): Promise<boolean> {
    const result = await VoucherModel.deleteOne({ _id: id });
    return result.deletedCount > 0;
  }

  async redeem(code: string): Promise<IVoucher | null> {
    const voucher = await VoucherModel.findOne({ code, isRedeemed: false });
    
    if (!voucher) {
      throw notFoundError(`Voucher with code ${code} not found or already redeemed`);
    }

    // Check if voucher is expired
    if (new Date(voucher.expirationDate) < new Date()) {
      throw new Error('Voucher has expired');
    }

    voucher.isRedeemed = true;
    voucher.redeemedAt = new Date();
    
    return (await voucher.save()).toObject();
  }
} 