import { IVoucherInput } from '../domain/voucher.interface';

/**
 * Validates email format
 * @param email Email to validate
 * @returns Boolean indicating if email is valid
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates voucher data
 * @param voucherData The voucher data to validate
 * @returns Array of validation errors, empty if valid
 */
export const validateVoucher = (voucherData: IVoucherInput): string[] => {
  const errors: string[] = [];

  // Required fields
  if (!voucherData.storeId) {
    errors.push('Store ID is required');
  }

  if (!voucherData.productId) {
    errors.push('Product ID is required');
  }

  if (!voucherData.expirationDate) {
    errors.push('Expiration date is required');
  } else {
    // Check if expiration date is in the future
    const expirationDate = new Date(voucherData.expirationDate);
    if (expirationDate <= new Date()) {
      errors.push('Expiration date must be in the future');
    }
  }

  if (!voucherData.sender_name) {
    errors.push('Sender name is required');
  }

  if (!voucherData.sender_email) {
    errors.push('Sender email is required');
  } else if (!isValidEmail(voucherData.sender_email)) {
    errors.push('Sender email is invalid');
  }

  if (!voucherData.receiver_name) {
    errors.push('Receiver name is required');
  }

  if (!voucherData.receiver_email) {
    errors.push('Receiver email is required');
  } else if (!isValidEmail(voucherData.receiver_email)) {
    errors.push('Receiver email is invalid');
  }

  if (!voucherData.message) {
    errors.push('Message is required');
  } else if (voucherData.message.length > 500) {
    errors.push('Message cannot exceed 500 characters');
  }

  if (voucherData.template && !['template1', 'template2', 'template3', 'template4', 'template5'].includes(voucherData.template)) {
    errors.push('Template must be one of: template1, template2, template3, template4, template5');
  }

  // Optional fields validation
  if (voucherData.status && !['active', 'expired', 'redeemed'].includes(voucherData.status)) {
    errors.push('Status must be one of: active, expired, redeemed');
  }

  return errors;
}; 