/// <reference lib="dom" />
/// <reference lib="dom.iterable" />

import { IOrder } from '../domain/order.interface';
import { sendEmail } from '@shared/utils/email';
import logger from '@shared/infrastructure/logging/logger';
import mongoose from 'mongoose';
import { Store } from '../../store/domain/store.schema';
import { IStore } from '../../store/domain/store.entity';
import path from 'path';
import fs from 'fs';
import puppeteer from 'puppeteer';
import { AppError } from '@shared/types/appError';
import { OrderModel } from '../domain/order.schema';

export const sendStoreEmail = async (
  order: IOrder,
  store: IStore,
  pdfPath: string
): Promise<void> => {
  try {
    if (!store?.email) {
      throw new Error('Store email is required');
    }

    logger.info(`Sending store notification email for order ${order._id} to ${store.email}`);

    await sendEmail({
      to: store.email,
      subject: 'A new voucher has been purchased!',
      html: `
        <h1>New Voucher Purchase</h1>
        <p>Hello ${store.name},</p>
        <p>A new voucher has been purchased for your store.</p>
        <h2>Client Details:</h2>
        <ul>
          <li><strong>Sender:</strong> ${order.voucher.senderName} (${order.voucher.senderEmail})</li>
          <li><strong>Receiver:</strong> ${order.voucher.receiverName} (${order.voucher.receiverEmail})</li>
          <li><strong>Amount:</strong> $${order.voucher.amount}</li>
          <li><strong>Voucher Code:</strong> ${order.voucher.code}</li>
          <li><strong>Expiration Date:</strong> ${new Date(order.voucher.expirationDate).toLocaleDateString()}</li>
        </ul>
        <p>The voucher is attached to this email.</p>
        <p>Thank you for using our platform!</p>
      `,
      attachments: [
        {
          filename: `voucher-${order.voucher.code}.pdf`,
          path: pdfPath,
          contentType: 'application/pdf',
        },
      ],
    });

    logger.info(`Email sent to store: ${store.email}`);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error(`Error sending email to store: ${errorMessage}`, error);
    throw new Error(`Failed to send email to store: ${errorMessage}`);
  }
};

/**
 * Send email to receiver with voucher attached
 */
export const sendReceiverEmail = async (order: IOrder, pdfPath: string): Promise<void> => {
  try {
    if (!order.voucher.receiverEmail) {
      throw new Error('Receiver email is required');
    }

    logger.info(`Sending receiver email for order ${order._id} to ${order.voucher.receiverEmail}`);

    await sendEmail({
      to: order.voucher.receiverEmail,
      subject: `You've received a gift voucher from ${order.voucher.senderName}!`,
      html: `
        <h1>You've Received a Gift Voucher!</h1>
        <p>Hello ${order.voucher.receiverName},</p>
        <p>${order.voucher.senderName} has sent you a gift voucher with the following message:</p>
        <blockquote style="border-left: 4px solid #ccc; padding-left: 16px; margin-left: 0; font-style: italic;">
          "${order.voucher.message || 'Enjoy your gift!'}"
        </blockquote>
        <p>Your voucher code is: <strong>${order.voucher.code}</strong></p>
        <p>Amount: $${order.voucher.amount}</p>
        <p>Expiration Date: ${new Date(order.voucher.expirationDate).toLocaleDateString()}</p>
        <p>The voucher is attached to this email as a PDF.</p>
        <p>Enjoy your gift!</p>
      `,
      attachments: [
        {
          filename: `voucher-${order.voucher.code}.pdf`,
          path: pdfPath,
          contentType: 'application/pdf',
        },
      ],
    });

    logger.info(`Email sent to receiver: ${order.voucher.receiverEmail}`);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error(`Error sending email to receiver: ${errorMessage}`, error);
    throw new Error(`Failed to send email to receiver: ${errorMessage}`);
  }
};

/**
 * Send email to customer (sender) with voucher attached
 */
