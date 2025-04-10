import { IVoucher, IVoucherInput } from '../domain/voucher.interface';
import { AppError, ErrorTypes } from '@shared/types/appError';
import { validateVoucher } from './voucher.validator';
import logger from '@shared/infrastructure/logging/logger';
import { VoucherRepository } from '../infrastructure/voucher.repository';

export class VoucherService {
  constructor(private voucherRepository: VoucherRepository) {}

  /**
   * Get all vouchers
   */
  async getAllVouchers(): Promise<IVoucher[]> {
    logger.info('Getting all vouchers');
    return this.voucherRepository.findAll();
  }

  /**
   * Get voucher by ID
   */
  async getVoucherById(id: string): Promise<IVoucher> {
    logger.info(`Getting voucher with ID ${id}`);
    const voucher = await this.voucherRepository.findById(id);
    if (!voucher) {
      throw ErrorTypes.NOT_FOUND('Voucher');
    }
    return voucher;
  }

  /**
   * Get voucher by code
   */
  async getVoucherByCode(code: string): Promise<IVoucher> {
    logger.info(`Getting voucher with code ${code}`);
    const voucher = await this.voucherRepository.findByCode(code);
    if (!voucher) {
      throw ErrorTypes.NOT_FOUND('Voucher');
    }
    return voucher;
  }

  /**
   * Get vouchers by store ID
   */
  async getVouchersByStoreId(storeId: string): Promise<IVoucher[]> {
    logger.info(`Getting vouchers for store ${storeId}`);
    return this.voucherRepository.findByStoreId(storeId);
  }

  /**
   * Get vouchers by customer email
   */
  async getVouchersByCustomerEmail(email: string): Promise<IVoucher[]> {
    logger.info(`Getting vouchers for customer ${email}`);
    return this.voucherRepository.findByCustomerEmail(email);
  }

  /**
   * Create a new voucher
   */
  async createVoucher(voucherData: IVoucherInput): Promise<IVoucher> {
    try {
      logger.info('Validating voucher data');

      const validationErrors = validateVoucher(voucherData);
      if (validationErrors.length > 0) {
        throw ErrorTypes.VALIDATION(validationErrors.join(', '));
      }

      // Create a safe copy of the data to log (without the full QR code)
      const safeDataForLogging = { ...voucherData };
      if (safeDataForLogging.qrCode) {
        safeDataForLogging.qrCode = `${safeDataForLogging.qrCode.substring(0, 30)}... (length: ${safeDataForLogging.qrCode.length})`;
      }
      logger.info('Creating voucher with data:', JSON.stringify(safeDataForLogging, null, 2));

      // Check if QR code or customerId is present
      logger.info(
        `QR Code provided: ${Boolean(voucherData.qrCode)}, CustomerId provided: ${Boolean(voucherData.customerId)}`
      );

      return await this.voucherRepository.create(voucherData);
    } catch (error: any) {
      logger.error('Error creating voucher:', error);

      // Handle mongoose validation errors
      if (error.name === 'ValidationError' && error.errors) {
        const validationErrors = Object.keys(error.errors).map((field) => ({
          field,
          message: error.errors[field].message,
        }));
        throw ErrorTypes.VALIDATION(
          `Validation failed: ${validationErrors.map((e) => `${e.field}: ${e.message}`).join(', ')}`
        );
      }

      // Re-throw AppError instances
      if (error instanceof AppError) {
        throw error;
      }

      throw ErrorTypes.INTERNAL(`Error creating voucher: ${error.message}`);
    }
  }

  /**
   * Update an existing voucher
   */
  async updateVoucher(id: string, voucherData: Partial<IVoucherInput>): Promise<IVoucher> {
    try {
      logger.info(`Updating voucher with ID ${id}`);

      // Check if voucher exists
      const existingVoucher = await this.voucherRepository.findById(id);
      if (!existingVoucher) {
        throw ErrorTypes.NOT_FOUND('Voucher');
      }

      // Create a safe copy of the data to log (without the full QR code)
      const safeDataForLogging = { ...voucherData };
      if (safeDataForLogging.qrCode) {
        safeDataForLogging.qrCode = `${safeDataForLogging.qrCode.substring(0, 30)}... (length: ${safeDataForLogging.qrCode.length})`;
      }
      logger.info('Updating voucher with data:', JSON.stringify(safeDataForLogging, null, 2));

      // Check if QR code or customerId is present
      logger.info(
        `QR Code provided: ${Boolean(voucherData.qrCode)}, CustomerId provided: ${Boolean(voucherData.customerId)}`
      );

      const updatedVoucher = await this.voucherRepository.update(id, voucherData);
      if (!updatedVoucher) {
        throw ErrorTypes.INTERNAL('Failed to update voucher');
      }

      return updatedVoucher;
    } catch (error: any) {
      logger.error(`Error in updateVoucher service for ID ${id}:`, error);

      // Add more context to the error
      if (error.name === 'ValidationError' && error.errors) {
        // Mongoose validation error
        const validationErrors = Object.keys(error.errors).map((field) => ({
          field,
          message: error.errors[field].message,
        }));

        const enhancedError = ErrorTypes.VALIDATION('Mongoose validation failed');
        (enhancedError as any).details = validationErrors;
        throw enhancedError;
      }

      // Re-throw the error with additional context
      if (!error.isOperational) {
        const wrappedError = new Error(`Error updating voucher: ${error.message}`);
        (wrappedError as any).originalError = error;
        (wrappedError as any).receivedData = {
          hasQrCode: Boolean(voucherData.qrCode),
          hasCustomerId: Boolean(voucherData.customerId),
          fields: Object.keys(voucherData),
        };
        throw wrappedError;
      }

      throw error;
    }
  }

  /**
   * Delete a voucher
   */
  async deleteVoucher(id: string): Promise<IVoucher> {
    logger.info(`Deleting voucher with ID ${id}`);

    // Check if voucher exists
    const existingVoucher = await this.voucherRepository.findById(id);
    if (!existingVoucher) {
      throw ErrorTypes.NOT_FOUND('Voucher');
    }

    const deletedVoucher = await this.voucherRepository.delete(id);
    if (!deletedVoucher) {
      throw ErrorTypes.INTERNAL('Failed to delete voucher');
    }

    return deletedVoucher;
  }

  /**
   * Redeem a voucher by code
   */
  async redeemVoucher(code: string): Promise<IVoucher> {
    logger.info(`Redeeming voucher with code ${code}`);

    const voucher = await this.voucherRepository.redeem(code);
    if (!voucher) {
      throw ErrorTypes.NOT_FOUND('Voucher not found, already redeemed, or expired');
    }

    return voucher;
  }

  async generateVoucher(data: IVoucherInput): Promise<IVoucher> {
    return this.voucherRepository.generateVoucher(data);
  }
}
