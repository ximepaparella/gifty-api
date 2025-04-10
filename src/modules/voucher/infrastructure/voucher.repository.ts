import { IVoucher, IVoucherInput, IVoucherRepository } from '../domain/voucher.interface';
import VoucherModel, { IVoucherDocument } from './voucher.model';
import { ErrorTypes } from '@shared/types/appError';
import logger from '@shared/infrastructure/logging/logger';
import { Model } from 'mongoose';

interface ValidationError extends Error {
  name: 'ValidationError';
  errors: Record<string, { message: string }>;
}

export class VoucherRepository implements IVoucherRepository {
  private voucherModel: Model<IVoucherDocument>;

  constructor() {
    this.voucherModel = VoucherModel;
  }

  async findAll(): Promise<IVoucher[]> {
    return this.voucherModel.find().lean();
  }

  async findById(id: string): Promise<IVoucher | null> {
    return this.voucherModel.findById(id);
  }

  async findByCode(code: string): Promise<IVoucher | null> {
    return this.voucherModel.findOne({ code });
  }

  async findByStoreId(storeId: string): Promise<IVoucher[]> {
    return this.voucherModel.find({ storeId }).lean();
  }

  async findByCustomerEmail(email: string): Promise<IVoucher[]> {
    return this.voucherModel.find({ 'customer.email': email }).lean();
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
          logger.warn(
            `QR code is very large (${voucherData.qrCode.length} chars), truncating to 1MB`
          );
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

      return await savedVoucher.toObject();
    } catch (error: unknown) {
      logger.error('Error creating voucher:', error);
      if (error instanceof Error) {
        throw ErrorTypes.VALIDATION('Invalid voucher data: ' + error.message);
      }
      throw ErrorTypes.VALIDATION('Invalid voucher data');
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
          logger.warn(
            `QR code is very large (${voucherData.qrCode.length} chars), truncating to 1MB`
          );
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
        throw ErrorTypes.NOT_FOUND('Voucher');
      }

      logger.info(`Voucher ${id} updated successfully`);
      return updatedVoucher;
    } catch (error: unknown) {
      logger.error(`Error updating voucher ${id} in repository:`, error);

      if (error instanceof Error) {
        if (error.name === 'ValidationError' && this.isValidationError(error)) {
          logger.error('Validation error details:', JSON.stringify(error.errors, null, 2));
          throw ErrorTypes.VALIDATION(error.message);
        }
        throw error;
      }
      throw error;
    }
  }

  private isValidationError(error: Error): error is ValidationError {
    return error.name === 'ValidationError' && 'errors' in error;
  }

  async delete(id: string): Promise<boolean> {
    const result = await VoucherModel.deleteOne({ _id: id });
    return result.deletedCount > 0;
  }

  async redeem(code: string): Promise<IVoucher | null> {
    const voucher = await this.findByCode(code);
    if (!voucher) return null;

    return this.update(voucher._id as string, {
      status: 'redeemed',
      isRedeemed: true,
      redeemedAt: new Date(),
    });
  }

  async generateVoucher(input: IVoucherInput): Promise<IVoucher> {
    return this.create(input);
  }
}
