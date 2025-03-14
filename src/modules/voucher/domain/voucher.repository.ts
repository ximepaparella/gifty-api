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
    try {
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
    } catch (error: any) {
      // Check if it's a duplicate key error for the code field
      if (error.name === 'MongoError' || error.name === 'MongoServerError') {
        if (error.code === 11000 && error.keyPattern?.code) {
          // Try again with a new code
          voucherData.code = await this.generateUniqueCode();
          return this.create(voucherData);
        }
      }
      throw error;
    }
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
    const now = new Date();
    
    // Use atomic findOneAndUpdate to prevent race conditions
    const redeemedVoucher = await Voucher.findOneAndUpdate(
      { 
        code, 
        status: 'active',
        expirationDate: { $gte: now }
      },
      { 
        $set: { 
          status: 'redeemed',
          isRedeemed: true,
          redeemedAt: now
        } 
      },
      { 
        new: true // Return the updated document
      }
    );
    
    if (!redeemedVoucher) {
      // Check if the voucher exists but is expired
      const expiredVoucher = await Voucher.findOneAndUpdate(
        { 
          code, 
          status: 'active',
          expirationDate: { $lt: now }
        },
        { 
          $set: { status: 'expired' } 
        },
        { 
          new: true
        }
      );
      
      if (expiredVoucher) {
        return null; // Expired voucher
      }
    }
    
    return redeemedVoucher;
  }

  // Helper method to generate a unique voucher code
  private async generateUniqueCode(): Promise<string> {
    // Maximum number of attempts to generate a unique code
    const MAX_ATTEMPTS = 10;
    let attempts = 0;
    let code = generateRandomCode(10);
    let existingVoucher = await Voucher.findOne({ code });
    
    // Keep generating until we find a unique code or reach max attempts
    while (existingVoucher && attempts < MAX_ATTEMPTS) {
      code = generateRandomCode(10);
      existingVoucher = await Voucher.findOne({ code });
      attempts++;
    }
    
    // If we reached max attempts, add a timestamp to ensure uniqueness
    if (attempts >= MAX_ATTEMPTS) {
      const timestamp = Date.now().toString(36);
      code = code.substring(0, 6) + timestamp;
    }
    
    return code;
  }
} 