export const sendCustomerEmail = async (order: IOrder, pdfPath: string): Promise<void> => {
  try {
    if (!order.voucher.senderEmail) {
      throw new Error('Sender email is required');
    }

    logger.info(`Sending customer email for order ${order._id} to ${order.voucher.senderEmail}`);

    await sendEmail({
      to: order.voucher.senderEmail,
      subject: 'Your gift voucher purchase confirmation',
      html: `
        <h1>Gift Voucher Purchase Confirmation</h1>
        <p>Hello ${order.voucher.senderName},</p>
        <p>Thank you for purchasing a gift voucher! Here are the details of your purchase:</p>
        <ul>
          <li><strong>Recipient:</strong> ${order.voucher.receiverName} (${order.voucher.receiverEmail})</li>
          <li><strong>Amount:</strong> $${order.voucher.amount}</li>
          <li><strong>Voucher Code:</strong> ${order.voucher.code}</li>
          <li><strong>Expiration Date:</strong> ${new Date(order.voucher.expirationDate).toLocaleDateString()}</li>
        </ul>
        <p>Your message to the recipient:</p>
        <blockquote style="border-left: 4px solid #ccc; padding-left: 16px; margin-left: 0; font-style: italic;">
          "${order.voucher.message || 'Enjoy your gift!'}"
        </blockquote>
        <p>The voucher is attached to this email as a PDF.</p>
        <p>Thank you for using our platform!</p>
      `,
      attachments: [
        {
          filename: `voucher-${order.voucher.code}.pdf`,
          path: pdfPath,
          contentType: 'application/pdf',
        },
      ],
    });

    logger.info(`Email sent to customer: ${order.voucher.senderEmail}`);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error(`Error sending email to customer: ${errorMessage}`, error);
    throw new Error(`Failed to send email to customer: ${errorMessage}`);
  }
};

/**
 * Send all voucher emails
 */
export const sendAllVoucherEmails = async (orderId: string, pdfPath: string): Promise<boolean> => {
  try {
    logger.info(`Starting to send all voucher emails for order ${orderId}`);

    // Get order details
    const order = await OrderModel.findById(orderId);
    if (!order) {
      throw new AppError('Order not found', 404);
    }

    // Get store details
    const store = await Store.findById(order.voucher.storeId);
    if (!store) {
      throw new AppError('Store not found', 404);
    }

    // Verify PDF path is accessible
    if (!fs.existsSync(pdfPath)) {
      throw new AppError(`PDF path is not accessible: ${pdfPath}`, 400);
    }

    // Send emails in sequence to better track failures
    logger.info(`Sending store email for order ${orderId}`);
    await sendStoreEmail(order, store, pdfPath);

    logger.info(`Sending receiver email for order ${orderId}`);
    await sendReceiverEmail(order, pdfPath);

    logger.info(`Sending customer email for order ${orderId}`);
    await sendCustomerEmail(order, pdfPath);

    logger.info(`Successfully sent all emails for order ${orderId}`);
    return true;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error(`Error sending voucher emails for order ${orderId}: ${errorMessage}`, error);
    throw new AppError(
      `Failed to send voucher emails: ${errorMessage}`,
      error instanceof AppError ? error.statusCode : 500
    );
  }
};

/**
 * Resend voucher email only to the customer
 * @param orderId - Order ID
 * @param pdfPath - Local path to the voucher PDF
 * @returns true if successful, false otherwise
 */
export const resendCustomerEmail = async (orderId: string, pdfPath: string): Promise<boolean> => {
  try {
    logger.info(`Resending customer voucher email for order: ${orderId}`);

    // Get order data
    const order = await OrderModel.findById(orderId);
    if (!order) {
      throw new AppError(`Order not found with ID: ${orderId}`, 404);
    }

    // Verify PDF path is accessible
    if (!fs.existsSync(pdfPath)) {
      throw new AppError(`PDF path is not accessible: ${pdfPath}`, 400);
    }

    // Send email to customer
    await sendCustomerEmail(order, pdfPath);

    logger.info(`Customer email resent successfully for order: ${orderId}`);
    return true;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error(`Error resending customer email for order ${orderId}: ${errorMessage}`, error);
    throw new AppError(
      `Failed to resend customer email: ${errorMessage}`,
      error instanceof AppError ? error.statusCode : 500
    );
  }
};

/**
 * Resend voucher email only to the receiver
 * @param orderId - Order ID
 * @param pdfPath - Local path to the voucher PDF
 * @returns true if successful, false otherwise
 */
