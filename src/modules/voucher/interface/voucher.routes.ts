import express from 'express';
import { VoucherController } from './voucher.controller';
import { VoucherService } from '../application/voucher.service';
import { VoucherRepository } from '../infrastructure/voucher.repository';
import { authenticate } from '@shared/infrastructure/middleware/auth';

const router = express.Router();
const voucherRepository = new VoucherRepository();
const voucherService = new VoucherService(voucherRepository);
const voucherController = new VoucherController(voucherService);

// Temporarily comment out authentication for testing
// router.use(authenticate);

// Get all vouchers
router.get('/', voucherController.getAllVouchers);

// Get voucher by code
router.get('/code/:code', voucherController.getVoucherByCode);

// Get vouchers by store ID
router.get('/store/:storeId', voucherController.getVouchersByStoreId);

// Get vouchers by customer email
router.get('/customer/:email', voucherController.getVouchersByCustomerEmail);

// Get voucher by ID
router.get('/:id', voucherController.getVoucherById);

// Create a new voucher
router.post('/', voucherController.createVoucher);

// Update an existing voucher
router.put('/:id', voucherController.updateVoucher);

// Delete a voucher
router.delete('/:id', voucherController.deleteVoucher);

// Redeem a voucher
router.put('/code/:code/redeem', voucherController.redeemVoucher);

export default router; 