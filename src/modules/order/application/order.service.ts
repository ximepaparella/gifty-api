import { IOrder, IOrderInput, IOrderRepository } from '../domain/order.interface';
import { notFoundError, validationError } from '@shared/types/appError';
import { validateOrder } from './order.validator';
import logger from '@shared/infrastructure/logging/logger';
import path from 'path';
import puppeteer from 'puppeteer';
import fs from 'fs';
import { sendEmail } from '@shared/utils';
import { OrderRepository } from '../infrastructure/order.repository';
import { generateRandomCode } from '@shared/utils/codeGenerator';
import { AppError } from '@shared/types/appError';
import mongoose from 'mongoose';
import { sendAllVoucherEmails, resendCustomerEmail, resendReceiverEmail, resendStoreEmail } from '../utils/voucherEmails';

export class OrderService {
  constructor(private orderRepository: OrderRepository) {}

  /**
   * Get all orders
   */
  async getAllOrders(): Promise<IOrder[]> {
    logger.info('Getting all orders');
    return this.orderRepository.findAll();
  }

  /**
   * Get order by ID
   */
  async getOrderById(id: string): Promise<IOrder | null> {
    logger.info(`Getting order with ID ${id}`);
    const order = await this.orderRepository.findById(id);
    return order;
  }

  /**
   * Get orders by customer ID
   */
  async getOrdersByCustomerId(customerId: string): Promise<IOrder[]> {
    logger.info(`Getting orders for customer with ID ${customerId}`);
    return this.orderRepository.findByCustomerId(customerId);
  }

  /**
   * Get order by voucher code
   */
  async getOrderByVoucherCode(code: string): Promise<IOrder | null> {
    logger.info(`Getting order with voucher code ${code}`);
    return this.orderRepository.findByVoucherCode(code);
  }

