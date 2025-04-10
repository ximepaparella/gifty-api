import crypto from 'crypto';

/**
 * Generates a random voucher code with specified length
 * @param length The length of the code to generate (default: 16)
 * @returns A random alphanumeric code
 */
export const generateVoucherCode = (length: number = 16): string => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';

  // Use crypto for secure random number generation
  const randomBytes = crypto.randomBytes(length);

  for (let i = 0; i < length; i++) {
    const randomIndex = randomBytes[i] % characters.length;
    result += characters.charAt(randomIndex);
  }

  return result;
};

/**
 * Generates a random code of specified length
 * @param length The length of the code to generate
 * @returns A random alphanumeric code
 */
export const generateRandomCode = (length: number = 16): string => {
  return generateVoucherCode(length);
};
