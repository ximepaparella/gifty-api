/**
 * Generates a random voucher code with the specified length
 * @param length The length of the code to generate (default: 8)
 * @returns A random alphanumeric code
 */
export const generateVoucherCode = (length: number = 8): string => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }
  
  return result;
}; 