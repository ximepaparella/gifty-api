import { IOrder, IOrderInput } from '../domain/order.interface';
import { ErrorTypes } from '@shared/types/appError';
import { validateOrder } from './order.validator';
import logger from '@shared/infrastructure/logging/logger';
import path from 'path';
import puppeteer from 'puppeteer';
import fs from 'fs';
import { OrderRepository } from '../infrastructure/order.repository';
import { generateRandomCode } from '@shared/utils/codeGenerator';
import {
  sendAllVoucherEmails,
  resendCustomerEmail,
  resendReceiverEmail,
  resendStoreEmail,
} from '../utils/voucherEmails';
import { generateVoucherRedemptionQRCode } from '@shared/utils/qrCodeGenerator';
import { Store } from '../../store/domain/store.schema';

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
      throw ErrorTypes.VALIDATION(validationErrors.join(', '));
    }

    // Generate voucher code if not provided
    if (!orderData.voucher.code) {
      orderData.voucher.code = generateRandomCode(10);
    }

    try {
      // Generate QR code for voucher redemption
      logger.info(`Generating QR code for voucher with code: ${orderData.voucher.code}`);
      const qrCodeDataUrl = await generateVoucherRedemptionQRCode(orderData.voucher.code);

      // Set voucher status to active and isRedeemed to false
      const orderToCreate: any = {
        ...orderData,
        voucher: {
          ...orderData.voucher,
          status: 'active' as const,
          isRedeemed: false,
          redeemedAt: null,
          amount: orderData.paymentDetails.amount,
          qrCode: qrCodeDataUrl,
        },
        emailsSent: false,
        pdfGenerated: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Create the order
      const newOrder = await this.orderRepository.create(orderToCreate);

      // Send voucher emails in the background
      if (newOrder._id) {
        this.sendVoucherEmails(newOrder._id.toString()).catch((err) => {
          logger.error(`Error sending voucher emails for order ${newOrder._id}: ${err.message}`);
        });

        this.generateVoucherPDF(newOrder._id.toString()).catch((err) => {
          logger.error(`Error generating voucher PDF for order ${newOrder._id}: ${err.message}`);
        });
      }

      return newOrder;
    } catch (error: any) {
      logger.error('Failed to create order:', error);
      throw ErrorTypes.INTERNAL(`Failed to create order: ${error.message}`);
    }
  }

  /**
   * Update an existing order
   */
  async updateOrder(id: string, orderData: Partial<IOrderInput>): Promise<IOrder | null> {
    logger.info(`Updating order with ID ${id}`);

    // Check if order exists
    const existingOrder = await this.orderRepository.findById(id);
    if (!existingOrder) {
      throw ErrorTypes.NOT_FOUND('Order');
    }

    // Update the order
    const updateData = {
      ...orderData,
      updatedAt: new Date(),
    } as Partial<IOrderInput>;

    await this.orderRepository.update(id, updateData);
    return this.orderRepository.findById(id);
  }

  /**
   * Delete an order
   */
  async deleteOrder(id: string): Promise<boolean> {
    logger.info(`Deleting order with ID ${id}`);

    // Check if order exists
    const existingOrder = await this.orderRepository.findById(id);
    if (!existingOrder) {
      throw ErrorTypes.NOT_FOUND('Order');
    }

    // Delete the order
    return this.orderRepository.delete(id);
  }

  /**
   * Redeem a voucher by its code
   */
  async redeemVoucher(orderId: string): Promise<IOrder> {
    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      throw ErrorTypes.NOT_FOUND('Order');
    }

    if (!order.voucher || order.voucher.isRedeemed) {
      throw ErrorTypes.BAD_REQUEST('Voucher cannot be redeemed');
    }

    const redeemedOrder = await this.orderRepository.redeemVoucher(orderId);
    if (!redeemedOrder) {
      throw ErrorTypes.INTERNAL('Failed to redeem voucher');
    }

    return redeemedOrder;
  }

  /**
   * Helper method for email resend operations that handles common operations
   */
  private async prepareOrderForEmailResend(
    id: string
  ): Promise<{ order: IOrder; pdfUrl: string } | null> {
    // Check if order exists
    const order = await this.orderRepository.findById(id);
    if (!order) {
      throw ErrorTypes.NOT_FOUND('Order');
    }

    try {
      // Generate PDF if not already generated
      if (!order.pdfUrl) {
        const pdfUrl = await this.generateVoucherPDF(id);
        if (!pdfUrl) {
          throw new Error('Failed to generate PDF');
        }
        order.pdfUrl = pdfUrl;
      }

      return {
        order,
        pdfUrl: order.pdfUrl,
      };
    } catch (error) {
      logger.error(`Error preparing order for email resend: ${error}`);
      return null;
    }
  }

  /**
   * Resend voucher emails
   */
  async resendVoucherEmails(id: string): Promise<boolean> {
    logger.info(`Resending voucher emails for order with ID ${id}`);

    try {
      const result = await this.prepareOrderForEmailResend(id);
      if (!result) return false;

      // Send all emails
      const emailResult = await sendAllVoucherEmails(id, result.pdfUrl);

      if (!emailResult) {
        throw ErrorTypes.INTERNAL(`Failed to send emails for order ${id}`);
      }

      // Update order to mark emails as sent
      await this.orderRepository.update(id, {
        emailsSent: true,
        updatedAt: new Date(),
      } as any);

      return true;
    } catch (error: any) {
      logger.error(`Error sending voucher emails for order ${id}: ${error.message}`, error);
      return false;
    }
  }

  /**
   * Resend voucher email only to the customer
   */
  async resendCustomerEmail(id: string): Promise<boolean> {
    logger.info(`Resending customer voucher email for order with ID ${id}`);

    try {
      const result = await this.prepareOrderForEmailResend(id);
      if (!result) return false;

      // Send email only to the customer
      const emailResult = await resendCustomerEmail(id, result.pdfUrl);

      if (!emailResult) {
        throw ErrorTypes.INTERNAL(`Failed to send customer email for order ${id}`);
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

    try {
      const result = await this.prepareOrderForEmailResend(id);
      if (!result) return false;

      // Send email only to the receiver
      const emailResult = await resendReceiverEmail(id, result.pdfUrl);

      if (!emailResult) {
        throw ErrorTypes.INTERNAL(`Failed to send receiver email for order ${id}`);
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

    try {
      const result = await this.prepareOrderForEmailResend(id);
      if (!result) return false;

      // Send email only to the store
      const emailResult = await resendStoreEmail(id, result.pdfUrl);

      if (!emailResult) {
        throw ErrorTypes.INTERNAL(`Failed to send store email for order ${id}`);
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
    try {
      const result = await this.prepareOrderForEmailResend(orderId);
      if (!result) return false;

      // Send all emails
      const emailResult = await sendAllVoucherEmails(orderId, result.pdfUrl);

      if (!emailResult) {
        throw ErrorTypes.INTERNAL(`Failed to send emails for order ${orderId}`);
      }

      // Update order to mark emails as sent
      await this.orderRepository.update(orderId, {
        emailsSent: true,
        updatedAt: new Date(),
      } as any);

      return true;
    } catch (error: any) {
      logger.error(`Error sending voucher emails for order ${orderId}: ${error.message}`, error);
      return false;
    }
  }

  /**
   * Generate voucher PDF and store it locally
   */
  async generateVoucherPDF(orderId: string): Promise<string | null> {
    logger.info(`Generating voucher PDF for order ${orderId}`);
    let browser = null;

    try {
      // Get order details
      const order = await this.orderRepository.findById(orderId);
      if (!order) {
        throw ErrorTypes.NOT_FOUND('Order');
      }

      // Get store details
      const store = await Store.findById(order.voucher.storeId);
      if (!store) {
        throw ErrorTypes.NOT_FOUND('Store');
      }

      // Create vouchers directory if it doesn't exist
      const vouchersDir = path.join(process.cwd(), 'uploads', 'vouchers');
      if (!fs.existsSync(vouchersDir)) {
        fs.mkdirSync(vouchersDir, { recursive: true });
      }

      // Generate PDF filename
      const timestamp = Date.now();
      const pdfFileName = `voucher-${order.voucher.code}-${timestamp}.pdf`;
      const pdfPath = path.join(vouchersDir, pdfFileName);

      // Get template content
      const templateNumber = order.voucher.template || 'template1';
      const templatePath = path.join(
        process.cwd(),
        'src',
        'templates',
        `voucher-${templateNumber}.html`
      );

      logger.info(`Using template: ${templatePath}`);

      if (!fs.existsSync(templatePath)) {
        throw ErrorTypes.NOT_FOUND(`Template ${templateNumber}`);
      }

      let templateContent = fs.readFileSync(templatePath, 'utf-8');

      // Replace template variables
      const replacements = {
        '{{storeLogo}}': store.logo || '',
        '{{storeName}}': store.name || '',
        '{{storeAddress}}': store.address || '',
        '{{storeEmail}}': store.email || '',
        '{{storePhone}}': store.phone || '',
        '{{storeSocial}}': store.social
          ? Object.values(store.social).filter(Boolean).join(', ')
          : '',
        '{{sender_name}}': order.voucher.senderName || '',
        '{{receiver_name}}': order.voucher.receiverName || '',
        '{{productName}}': `${order.voucher.amount} Gift Card`,
        '{{message}}': order.voucher.message || '',
        '{{code}}': order.voucher.code || '',
        '{{qrCode}}': order.voucher.qrCode || '',
        '{{expirationDate}}': order.voucher.expirationDate
          ? new Date(order.voucher.expirationDate).toLocaleDateString()
          : '',
      };

      // Replace all placeholders in the template
      for (const [key, value] of Object.entries(replacements)) {
        templateContent = templateContent.replace(new RegExp(key, 'g'), value);
      }

      // Launch browser
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });

      // Create new page
      const page = await browser.newPage();

      // Set viewport
      await page.setViewport({
        width: 1024,
        height: 1447, // A4 size at 96 DPI
      });

      // Set content with timeout and wait for network idle
      await page.setContent(templateContent, {
        waitUntil: ['networkidle0', 'load', 'domcontentloaded'],
        timeout: 30000,
      });

      // Wait for images to load
      await page.evaluate(() => {
        return Promise.all(
          Array.from(document.images)
            .filter((img) => !img.complete)
            .map(
              (img) =>
                new Promise((resolve) => {
                  img.onload = img.onerror = resolve;
                })
            )
        );
      });

      // Generate PDF buffer
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20px',
          right: '20px',
          bottom: '20px',
          left: '20px',
        },
        preferCSSPageSize: true,
        displayHeaderFooter: false,
        scale: 1,
        landscape: false,
      });

      // Verify PDF buffer
      if (!pdfBuffer) {
        logger.error('Failed to generate PDF for order:', orderId);
        throw ErrorTypes.INTERNAL('Failed to generate PDF');
      }

      // Verify PDF header
      const pdfHeader = Buffer.from(pdfBuffer).subarray(0, 5).toString('ascii');
      if (!pdfHeader.startsWith('%PDF-')) {
        throw ErrorTypes.INTERNAL('Generated file is not a valid PDF');
      }

      // Save PDF locally
      fs.writeFileSync(pdfPath, pdfBuffer);
      logger.info(`PDF saved locally at: ${pdfPath}`);

      // Update order with PDF path
      const updateData: Partial<IOrderInput> = {
        pdfUrl: pdfPath,
        pdfGenerated: true,
      };
      await this.orderRepository.update(orderId, updateData);

      return pdfPath;
    } catch (error: any) {
      logger.error('Failed to generate voucher PDF:', error);
      throw ErrorTypes.INTERNAL(error.message || 'Failed to generate voucher PDF');
    } finally {
      if (browser) {
        try {
          await browser.close();
        } catch (error) {
          logger.error('Error closing browser:', error);
        }
      }
    }
  }
}
