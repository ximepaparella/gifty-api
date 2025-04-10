import { IOrderInput } from '../domain/order.interface';
import { isValidEmail } from '@modules/voucher/application/voucher.validator';

/**
 * Validates order data
 * @param orderData The order data to validate
 * @returns Array of validation errors, empty if valid
 */
export const validateOrder = (orderData: IOrderInput): string[] => {
  const errors: string[] = [];

  // Validate customerId
  if (!orderData.customerId) {
    errors.push('Customer ID is required');
  }

  // Validate payment details
  if (!orderData.paymentDetails) {
    errors.push('Payment details are required');
  } else {
    // Check paymentId
    if (!orderData.paymentDetails.paymentId) {
      errors.push('Payment ID is required');
    }

    // Check paymentEmail
    if (!orderData.paymentDetails.paymentEmail) {
      errors.push('Payment email is required');
    } else if (!isValidEmail(orderData.paymentDetails.paymentEmail)) {
      errors.push('Payment email is invalid');
    }

    // Check amount
    if (orderData.paymentDetails.amount === undefined) {
      errors.push('Payment amount is required');
    } else if (orderData.paymentDetails.amount < 0.01) {
      errors.push('Payment amount must be at least 0.01');
    }

    // Check provider
    if (!orderData.paymentDetails.provider) {
      errors.push('Payment provider is required');
    } else if (!['mercadopago', 'paypal', 'stripe'].includes(orderData.paymentDetails.provider)) {
      errors.push('Payment provider must be mercadopago, paypal, or stripe');
    }
  }

  // Validate voucher details
  if (!orderData.voucher) {
    errors.push('Voucher details are required');
  } else {
    // Check storeId
    if (!orderData.voucher.storeId) {
      errors.push('Store ID is required');
    }

    // Check productId
    if (!orderData.voucher.productId) {
      errors.push('Product ID is required');
    }

    // Check expirationDate
    if (!orderData.voucher.expirationDate) {
      errors.push('Expiration date is required');
    } else {
      // Check if expiration date is in the future
      const expirationDate = new Date(orderData.voucher.expirationDate);
      if (expirationDate <= new Date()) {
        errors.push('Expiration date must be in the future');
      }
    }

    // Check senderName
    if (!orderData.voucher.senderName) {
      errors.push('Sender name is required');
    }

    // Check senderEmail
    if (!orderData.voucher.senderEmail) {
      errors.push('Sender email is required');
    } else if (!isValidEmail(orderData.voucher.senderEmail)) {
      errors.push('Sender email is invalid');
    }

    // Check receiverName
    if (!orderData.voucher.receiverName) {
      errors.push('Receiver name is required');
    }

    // Check receiverEmail
    if (!orderData.voucher.receiverEmail) {
      errors.push('Receiver email is required');
    } else if (!isValidEmail(orderData.voucher.receiverEmail)) {
      errors.push('Receiver email is invalid');
    }

    // Check message
    if (!orderData.voucher.message) {
      errors.push('Message is required');
    } else if (orderData.voucher.message.length > 500) {
      errors.push('Message cannot exceed 500 characters');
    }

    // Check template
    if (!orderData.voucher.template) {
      errors.push('Template is required');
    } else if (
      ![
        'template1',
        'template2',
        'template3',
        'template4',
        'template5',
        'birthday',
        'christmas',
        'valentine',
        'general',
      ].includes(orderData.voucher.template)
    ) {
      errors.push('Template must be a valid template type');
    }
  }

  return errors;
};
