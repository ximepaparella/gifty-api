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
    logger.info('Creating new voucher');
    
    const validationErrors = validateVoucher(voucherData);
    if (validationErrors.length > 0) {
      throw validationError('Invalid voucher data');
    }
    
    return this.voucherRepository.create(voucherData);
  }

  /**
   * Update an existing voucher
   */
  async updateVoucher(id: string, voucherData: Partial<IVoucherInput>): Promise<IVoucher> {
    logger.info(`Updating voucher with ID ${id}`);
    
    // Check if voucher exists
    const existingVoucher = await this.voucherRepository.findById(id);
    if (!existingVoucher) {
      throw notFoundError(`Voucher with ID ${id} not found`);
    }
    
    const updatedVoucher = await this.voucherRepository.update(id, voucherData);
    if (!updatedVoucher) {
      throw notFoundError(`Failed to update voucher with ID ${id}`);
    }
    
    return updatedVoucher;
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
} 