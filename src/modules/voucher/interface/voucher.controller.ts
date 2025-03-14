import { Request, Response } from 'express';
import { VoucherService } from '../application/voucher.service';
import catchAsync from '@shared/utils/catchAsync';
import { IVoucherInput } from '../domain/voucher.interface';

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
  createVoucher = catchAsync(async (req: Request, res: Response) => {
    const voucherData: IVoucherInput = req.body;
    const newVoucher = await this.voucherService.createVoucher(voucherData);
    
    res.status(201).json({
      success: true,
      data: newVoucher,
    });
  });

  /**
   * Update an existing voucher
   */
  updateVoucher = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const voucherData: Partial<IVoucherInput> = req.body;
    
    const updatedVoucher = await this.voucherService.updateVoucher(id, voucherData);
    
    res.status(200).json({
      success: true,
      data: updatedVoucher,
    });
  });

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