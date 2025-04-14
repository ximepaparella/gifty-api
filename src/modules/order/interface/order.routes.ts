import express from 'express';
import { OrderController } from './order.controller';
import { OrderService } from '../application/order.service';
import { OrderRepository } from '../infrastructure/order.repository';
import { authenticate } from '@shared/infrastructure/middleware/auth';

export const orderRouter = express.Router();

// Initialize repository, service, and controller
const orderRepository = new OrderRepository();
const orderService = new OrderService(orderRepository);
const orderController = new OrderController(orderService);

// Create new order (public endpoint)
orderRouter.post('/', (req, res, next) => orderController.createOrder(req, res, next));

// Protected routes below
// Get all orders
orderRouter.get('/', authenticate, (req, res, next) => orderController.getAllOrders(req, res, next));

// Get orders by customer ID
orderRouter.get('/customer/:customerId', authenticate, (req, res, next) =>
  orderController.getOrdersByCustomerId(req, res, next)
);

// Get order by voucher code
orderRouter.get('/voucher/:code', authenticate, (req, res, next) =>
  orderController.getVoucherByCode(req, res, next)
);

// Redeem a voucher
orderRouter.put('/voucher/:code/redeem', authenticate, (req, res, next) =>
  orderController.redeemVoucher(req, res, next)
);

// Get order by ID
orderRouter.get('/:id', authenticate, (req, res, next) => orderController.getOrderById(req, res, next));

// Update order
orderRouter.put('/:id', authenticate, (req, res, next) => orderController.updateOrder(req, res, next));

// Delete order
orderRouter.delete('/:id', authenticate, (req, res, next) =>
  orderController.deleteOrder(req, res, next)
);

// Resend voucher emails
orderRouter.post('/:id/resend-emails', authenticate, (req, res, next) =>
  orderController.resendVoucherEmails(req, res, next)
);

// Send voucher emails with PDFs
orderRouter.post('/:id/send-voucher-emails', authenticate, (req, res, next) =>
  orderController.sendVoucherEmails(req, res, next)
);

// Resend voucher email only to the customer
orderRouter.post('/:id/resend-customer-email', authenticate, (req, res, next) =>
  orderController.resendCustomerEmail(req, res, next)
);

// Resend voucher email only to the receiver
orderRouter.post('/:id/resend-receiver-email', authenticate, (req, res, next) =>
  orderController.resendReceiverEmail(req, res, next)
);

// Resend voucher email only to the store
orderRouter.post('/:id/resend-store-email', authenticate, (req, res, next) =>
  orderController.resendStoreEmail(req, res, next)
);

// Download voucher PDF
orderRouter.get('/:id/download-pdf', authenticate, (req, res, next) =>
  orderController.downloadVoucherPDF(req, res, next)
);
