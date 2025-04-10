import { IVoucher, IVoucherInput, IVoucherRepository } from '../domain/voucher.interface';
import { notFoundError, validationError } from '@shared/types/appError';
import { validateVoucher } from './voucher.validator';
import logger from '@shared/infrastructure/logging/logger';

export class VoucherService {
  constructor(private voucherRepository: IVoucherRepository) {}

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
      throw notFoundError(`Voucher with ID ${id} not found`);
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
      throw notFoundError(`Voucher with code ${code} not found`);
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
        const error = validationError('Invalid voucher data');
        (error as any).details = validationErrors;
        throw error;
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
      logger.error('Error in createVoucher service:', error);

      // Add more context to the error
      if (error.name === 'ValidationError' && error.errors) {
        // Mongoose validation error
        const validationErrors = Object.keys(error.errors).map((field) => ({
          field,
          message: error.errors[field].message,
        }));

        const enhancedError = validationError('Mongoose validation failed');
        (enhancedError as any).details = validationErrors;
        throw enhancedError;
      }

      // Re-throw the error with additional context
      if (!error.isOperational) {
        const wrappedError = new Error(`Error creating voucher: ${error.message}`);
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
   * Update an existing voucher
   */
  async updateVoucher(id: string, voucherData: Partial<IVoucherInput>): Promise<IVoucher> {
    try {
      logger.info(`Updating voucher with ID ${id}`);

      // Check if voucher exists
      const existingVoucher = await this.voucherRepository.findById(id);
      if (!existingVoucher) {
        throw notFoundError(`Voucher with ID ${id} not found`);
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
        throw notFoundError(`Failed to update voucher with ID ${id}`);
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

        const enhancedError = validationError('Mongoose validation failed');
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
  async deleteVoucher(id: string): Promise<boolean> {
    logger.info(`Deleting voucher with ID ${id}`);

    // Check if voucher exists
    const existingVoucher = await this.voucherRepository.findById(id);
    if (!existingVoucher) {
      throw notFoundError(`Voucher with ID ${id} not found`);
    }

    const result = await this.voucherRepository.delete(id);
    if (!result) {
      throw notFoundError(`Failed to delete voucher with ID ${id}`);
    }

    return result;
  }

  /**
   * Redeem a voucher by code
   */
  async redeemVoucher(code: string): Promise<IVoucher> {
    logger.info(`Redeeming voucher with code ${code}`);

    const redeemedVoucher = await this.voucherRepository.redeem(code);
    if (!redeemedVoucher) {
      throw notFoundError(`Voucher with code ${code} not found, already redeemed, or expired`);
    }

    return redeemedVoucher;
  }

  async generateVoucher(data: IVoucherInput): Promise<IVoucher> {
    return this.voucherRepository.generateVoucher(data);
  }
}
