import { IVoucher, IVoucherInput, IVoucherRepository } from '../domain/voucher.interface';
import VoucherModel from './voucher.model';
import { notFoundError } from '@shared/types/appError';
import logger from '@shared/infrastructure/logging/logger';

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
    try {
      // Log the fields being passed to the model
      logger.info('Fields being passed to the voucher model:', Object.keys(voucherData).join(', '));
      
      // Check if QR code is present and log its size
      if (voucherData.qrCode) {
        logger.info(`QR code is present, size: ${voucherData.qrCode.length} characters`);
        
        // If the QR code is too large (over 1MB), truncate it
        if (voucherData.qrCode.length > 1000000) {
          logger.warn(`QR code is very large (${voucherData.qrCode.length} chars), truncating to 1MB`);
          voucherData.qrCode = voucherData.qrCode.substring(0, 1000000);
        }
      }
      
      // Check if customerId is present
      if (voucherData.customerId) {
        logger.info(`Customer ID is present: ${voucherData.customerId}`);
      }
      
      const voucher = new VoucherModel(voucherData);
      logger.info('Voucher model created, saving to database');
      
      const savedVoucher = await voucher.save();
      logger.info(`Voucher saved successfully with ID: ${savedVoucher._id}`);
      
      return savedVoucher.toObject();
    } catch (error: any) {
      logger.error('Error creating voucher in repository:', error);
      
      // Provide more context about the error
      if (error.name === 'ValidationError') {
        logger.error('Validation error details:', JSON.stringify(error.errors, null, 2));
      }
      
      throw error;
    }
  }

  async update(id: string, voucherData: Partial<IVoucherInput>): Promise<IVoucher | null> {
    try {
      // Log the fields being updated
      logger.info(`Updating voucher ${id} with fields:`, Object.keys(voucherData).join(', '));
      
      // Check if QR code is present and log its size
      if (voucherData.qrCode) {
        logger.info(`QR code is present in update, size: ${voucherData.qrCode.length} characters`);
        
        // If the QR code is too large (over 1MB), truncate it
        if (voucherData.qrCode.length > 1000000) {
          logger.warn(`QR code is very large (${voucherData.qrCode.length} chars), truncating to 1MB`);
          voucherData.qrCode = voucherData.qrCode.substring(0, 1000000);
        }
      }
      
      // Check if customerId is present
      if (voucherData.customerId) {
        logger.info(`Customer ID is present in update: ${voucherData.customerId}`);
      }
      
      const updatedVoucher = await VoucherModel.findByIdAndUpdate(
        id,
        { $set: voucherData },
        { new: true }
      ).lean();

      if (!updatedVoucher) {
        throw notFoundError(`Voucher with id ${id} not found`);
      }

      logger.info(`Voucher ${id} updated successfully`);
      return updatedVoucher;
    } catch (error: any) {
      logger.error(`Error updating voucher ${id} in repository:`, error);
      
      // Provide more context about the error
      if (error.name === 'ValidationError') {
        logger.error('Validation error details:', JSON.stringify(error.errors, null, 2));
      }
      
      throw error;
    }
  }

  async delete(id: string): Promise<boolean> {
    const result = await VoucherModel.deleteOne({ _id: id });
    return result.deletedCount > 0;
  }

  async redeem(code: string): Promise<IVoucher | null> {
    try {
      logger.info(`Attempting to redeem voucher with code: ${code}`);
      
      // Use atomic findOneAndUpdate to prevent race conditions
      const now = new Date();
      const redeemedVoucher = await VoucherModel.findOneAndUpdate(
        { 
          code, 
          isRedeemed: false,
          expirationDate: { $gte: now }
        },
        { 
          $set: { 
            isRedeemed: true, 
            redeemedAt: now, 
            status: 'redeemed' 
          } 
        },
        { 
          new: true, // Return the updated document
          runValidators: true // Run model validators
        }
      ).lean();

      if (!redeemedVoucher) {
        // Check if the voucher exists but is already redeemed or expired
        const existingVoucher = await VoucherModel.findOne({ code }).lean();
        
        if (!existingVoucher) {
          throw notFoundError(`Voucher with code ${code} not found`);
        }
        
        if (existingVoucher.isRedeemed) {
          throw new Error(`Voucher with code ${code} has already been redeemed`);
        }
        
        if (new Date(existingVoucher.expirationDate) < now) {
          throw new Error(`Voucher with code ${code} has expired`);
        }
        
        throw new Error(`Unable to redeem voucher with code ${code}`);
      }

      logger.info(`Voucher with code ${code} redeemed successfully`);
      return redeemedVoucher;
    } catch (error: any) {
      logger.error(`Error redeeming voucher with code ${code}:`, error);
      throw error;
    }
  }
} 