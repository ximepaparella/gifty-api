import { sendEmail } from '@shared/utils/email';
import { IOrder } from '../domain/order.interface';
import logger from '@shared/infrastructure/logging/logger';
import mongoose from 'mongoose';
import fs from 'fs';

/**
 * Send email to store with voucher attached
 * @param order - Order data
 * @param store - Store data
 * @param pdfPath - Path to the voucher PDF
 */
export const sendStoreEmail = async (
  order: IOrder,
  store: any,
  pdfPath: string
): Promise<void> => {
  try {
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
          <li><strong>Amount:</strong> $${order.paymentDetails.amount}</li>
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
  } catch (error: any) {
    logger.error(`Error sending email to store: ${error.message}`, error);
    throw new Error(`Failed to send email to store: ${error.message}`);
  }
};

/**
 * Send email to receiver with voucher attached
 * @param order - Order data
 * @param pdfPath - Path to the voucher PDF
 */
export const sendReceiverEmail = async (
  order: IOrder,
  pdfPath: string
): Promise<void> => {
  try {
    logger.info(`Sending receiver email for order ${order._id} to ${order.voucher.receiverEmail}`);
    
    await sendEmail({
      to: order.voucher.receiverEmail,
      subject: `You've received a gift voucher from ${order.voucher.senderName}!`,
      html: `
        <h1>You've Received a Gift Voucher!</h1>
        <p>Hello ${order.voucher.receiverName},</p>
        <p>${order.voucher.senderName} has sent you a gift voucher with the following message:</p>
        <blockquote style="border-left: 4px solid #ccc; padding-left: 16px; margin-left: 0; font-style: italic;">
          "${order.voucher.message}"
        </blockquote>
        <p>Your voucher code is: <strong>${order.voucher.code}</strong></p>
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
  } catch (error: any) {
    logger.error(`Error sending email to receiver: ${error.message}`, error);
    throw new Error(`Failed to send email to receiver: ${error.message}`);
  }
};

/**
 * Send email to customer with voucher attached
 * @param order - Order data
 * @param pdfPath - Path to the voucher PDF
 */
export const sendCustomerEmail = async (
  order: IOrder,
  pdfPath: string
): Promise<void> => {
  try {
    logger.info(`Sending customer confirmation email for order ${order._id} to ${order.paymentDetails.paymentEmail}`);
    
    await sendEmail({
      to: order.paymentDetails.paymentEmail,
      subject: 'Your Gift Voucher Purchase Confirmation',
      html: `
        <h1>Gift Voucher Purchase Confirmation</h1>
        <p>Hello ${order.voucher.senderName},</p>
        <p>Thank you for your purchase! Your gift voucher has been created successfully.</p>
        <h2>Voucher Details:</h2>
        <ul>
          <li><strong>Voucher Code:</strong> ${order.voucher.code}</li>
          <li><strong>Recipient:</strong> ${order.voucher.receiverName}</li>
          <li><strong>Amount:</strong> $${order.paymentDetails.amount}</li>
          <li><strong>Expiration Date:</strong> ${new Date(order.voucher.expirationDate).toLocaleDateString()}</li>
        </ul>
        <p>The voucher has been sent to ${order.voucher.receiverEmail} and is also attached to this email.</p>
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

    logger.info(`Email sent to customer: ${order.paymentDetails.paymentEmail}`);
  } catch (error: any) {
    logger.error(`Error sending email to customer: ${error.message}`, error);
    throw new Error(`Failed to send email to customer: ${error.message}`);
  }
};

/**
 * Send all emails for a voucher order
 * @param order - Order data
 * @param pdfPath - Path to the voucher PDF
 */
export const sendAllVoucherEmails = async (
  orderId: string,
  pdfPath: string
): Promise<boolean> => {
  try {
    logger.info(`Sending all voucher emails for order: ${orderId}`);
    
    // Get order data
    const Order = mongoose.model('Order');
    const order = await Order.findById(orderId);
    if (!order) {
      throw new Error(`Order not found with ID: ${orderId}`);
    }
    
    // Get store information
    const Store = mongoose.model('Store');
    const store = await Store.findById(order.voucher.storeId);
    if (!store) {
      throw new Error(`Store not found with ID: ${order.voucher.storeId}`);
    }

    // Check if PDF exists
    if (!fs.existsSync(pdfPath)) {
      throw new Error(`PDF file not found at path: ${pdfPath}`);
    }

    // Send emails with error handling for each
    const results = await Promise.allSettled([
      sendStoreEmail(order, store, pdfPath),
      sendReceiverEmail(order, pdfPath),
      sendCustomerEmail(order, pdfPath)
    ]);

    // Check for any failures
    const failures = results.filter(result => result.status === 'rejected');
    if (failures.length > 0) {
      logger.warn(`${failures.length} out of 3 emails failed to send for order ${orderId}`);
      failures.forEach((failure, index) => {
        if (failure.status === 'rejected') {
          logger.error(`Email ${index} failed:`, (failure as PromiseRejectedResult).reason);
        }
      });
      
      // If all emails failed, throw an error
      if (failures.length === 3) {
        throw new Error('All emails failed to send');
      }
    } else {
      logger.info(`All emails sent successfully for order: ${orderId}`);
    }
    
    // Mark emails as sent in the order
    await Order.findByIdAndUpdate(orderId, {
      $set: {
        emailsSent: true,
        updatedAt: new Date()
      }
    });
    
    return true;
  } catch (error: any) {
    logger.error(`Error sending voucher emails for order ${orderId}: ${error.message}`, error);
    return false;
  }
};

/**
 * Resend voucher email only to the customer
 * @param orderId - Order ID
 * @param pdfPath - Path to the voucher PDF
 * @returns true if successful, false otherwise
 */
export const resendCustomerEmail = async (
  orderId: string,
  pdfPath: string
): Promise<boolean> => {
  try {
    logger.info(`Resending customer voucher email for order: ${orderId}`);
    
    // Get order data
    const Order = mongoose.model('Order');
    const order = await Order.findById(orderId);
    if (!order) {
      throw new Error(`Order not found with ID: ${orderId}`);
    }

    // Check if PDF exists
    if (!fs.existsSync(pdfPath)) {
      throw new Error(`PDF file not found at path: ${pdfPath}`);
    }

    // Send email to customer
    await sendCustomerEmail(order, pdfPath);
    
    logger.info(`Customer email resent successfully for order: ${orderId}`);
    return true;
  } catch (error: any) {
    logger.error(`Error resending customer email for order ${orderId}: ${error.message}`, error);
    return false;
  }
};

/**
 * Resend voucher email only to the receiver
 * @param orderId - Order ID
 * @param pdfPath - Path to the voucher PDF
 * @returns true if successful, false otherwise
 */
export const resendReceiverEmail = async (
  orderId: string,
  pdfPath: string
): Promise<boolean> => {
  try {
    logger.info(`Resending receiver voucher email for order: ${orderId}`);
    
    // Get order data
    const Order = mongoose.model('Order');
    const order = await Order.findById(orderId);
    if (!order) {
      throw new Error(`Order not found with ID: ${orderId}`);
    }

    // Check if PDF exists
    if (!fs.existsSync(pdfPath)) {
      throw new Error(`PDF file not found at path: ${pdfPath}`);
    }

    // Send email to receiver
    await sendReceiverEmail(order, pdfPath);
    
    logger.info(`Receiver email resent successfully for order: ${orderId}`);
    return true;
  } catch (error: any) {
    logger.error(`Error resending receiver email for order ${orderId}: ${error.message}`, error);
    return false;
  }
};

/**
 * Resend voucher email only to the store
 * @param orderId - Order ID
 * @param pdfPath - Path to the voucher PDF
 * @returns true if successful, false otherwise
 */
export const resendStoreEmail = async (
  orderId: string,
  pdfPath: string
): Promise<boolean> => {
  try {
    logger.info(`Resending store voucher email for order: ${orderId}`);
    
    // Get order data
    const Order = mongoose.model('Order');
    const order = await Order.findById(orderId);
    if (!order) {
      throw new Error(`Order not found with ID: ${orderId}`);
    }

    // Get store information
    const Store = mongoose.model('Store');
    const store = await Store.findById(order.voucher.storeId);
    if (!store) {
      throw new Error(`Store not found with ID: ${order.voucher.storeId}`);
    }

    // Check if PDF exists
    if (!fs.existsSync(pdfPath)) {
      throw new Error(`PDF file not found at path: ${pdfPath}`);
    }

    // Send email to store
    await sendStoreEmail(order, store, pdfPath);
    
    logger.info(`Store email resent successfully for order: ${orderId}`);
    return true;
  } catch (error: any) {
    logger.error(`Error resending store email for order ${orderId}: ${error.message}`, error);
    return false;
  }
}; 