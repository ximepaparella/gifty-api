import { Request, Response } from 'express';
import { VoucherService } from '../application/voucher.service';
import catchAsync from '@shared/utils/catchAsync';
import { IVoucherInput } from '../domain/voucher.interface';
import logger from '@shared/infrastructure/logging/logger';

export class VoucherController {
  constructor(private voucherService: VoucherService) {}

  /**
   * Get all vouchers
   */
  getAllVouchers = catchAsync(async (req: Request, res: Response) => {
    const vouchers = await this.voucherService.getAllVouchers();
    res.status(200).json({
      success: true,
      data: vouchers,
    });
  });

  /**
   * Get voucher by ID
   */
  getVoucherById = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const voucher = await this.voucherService.getVoucherById(id);
    
    res.status(200).json({
      success: true,
      data: voucher,
    });
  });

  /**
   * Get voucher by code
   */
  getVoucherByCode = catchAsync(async (req: Request, res: Response) => {
    const { code } = req.params;
    const voucher = await this.voucherService.getVoucherByCode(code);
    
    res.status(200).json({
      success: true,
      data: voucher,
    });
  });

  /**
   * Get vouchers by store ID
   */
  getVouchersByStoreId = catchAsync(async (req: Request, res: Response) => {
    const { storeId } = req.params;
    const vouchers = await this.voucherService.getVouchersByStoreId(storeId);
    
    res.status(200).json({
      success: true,
      data: vouchers,
    });
  });

  /**
   * Get vouchers by customer email
   */
  getVouchersByCustomerEmail = catchAsync(async (req: Request, res: Response) => {
    const { email } = req.params;
    const vouchers = await this.voucherService.getVouchersByCustomerEmail(email);
    
    res.status(200).json({
      success: true,
      data: vouchers,
    });
  });

  /**
   * Create a new voucher
   */
  createVoucher = async (req: Request, res: Response) => {
    try {
      logger.info('Creating voucher with data:', JSON.stringify(req.body, null, 2));
      
      const voucherData: IVoucherInput = req.body;
      
      // Log the specific fields we're having trouble with
      logger.info(`QR Code length: ${voucherData.qrCode?.length || 'undefined'}`);
      logger.info(`CustomerId: ${voucherData.customerId || 'undefined'}`);
      
      const newVoucher = await this.voucherService.createVoucher(voucherData);
      
      res.status(201).json({
        success: true,
        data: newVoucher,
      });
    } catch (error: any) {
      logger.error('Error creating voucher:', error);
      
      const statusCode = error.statusCode || 500;
      const message = error.message || 'Internal server error';
      const stack = process.env.NODE_ENV === 'production' ? undefined : error.stack;
      
      res.status(statusCode).json({
        success: false,
        error: message,
        details: error.details || undefined,
        stack,
        receivedData: {
          qrCode: req.body.qrCode ? 'Present (length: ' + req.body.qrCode.length + ')' : 'Missing',
          customerId: req.body.customerId || 'Missing',
          // Include other key fields for debugging
          storeId: req.body.storeId,
          productId: req.body.productId,
          template: req.body.template
        }
      });
    }
  };

  /**
   * Update an existing voucher
   */
  updateVoucher = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      logger.info(`Updating voucher ${id} with data:`, JSON.stringify(req.body, null, 2));
      
      const voucherData: Partial<IVoucherInput> = req.body;
      
      // Log the specific fields we're having trouble with
      logger.info(`QR Code length: ${voucherData.qrCode?.length || 'undefined'}`);
      logger.info(`CustomerId: ${voucherData.customerId || 'undefined'}`);
      
      const updatedVoucher = await this.voucherService.updateVoucher(id, voucherData);
      
      res.status(200).json({
        success: true,
        data: updatedVoucher,
      });
    } catch (error: any) {
      logger.error(`Error updating voucher ${req.params.id}:`, error);
      
      const statusCode = error.statusCode || 500;
      const message = error.message || 'Internal server error';
      const stack = process.env.NODE_ENV === 'production' ? undefined : error.stack;
      
      res.status(statusCode).json({
        success: false,
        error: message,
        details: error.details || undefined,
        stack,
        receivedData: {
          qrCode: req.body.qrCode ? 'Present (length: ' + req.body.qrCode.length + ')' : 'Missing',
          customerId: req.body.customerId || 'Missing',
          // Include other key fields for debugging
          storeId: req.body.storeId,
          productId: req.body.productId,
          template: req.body.template
        }
      });
    }
  };

  /**
   * Delete a voucher
   */
  deleteVoucher = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    await this.voucherService.deleteVoucher(id);
    
    res.status(200).json({
      success: true,
      message: 'Voucher deleted successfully',
    });
  });

  /**
   * Redeem a voucher by code
   */
  redeemVoucher = catchAsync(async (req: Request, res: Response) => {
    const { code } = req.params;
    const redeemedVoucher = await this.voucherService.redeemVoucher(code);
    
    res.status(200).json({
      success: true,
      data: redeemedVoucher,
      message: 'Voucher redeemed successfully',
    });
  });
} 