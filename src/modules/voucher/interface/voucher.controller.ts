import { Request, Response, NextFunction } from 'express';
import { VoucherService } from '../application/voucher.service';
import { IVoucherInput } from '../domain/voucher.interface';
import { logger } from '@shared/infrastructure/logging/logger';
import { ErrorTypes } from '@shared/types/appError';

export class VoucherController {
  constructor(private voucherService: VoucherService) {}

  /**
   * Get all vouchers
   */
  getAllVouchers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const vouchers = await this.voucherService.getAllVouchers();
      res.status(200).json({
        success: true,
        data: vouchers,
      });
    } catch (error) {
      logger.error('Error getting all vouchers:', error);
      next(error);
    }
  };

  /**
   * Get voucher by ID
   */
  getVoucherById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const voucher = await this.voucherService.getVoucherById(id);

      if (!voucher) {
        return next(ErrorTypes.NOT_FOUND('Voucher'));
      }

      res.status(200).json({
        success: true,
        data: voucher,
      });
    } catch (error) {
      logger.error('Error getting voucher by ID:', error);
      next(error);
    }
  };

  /**
   * Get voucher by code
   */
  getVoucherByCode = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { code } = req.params;
      const voucher = await this.voucherService.getVoucherByCode(code);

      if (!voucher) {
        return next(ErrorTypes.NOT_FOUND('Voucher'));
      }

      res.status(200).json({
        success: true,
        data: voucher,
      });
    } catch (error) {
      logger.error('Error getting voucher by code:', error);
      next(error);
    }
  };

  /**
   * Get vouchers by store ID
   */
  getVouchersByStoreId = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { storeId } = req.params;
      const vouchers = await this.voucherService.getVouchersByStoreId(storeId);
      res.status(200).json({
        success: true,
        data: vouchers,
      });
    } catch (error) {
      logger.error('Error getting vouchers by store ID:', error);
      next(error);
    }
  };

  /**
   * Get vouchers by customer email
   */
  getVouchersByCustomerEmail = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.params;
      const vouchers = await this.voucherService.getVouchersByCustomerEmail(email);
      res.status(200).json({
        success: true,
        data: vouchers,
      });
    } catch (error) {
      logger.error('Error getting vouchers by customer email:', error);
      next(error);
    }
  };

  /**
   * Create a new voucher
   */
  createVoucher = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const voucherData: IVoucherInput = req.body;

      if (!voucherData.storeId || !voucherData.productId) {
        return next(ErrorTypes.VALIDATION('Store ID and Product ID are required'));
      }

      if (voucherData.qrCode && voucherData.qrCode.length > 1000) {
        return next(ErrorTypes.VALIDATION('QR code size exceeds maximum limit'));
      }

      const newVoucher = await this.voucherService.createVoucher(voucherData);
      if (!newVoucher) {
        return next(ErrorTypes.INTERNAL('Failed to create voucher'));
      }

      res.status(201).json({
        success: true,
        data: newVoucher,
      });
    } catch (error) {
      logger.error('Error creating voucher:', error);
      next(error);
    }
  };

  /**
   * Update an existing voucher
   */
  updateVoucher = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const voucherData: Partial<IVoucherInput> = req.body;

      logger.info(`Updating voucher ${id} with data:`, JSON.stringify(voucherData, null, 2));

      if (voucherData.qrCode && voucherData.qrCode.length > 1000) {
        return next(ErrorTypes.VALIDATION('QR code size exceeds maximum limit'));
      }

      const existingVoucher = await this.voucherService.getVoucherById(id);
      if (!existingVoucher) {
        return next(ErrorTypes.NOT_FOUND('Voucher'));
      }

      const updatedVoucher = await this.voucherService.updateVoucher(id, voucherData);
      if (!updatedVoucher) {
        return next(ErrorTypes.INTERNAL('Failed to update voucher'));
      }

      res.status(200).json({
        success: true,
        data: updatedVoucher,
      });
    } catch (error) {
      logger.error(`Error updating voucher ${req.params.id}:`, error);
      next(error);
    }
  };

  /**
   * Delete a voucher
   */
  deleteVoucher = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const existingVoucher = await this.voucherService.getVoucherById(id);
      if (!existingVoucher) {
        return next(ErrorTypes.NOT_FOUND('Voucher'));
      }

      const result = await this.voucherService.deleteVoucher(id);
      if (!result) {
        return next(ErrorTypes.INTERNAL('Failed to delete voucher'));
      }

      res.status(200).json({
        success: true,
        message: 'Voucher deleted successfully',
      });
    } catch (error) {
      logger.error('Error deleting voucher:', error);
      next(error);
    }
  };

  /**
   * Redeem a voucher by code
   */
  redeemVoucher = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { code } = req.params;

      const voucher = await this.voucherService.getVoucherByCode(code);
      if (!voucher) {
        return next(ErrorTypes.NOT_FOUND('Voucher'));
      }

      if (voucher.isRedeemed) {
        return next(ErrorTypes.BAD_REQUEST('Voucher has already been redeemed'));
      }

      const redeemedVoucher = await this.voucherService.redeemVoucher(code);
      if (!redeemedVoucher) {
        return next(ErrorTypes.INTERNAL('Failed to redeem voucher'));
      }

      res.status(200).json({
        success: true,
        data: redeemedVoucher,
        message: 'Voucher redeemed successfully',
      });
    } catch (error) {
      logger.error('Error redeeming voucher:', error);
      next(error);
    }
  };
}