export const resendReceiverEmail = async (orderId: string, pdfPath: string): Promise<boolean> => {
  try {
    logger.info(`Resending receiver voucher email for order: ${orderId}`);

    // Get order data
    const order = await OrderModel.findById(orderId);
    if (!order) {
      throw new AppError(`Order not found with ID: ${orderId}`, 404);
    }

    // Verify PDF path is accessible
    if (!fs.existsSync(pdfPath)) {
      throw new AppError(`PDF path is not accessible: ${pdfPath}`, 400);
    }

    // Send email to receiver
    await sendReceiverEmail(order, pdfPath);

    logger.info(`Receiver email resent successfully for order: ${orderId}`);
    return true;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error(`Error resending receiver email for order ${orderId}: ${errorMessage}`, error);
    throw new AppError(
      `Failed to resend receiver email: ${errorMessage}`,
      error instanceof AppError ? error.statusCode : 500
    );
  }
};

/**
 * Resend voucher email only to the store
 * @param orderId - Order ID
 * @param pdfPath - Local path to the voucher PDF
 * @returns true if successful, false otherwise
 */
export const resendStoreEmail = async (orderId: string, pdfPath: string): Promise<boolean> => {
  try {
    logger.info(`Resending store voucher email for order: ${orderId}`);

    // Get order data
    const order = await OrderModel.findById(orderId);
    if (!order) {
      throw new AppError(`Order not found with ID: ${orderId}`, 404);
    }

    // Get store information
    const store = await Store.findById(order.voucher.storeId);
    if (!store) {
      throw new AppError(`Store not found with ID: ${order.voucher.storeId}`, 404);
    }

    // Verify PDF path is accessible
    if (!fs.existsSync(pdfPath)) {
      throw new AppError(`PDF path is not accessible: ${pdfPath}`, 400);
    }

    // Send email to store
    await sendStoreEmail(order, store, pdfPath);

    logger.info(`Store email resent successfully for order: ${orderId}`);
    return true;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error(`Error resending store email for order ${orderId}: ${errorMessage}`, error);
    throw new AppError(
      `Failed to resend store email: ${errorMessage}`,
      error instanceof AppError ? error.statusCode : 500
    );
  }
};

/**
 * Generate voucher PDF and store it locally
 */
export const generateVoucherPDF = async (orderId: string): Promise<string | null> => {
  logger.info(`Generating voucher PDF for order ${orderId}`);
  let browser = null;

  try {
    // Get order details
    const order = await OrderModel.findById(orderId);
    if (!order) {
      throw new AppError('Order not found', 404);
    }

    // Get store details
    const store = await Store.findById(order.voucher.storeId);
    if (!store) {
      throw new AppError('Store not found', 404);
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
    const pdfUrl = `/uploads/vouchers/${pdfFileName}`;

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
      throw new AppError(`Template ${templateNumber} not found`, 404);
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
        ? Object.entries(store.social)
            .filter(([key, value]) => value && key !== 'others')
            .map(([key, value]) => `${key}: ${value}`)
            .join(', ')
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
      return new Promise<void>((resolve) => {
        const checkImages = () => {
          const allImages = document.getElementsByTagName('img');
          const allLoaded = Array.from(allImages).every((img) => img.complete);

          if (allLoaded) {
            resolve();
          } else {
            setTimeout(checkImages, 100);
          }
        };

        checkImages();
      });
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
    if (!pdfBuffer || pdfBuffer.length === 0) {
      throw new AppError('Generated PDF is empty', 500);
    }

    // Verify PDF header
    const pdfHeader = Buffer.from(pdfBuffer).subarray(0, 5).toString('ascii');
    if (!pdfHeader.startsWith('%PDF-')) {
      throw new AppError('Generated file is not a valid PDF', 500);
    }

    // Save PDF locally
    fs.writeFileSync(pdfPath, pdfBuffer);
    logger.info(`PDF saved locally at: ${pdfPath}`);

    // Update order with PDF URL
    const updateData: Partial<IOrder> = {
      pdfUrl: pdfUrl,
      pdfGenerated: true,
    };
    await OrderModel.findByIdAndUpdate(orderId, updateData);

    logger.info(`PDF generated successfully for order ${orderId}`);
    return pdfUrl;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStatus = error instanceof AppError ? error.statusCode : 500;
    logger.error(`Error generating voucher PDF: ${errorMessage}`, error);
    throw new AppError(errorMessage || 'Failed to generate voucher PDF', errorStatus);
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.error('Error closing browser:', errorMessage);
      }
    }
  }
};
