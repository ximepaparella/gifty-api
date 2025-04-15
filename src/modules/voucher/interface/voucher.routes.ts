import { Router } from 'express';
import { VoucherController } from './voucher.controller';
import { VoucherService } from '../application/voucher.service';
import { VoucherRepository } from '../infrastructure/voucher.repository';
import { authenticate } from '@shared/infrastructure/middleware/auth';
import { authorize } from '@shared/infrastructure/middleware/authorize';

export const voucherRouter = Router();
const voucherRepository = new VoucherRepository();
const voucherService = new VoucherService(voucherRepository);
const voucherController = new VoucherController(voucherService);

voucherRouter.use(authenticate);

// Get all vouchers
voucherRouter.get('/', authorize(['admin']), voucherController.getAllVouchers);

// Get voucher by ID
voucherRouter.get('/:id', authorize(['admin', 'store_manager']), voucherController.getVoucherById);

// Get voucher by code
voucherRouter.get('/code/:code', authorize(['admin', 'store_manager']), voucherController.getVoucherByCode);

// Get vouchers by store ID
voucherRouter.get('/store/:storeId', voucherController.getVouchersByStoreId);

// Get vouchers by customer email
voucherRouter.get('/customer/:email', voucherController.getVouchersByCustomerEmail);

// Create new voucher
voucherRouter.post('/', authorize(['admin', 'store_manager']), voucherController.createVoucher);

// Update voucher
voucherRouter.put('/:id', authorize(['admin', 'store_manager']), voucherController.updateVoucher);

// Delete voucher
voucherRouter.delete('/:id', authorize(['admin']), voucherController.deleteVoucher);

// Redeem voucher
voucherRouter.post('/:id/redeem', authorize(['admin', 'store_manager']), voucherController.redeemVoucher);
