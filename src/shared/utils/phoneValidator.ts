/**
 * Validates a phone number format
 * Accepts both formats: with country code (+54911683223577) or without (11683223577)
 * @param phone - The phone number to validate
 * @returns Whether the phone number is valid
 */
export const isValidPhoneNumber = (phone: string): boolean => {
  // Accept both formats: with country code (+54911683223577) or without (11683223577)
  const phoneRegex = /^(\+\d{2})?[1-9]\d{9,11}$/;
  return phoneRegex.test(phone);
};

/**
 * Formats a phone number by removing non-digit characters except +
 * @param phone - The phone number to format
 * @returns The formatted phone number
 */
export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-digit characters except +
  const cleaned = phone.replace(/[^\d+]/g, '');
  return cleaned; // Return the number without spaces
};
