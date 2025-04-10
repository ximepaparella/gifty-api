import { Router } from 'express';
import { VoucherController } from './voucher.controller';
import { VoucherService } from '../application/voucher.service';
import { VoucherRepository } from '../infrastructure/voucher.repository';
import { authenticate } from '@shared/infrastructure/middleware/auth';
import { authorize } from '@shared/infrastructure/middleware/authorize';

const router = Router();
const voucherRepository = new VoucherRepository();
const voucherService = new VoucherService(voucherRepository);
const voucherController = new VoucherController(voucherService);

router.use(authenticate);

// Get all vouchers
router.get('/', authorize(['admin']), voucherController.getAllVouchers);

// Get voucher by ID
router.get('/:id', authorize(['admin', 'store_manager']), voucherController.getVoucherById);

// Get voucher by code
router.get('/code/:code', authorize(['admin', 'store_manager']), voucherController.getVoucherByCode);

// Get vouchers by store ID
router.get('/store/:storeId', voucherController.getVouchersByStoreId);

// Get vouchers by customer email
router.get('/customer/:email', voucherController.getVouchersByCustomerEmail);

// Create new voucher
router.post('/', authorize(['admin', 'store_manager']), voucherController.createVoucher);

// Update voucher
router.put('/:id', authorize(['admin', 'store_manager']), voucherController.updateVoucher);

// Delete voucher
router.delete('/:id', authorize(['admin']), voucherController.deleteVoucher);

// Redeem voucher
router.post('/:id/redeem', authorize(['admin', 'store_manager']), voucherController.redeemVoucher);

export default router;
