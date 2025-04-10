import QRCode from 'qrcode';

/**
 * Generates a QR code as a data URL for the given content
 * @param content The content to encode in the QR code
 * @returns A Promise that resolves to a data URL string
 */
export async function generateQRCode(content: string): Promise<string> {
  try {
    // Generate QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(content, {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 300,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    });

    return qrCodeDataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
}

/**
 * Generate a QR code for voucher redemption
 * @param voucherCode The voucher code to be redeemed
 * @returns A Promise that resolves to a data URL string of the QR code
 */
export async function generateVoucherRedemptionQRCode(voucherCode: string): Promise<string> {
  try {
    // Generate the redemption URL using the voucher code
    const redemptionUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/vouchers/redeem/${voucherCode}`;

    // Generate QR code for the redemption URL
    return await generateQRCode(redemptionUrl);
  } catch (error) {
    console.error('Error generating voucher redemption QR code:', error);
    throw new Error('Failed to generate voucher redemption QR code');
  }
}