  /**
   * Create a new order
   */
  async createOrder(orderData: IOrderInput): Promise<IOrder> {
    logger.info('Creating new order');
    
    // Validate order data
    const validationErrors = validateOrder(orderData);
    if (validationErrors.length > 0) {
      throw validationError(validationErrors.join(', '));
    }
    
    // Generate voucher code if not provided
    if (!orderData.voucher.code) {
      orderData.voucher.code = generateRandomCode(10);
    }
    
    // Set voucher status to active and isRedeemed to false
    const orderToCreate: any = {
      ...orderData,
      voucher: {
        ...orderData.voucher,
        status: 'active' as const,
        isRedeemed: false,
        redeemedAt: null,
        amount: orderData.paymentDetails.amount
      },
      emailsSent: false,
      pdfGenerated: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Create the order
    const newOrder = await this.orderRepository.create(orderToCreate);
    
    // Send voucher emails in the background
    if (newOrder._id) {
      this.sendVoucherEmails(newOrder._id.toString()).catch(err => {
        logger.error(`Error sending voucher emails for order ${newOrder._id}: ${err.message}`);
      });
      
      this.generateVoucherPDF(newOrder._id.toString()).catch(err => {
        logger.error(`Error generating voucher PDF for order ${newOrder._id}: ${err.message}`);
      });
    }
    
    return newOrder;
  }

  /**
   * Update an existing order
   */
  async updateOrder(id: string, orderData: Partial<IOrderInput>): Promise<IOrder | null> {
    logger.info(`Updating order with ID ${id}`);
    
    // Check if order exists
    const existingOrder = await this.orderRepository.findById(id);
    if (!existingOrder) {
      throw notFoundError('Order not found');
    }
    
    // Update the order
    return this.orderRepository.update(id, orderData);
  }

  /**
   * Delete an order
   */
  async deleteOrder(id: string): Promise<boolean> {
    logger.info(`Deleting order with ID ${id}`);
    
    // Check if order exists
    const existingOrder = await this.orderRepository.findById(id);
    if (!existingOrder) {
      throw notFoundError('Order not found');
    }
    
    // Delete the order
    return this.orderRepository.delete(id);
  }

  /**
   * Redeem a voucher by its code
   */
  async redeemVoucher(code: string): Promise<IOrder | null> {
    logger.info(`Redeeming voucher with code ${code}`);
    
    // Find the order by voucher code
    const order = await this.orderRepository.findByVoucherCode(code);
    if (!order) {
      throw notFoundError('Voucher not found');
    }
    
    // Check if voucher is already redeemed
    if (order.voucher.isRedeemed) {
      throw new AppError('Voucher has already been redeemed', 400);
    }
    
    // Check if voucher is expired
    if (order.voucher.status === 'expired') {
      throw new AppError('Voucher has expired', 400);
    }
    
    // Update voucher status to redeemed
    const updatedOrder: any = {
      voucher: {
        ...order.voucher,
        status: 'redeemed' as const,
        isRedeemed: true,
        redeemedAt: new Date()
      },
      updatedAt: new Date()
    };
    
    // Update the order
    if (order._id) {
      await this.orderRepository.update(order._id.toString(), updatedOrder);
      return this.orderRepository.findById(order._id.toString());
    }
    
    return null;
  }

  /**
   * Resend voucher emails
   */
  async resendVoucherEmails(id: string): Promise<boolean> {
    logger.info(`Resending voucher emails for order with ID ${id}`);
    
    // Check if order exists
    const order = await this.orderRepository.findById(id);
    if (!order) {
      throw notFoundError('Order not found');
    }
    
    // Send voucher emails
    return this.sendVoucherEmails(id);
  }

  /**
   * Resend voucher email only to the customer
   */
  async resendCustomerEmail(id: string): Promise<boolean> {
    logger.info(`Resending customer voucher email for order with ID ${id}`);
    
    // Check if order exists
    const order = await this.orderRepository.findById(id);
    if (!order) {
      throw notFoundError('Order not found');
    }
    
    try {
      // Check if PDF exists
      const pdfFilename = `voucher-${order.voucher.code}.pdf`;
      const pdfPath = path.join(__dirname, '../../../../uploads/vouchers', pdfFilename);
      
      if (!fs.existsSync(pdfPath)) {
        // Generate PDF if it doesn't exist
        logger.info(`PDF doesn't exist, generating it for order ${id}`);
        await this.generateVoucherPDF(id);
        
        // Check again if PDF exists
        if (!fs.existsSync(pdfPath)) {
          throw new Error(`PDF file could not be generated for order ${id}`);
        }
      }
      
      // Send email only to the customer
      const result = await resendCustomerEmail(id, pdfPath);
      
      if (!result) {
        throw new Error(`Failed to send customer email for order ${id}`);
      }
      
      return true;
    } catch (error: any) {
      logger.error(`Error sending customer email for order ${id}: ${error.message}`, error);
      return false;
    }
  }

  /**
   * Resend voucher email only to the receiver
   */
  async resendReceiverEmail(id: string): Promise<boolean> {
    logger.info(`Resending receiver voucher email for order with ID ${id}`);
    
    // Check if order exists
    const order = await this.orderRepository.findById(id);
    if (!order) {
      throw notFoundError('Order not found');
    }
    
    try {
      // Check if PDF exists
      const pdfFilename = `voucher-${order.voucher.code}.pdf`;
      const pdfPath = path.join(__dirname, '../../../../uploads/vouchers', pdfFilename);
      
      if (!fs.existsSync(pdfPath)) {
        // Generate PDF if it doesn't exist
        logger.info(`PDF doesn't exist, generating it for order ${id}`);
        await this.generateVoucherPDF(id);
        
        // Check again if PDF exists
        if (!fs.existsSync(pdfPath)) {
          throw new Error(`PDF file could not be generated for order ${id}`);
        }
      }
      
      // Send email only to the receiver
      const result = await resendReceiverEmail(id, pdfPath);
      
      if (!result) {
        throw new Error(`Failed to send receiver email for order ${id}`);
      }
      
      return true;
    } catch (error: any) {
      logger.error(`Error sending receiver email for order ${id}: ${error.message}`, error);
      return false;
    }
  }

  /**
   * Resend voucher email only to the store
   */
  async resendStoreEmail(id: string): Promise<boolean> {
    logger.info(`Resending store voucher email for order with ID ${id}`);
    
    // Check if order exists
    const order = await this.orderRepository.findById(id);
    if (!order) {
      throw notFoundError('Order not found');
    }
    
    try {
      // Check if PDF exists
      const pdfFilename = `voucher-${order.voucher.code}.pdf`;
      const pdfPath = path.join(__dirname, '../../../../uploads/vouchers', pdfFilename);
      
      if (!fs.existsSync(pdfPath)) {
        // Generate PDF if it doesn't exist
        logger.info(`PDF doesn't exist, generating it for order ${id}`);
        await this.generateVoucherPDF(id);
        
        // Check again if PDF exists
        if (!fs.existsSync(pdfPath)) {
          throw new Error(`PDF file could not be generated for order ${id}`);
        }
      }
      
      // Send email only to the store
      const result = await resendStoreEmail(id, pdfPath);
      
      if (!result) {
        throw new Error(`Failed to send store email for order ${id}`);
      }
      
      return true;
    } catch (error: any) {
      logger.error(`Error sending store email for order ${id}: ${error.message}`, error);
      return false;
    }
  }

  /**
   * Send voucher emails to sender and receiver
   */
  private async sendVoucherEmails(orderId: string): Promise<boolean> {
    const order = await this.orderRepository.findById(orderId);
    if (!order) return false;
    
    try {
      // Check if PDF exists
      const pdfFilename = `voucher-${order.voucher.code}.pdf`;
      const pdfPath = path.join(__dirname, '../../../../uploads/vouchers', pdfFilename);
      
      if (!fs.existsSync(pdfPath)) {
        // Generate PDF if it doesn't exist
        logger.info(`PDF doesn't exist, generating it for order ${orderId}`);
        await this.generateVoucherPDF(orderId);
        
        // Check again if PDF exists
        if (!fs.existsSync(pdfPath)) {
          throw new Error(`PDF file could not be generated for order ${orderId}`);
        }
      }
      
      // Send all emails
      const result = await sendAllVoucherEmails(orderId, pdfPath);
      
      if (!result) {
        throw new Error(`Failed to send emails for order ${orderId}`);
      }
      
      // Update order to mark emails as sent
      if (order._id) {
        await this.orderRepository.update(order._id.toString(), {
          emailsSent: true,
          updatedAt: new Date()
        } as any);
      }
      
      return true;
    } catch (error: any) {
      logger.error(`Error sending voucher emails for order ${orderId}: ${error.message}`, error);
      return false;
    }
  }

  /**
   * Generate a PDF version of the voucher
   */
  async generateVoucherPDF(orderId: string): Promise<Buffer | null> {
    const order = await this.orderRepository.findById(orderId);
    if (!order) return null;
    
    let browser = null;
    try {
      logger.info(`Starting PDF generation for order: ${orderId}`);
      
      // Get store and product information
      logger.info(`Fetching store with ID: ${order.voucher.storeId}`);
      const Store = mongoose.model('Store');
      const store = await Store.findById(order.voucher.storeId);
      if (!store) {
        throw new Error(`Store not found with ID: ${order.voucher.storeId}`);
      }
      logger.info(`Store found: ${store.name}`);

      logger.info(`Fetching product with ID: ${order.voucher.productId}`);
      const Product = mongoose.model('Product');
      const product = await Product.findById(order.voucher.productId);
      if (!product) {
        throw new Error(`Product not found with ID: ${order.voucher.productId}`);
      }
      logger.info(`Product found: ${product.name}`);

      // Read the template file
      const templateName = `voucher-${order.voucher.template}`;
      const templatePath = path.join(
        __dirname,
        '../../../templates',
        `${templateName}.html`
      );
      
      logger.info(`Template path: ${templatePath}`);
      logger.info(`Template exists: ${fs.existsSync(templatePath)}`);
      
      if (!fs.existsSync(templatePath)) {
        throw new Error(`Template file not found at path: ${templatePath}`);
      }
      
      let templateHtml = fs.readFileSync(templatePath, 'utf8');
      logger.info(`Template loaded, size: ${templateHtml.length} bytes`);

      // Replace placeholders with actual data
      logger.info('Replacing placeholders in template');
      templateHtml = templateHtml
        .replace(/{{storeName}}/g, store.name)
        .replace(/{{storeAddress}}/g, store.address)
        .replace(/{{storePhone}}/g, store.phone)
        .replace(/{{storeEmail}}/g, store.email)
        .replace(/{{storeSocial}}/g, 'Follow us on social media')
        .replace(/{{storeLogo}}/g, 'https://via.placeholder.com/150x50?text=Logo')
        .replace(/{{productName}}/g, product.name)
        .replace(/{{productDescription}}/g, product.description || '')
        .replace(/{{amount}}/g, `$${order.paymentDetails.amount.toFixed(2)}`)
        .replace(/{{code}}/g, order.voucher.code)
        .replace(/{{expirationDate}}/g, new Date(order.voucher.expirationDate).toLocaleDateString())
        .replace(/{{sender_name}}/g, order.voucher.senderName)
        .replace(/{{receiver_name}}/g, order.voucher.receiverName)
        .replace(/{{message}}/g, order.voucher.message)
        .replace(/{{qrCode}}/g, order.voucher.qrCode || '');

      // Create directory for PDFs if it doesn't exist
      const pdfDir = path.join(__dirname, '../../../../uploads/vouchers');
      logger.info(`PDF directory path: ${pdfDir}`);
      
      if (!fs.existsSync(pdfDir)) {
        logger.info(`Creating PDF directory: ${pdfDir}`);
        fs.mkdirSync(pdfDir, { recursive: true });
      }

      // Generate PDF file path
      const pdfFilename = `voucher-${order.voucher.code}.pdf`;
      const pdfPath = path.join(pdfDir, pdfFilename);
      logger.info(`PDF path: ${pdfPath}`);

      // Launch puppeteer
      logger.info('Launching puppeteer');
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      logger.info('Creating new page');
      const page = await browser.newPage();
      
      // Set content and generate PDF
      logger.info('Setting page content');
      await page.setContent(templateHtml, { waitUntil: 'networkidle0' });
      
      logger.info('Generating PDF');
      const pdfBuffer = await page.pdf({
        path: pdfPath,
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20px',
          right: '20px',
          bottom: '20px',
          left: '20px'
        }
      });
      
      logger.info('Closing browser');
      await browser.close();
      browser = null;
      
      logger.info(`PDF generated successfully: ${pdfPath}`);
      
      // Verify the file was created
      if (!fs.existsSync(pdfPath)) {
        throw new Error(`PDF file was not created at path: ${pdfPath}`);
      }
      
      const fileStats = fs.statSync(pdfPath);
      logger.info(`PDF file size: ${fileStats.size} bytes`);
      
      // Save the PDF path to the order
      const pdfUrl = `/uploads/vouchers/${pdfFilename}`;
      if (order._id) {
        await this.orderRepository.updatePdfUrl(order._id.toString(), pdfUrl);
      }
      
      return pdfBuffer as Buffer;
    } catch (error: any) {
      logger.error(`Error generating voucher PDF for order ${orderId}: ${error.message}`);
      logger.error(error.stack);
      
      // Clean up browser if it's still open
      if (browser) {
        try {
          await browser.close();
        } catch (closeError) {
          logger.error(`Error closing browser: ${closeError}`);
        }
      }
      
      return null;
    }
  }
} 