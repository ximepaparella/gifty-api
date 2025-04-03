import express from 'express';
import { OrderController } from './order.controller';
import { OrderService } from '../application/order.service';
import { OrderRepository } from '../infrastructure/order.repository';
import { authenticate } from '@shared/infrastructure/middleware/auth';

const router = express.Router();

// Initialize repository, service, and controller
const orderRepository = new OrderRepository();
const orderService = new OrderService(orderRepository);
const orderController = new OrderController(orderService);

// Create new order (public endpoint)
router.post('/', (req, res, next) => orderController.createOrder(req, res, next));

// Protected routes below
// Get all orders
router.get('/', authenticate, (req, res, next) => orderController.getAllOrders(req, res, next));

// Get orders by customer ID
router.get('/customer/:customerId', authenticate, (req, res, next) => orderController.getOrdersByCustomerId(req, res, next));

// Get order by voucher code
router.get('/voucher/:code', authenticate, (req, res, next) => orderController.getVoucherByCode(req, res, next));

// Redeem a voucher
router.put('/voucher/:code/redeem', authenticate, (req, res, next) => orderController.redeemVoucher(req, res, next));

// Get order by ID
router.get('/:id', authenticate, (req, res, next) => orderController.getOrderById(req, res, next));

// Update order
router.put('/:id', authenticate, (req, res, next) => orderController.updateOrder(req, res, next));

// Delete order
router.delete('/:id', authenticate, (req, res, next) => orderController.deleteOrder(req, res, next));

// Resend voucher emails
router.post('/:id/resend-emails', authenticate, (req, res, next) => orderController.resendVoucherEmails(req, res, next));

// Send voucher emails with PDFs
router.post('/:id/send-voucher-emails', authenticate, (req, res, next) => orderController.sendVoucherEmails(req, res, next));

// Resend voucher email only to the customer
router.post('/:id/resend-customer-email', authenticate, (req, res, next) => orderController.resendCustomerEmail(req, res, next));

// Resend voucher email only to the receiver
router.post('/:id/resend-receiver-email', authenticate, (req, res, next) => orderController.resendReceiverEmail(req, res, next));

// Resend voucher email only to the store
router.post('/:id/resend-store-email', authenticate, (req, res, next) => orderController.resendStoreEmail(req, res, next));

// Download voucher PDF
router.get('/:id/download-pdf', authenticate, (req, res, next) => orderController.downloadVoucherPDF(req, res, next));

export default router; 