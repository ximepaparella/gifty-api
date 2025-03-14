import { Request, Response, NextFunction } from 'express';
import { OrderService } from '../application/order.service';
import { catchAsync } from '@shared/utils';
import { AppError } from '@shared/types/appError';
import path from 'path';
import fs from 'fs';

export class OrderController {
  constructor(private orderService: OrderService) {}

  /**
   * Get all orders
   */
  getAllOrders = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const orders = await this.orderService.getAllOrders();
    res.status(200).json({
      success: true,
      data: orders
    });
  });

  /**
   * Get order by ID
   */
  getOrderById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const order = await this.orderService.getOrderById(id);
    
    if (!order) {
      return next(new AppError('Order not found', 404));
    }
    
    res.status(200).json({
      success: true,
      data: order
    });
  });

  /**
   * Get orders by customer ID
   */
  getOrdersByCustomerId = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { customerId } = req.params;
    const orders = await this.orderService.getOrdersByCustomerId(customerId);
    res.status(200).json({
      success: true,
      data: orders
    });
  });

  /**
   * Get order by voucher code
   */
  getVoucherByCode = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { code } = req.params;
    const order = await this.orderService.getOrderByVoucherCode(code);
    
    if (!order) {
      return next(new AppError('Order with this voucher code not found', 404));
    }
    
    res.status(200).json({
      success: true,
      data: order
    });
  });

  /**
   * Create a new order
   */
  createOrder = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const orderData = req.body;
    const newOrder = await this.orderService.createOrder(orderData);
    
    res.status(201).json({
      success: true,
      data: newOrder
    });
  });

  /**
   * Update an order
   */
  updateOrder = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const orderData = req.body;
    
    const updatedOrder = await this.orderService.updateOrder(id, orderData);
    
    if (!updatedOrder) {
      return next(new AppError('Order not found', 404));
    }
    
    res.status(200).json({
      success: true,
      data: updatedOrder
    });
  });

  /**
   * Delete an order
   */
  deleteOrder = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const result = await this.orderService.deleteOrder(id);
    
    if (!result) {
      return next(new AppError('Order not found', 404));
    }
    
    res.status(200).json({
      success: true,
      message: 'Order deleted successfully'
    });
  });

  /**
   * Redeem a voucher
   */
  redeemVoucher = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { code } = req.params;
    const redeemedOrder = await this.orderService.redeemVoucher(code);
    
    if (!redeemedOrder) {
      return next(new AppError('Voucher not found or already redeemed', 404));
    }
    
    res.status(200).json({
      success: true,
      data: redeemedOrder,
      message: 'Voucher redeemed successfully'
    });
  });

  /**
   * Resend voucher emails
   */
  resendVoucherEmails = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const result = await this.orderService.resendVoucherEmails(id);
    
    if (!result) {
      return next(new AppError('Order not found or emails could not be sent', 404));
    }
    
    res.status(200).json({
      success: true,
      message: 'Voucher emails sent successfully'
    });
  });

  /**
   * Send voucher emails with PDF attachments
   */
  sendVoucherEmails = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const order = await this.orderService.getOrderById(id);
    
    if (!order) {
      return next(new AppError('Order not found', 404));
    }
    
    // Ensure PDF exists
    const pdfBuffer = await this.orderService.generateVoucherPDF(id);
    if (!pdfBuffer) {
      return next(new AppError('Failed to generate PDF for the voucher', 500));
    }
    
    // Send emails
    const result = await this.orderService.resendVoucherEmails(id);
    if (!result) {
      return next(new AppError('Failed to send voucher emails', 500));
    }
    
    res.status(200).json({
      success: true,
      message: 'Voucher emails with PDF attachments sent successfully'
    });
  });

  /**
   * Resend voucher email only to the customer
   */
  resendCustomerEmail = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const order = await this.orderService.getOrderById(id);
    
    if (!order) {
      return next(new AppError('Order not found', 404));
    }
    
    // Send customer email with PDF
    const result = await this.orderService.resendCustomerEmail(id);
    if (!result) {
      return next(new AppError('Failed to send voucher email to customer', 500));
    }
    
    res.status(200).json({
      success: true,
      message: 'Voucher email sent to customer successfully'
    });
  });

  /**
   * Resend voucher email only to the receiver
   */
  resendReceiverEmail = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const order = await this.orderService.getOrderById(id);
    
    if (!order) {
      return next(new AppError('Order not found', 404));
    }
    
    // Send receiver email with PDF
    const result = await this.orderService.resendReceiverEmail(id);
    if (!result) {
      return next(new AppError('Failed to send voucher email to receiver', 500));
    }
    
    res.status(200).json({
      success: true,
      message: 'Voucher email sent to receiver successfully'
    });
  });

  /**
   * Resend voucher email only to the store
   */
  resendStoreEmail = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const order = await this.orderService.getOrderById(id);
    
    if (!order) {
      return next(new AppError('Order not found', 404));
    }
    
    // Send store email with PDF
    const result = await this.orderService.resendStoreEmail(id);
    if (!result) {
      return next(new AppError('Failed to send voucher email to store', 500));
    }
    
    res.status(200).json({
      success: true,
      message: 'Voucher email sent to store successfully'
    });
  });

  /**
   * Download voucher PDF
   */
  downloadVoucherPDF = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const order = await this.orderService.getOrderById(id);
    
    if (!order) {
      return next(new AppError('Order not found', 404));
    }
    
    // Check if PDF has already been generated
    if (order.pdfGenerated && order.pdfUrl) {
      // Construct the absolute path to the PDF file
      const pdfPath = path.join(__dirname, '../../../../../uploads/vouchers', path.basename(order.pdfUrl));
      
      // Check if the file exists
      if (fs.existsSync(pdfPath)) {
        const pdfData = fs.readFileSync(pdfPath);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=voucher-${id}.pdf`);
        return res.status(200).send(pdfData);
      }
    }
    
    // If the PDF doesn't exist or needs to be regenerated, generate it
    const pdfBuffer = await this.orderService.generateVoucherPDF(id);
    
    if (!pdfBuffer) {
      return next(new AppError('Order not found or PDF could not be generated', 404));
    }
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=voucher-${id}.pdf`);
    
    res.status(200).send(pdfBuffer);
  });
} 