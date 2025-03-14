import mongoose from 'mongoose';
import { IVoucher, IVoucherInput, IVoucherRepository } from './voucher.entity';
import { Voucher } from './voucher.schema';
import { generateRandomCode } from '@shared/utils/codeGenerator';
import { generateQRCode } from '@shared/utils/qrCodeGenerator';

export class VoucherRepository implements IVoucherRepository {
  async findAll(): Promise<IVoucher[]> {
    return await Voucher.find().sort({ createdAt: -1 });
  }

  async findById(id: string): Promise<IVoucher | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    return await Voucher.findById(id);
  }

  async findByCode(code: string): Promise<IVoucher | null> {
    return await Voucher.findOne({ code });
  }

  async findByStoreId(storeId: string): Promise<IVoucher[]> {
    if (!mongoose.Types.ObjectId.isValid(storeId)) {
      return [];
    }
    return await Voucher.find({ storeId }).sort({ createdAt: -1 });
  }

  async findByCustomerId(customerId: string): Promise<IVoucher[]> {
    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      return [];
    }
    return await Voucher.find({ customerId }).sort({ createdAt: -1 });
  }

  async create(voucherData: IVoucherInput): Promise<IVoucher> {
    // Generate a unique code if not provided
    if (!voucherData.code) {
      voucherData.code = await this.generateUniqueCode();
    }

    // Generate QR code if not provided
    if (!voucherData.qrCode) {
      voucherData.qrCode = await generateQRCode(voucherData.code);
    }

    const voucher = new Voucher(voucherData);
    return await voucher.save();
  }

  async update(id: string, voucherData: Partial<IVoucherInput>): Promise<IVoucher | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    return await Voucher.findByIdAndUpdate(
      id,
      { $set: voucherData },
      { new: true, runValidators: true }
    );
  }

  async delete(id: string): Promise<IVoucher | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    return await Voucher.findByIdAndDelete(id);
  }

  async redeemVoucher(code: string): Promise<IVoucher | null> {
    const voucher = await Voucher.findOne({ code, status: 'active' });
    
    if (!voucher) {
      return null;
    }

    // Check if voucher is expired
    if (new Date(voucher.expirationDate) < new Date()) {
      voucher.status = 'expired';
      await voucher.save();
      return null;
    }

    // Mark as redeemed
    voucher.status = 'redeemed';
    return await voucher.save();
  }

  // Helper method to generate a unique voucher code
  private async generateUniqueCode(): Promise<string> {
    let code = generateRandomCode(10);
    let existingVoucher = await Voucher.findOne({ code });
    
    // Keep generating until we find a unique code
    while (existingVoucher) {
      code = generateRandomCode(10);
      existingVoucher = await Voucher.findOne({ code });
    }
    
    return code;
  }
} 