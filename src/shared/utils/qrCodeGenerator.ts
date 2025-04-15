import QRCode from 'qrcode';
import { ErrorTypes } from '@shared/types/appError';
import { logger } from '@shared/infrastructure/logging/logger';

/**
 * Generate a QR code from text
 * @param text The text to encode in the QR code
 * @returns Promise<string> The QR code as a data URL
 */
export async function generateQRCode(text: string): Promise<string> {
  try {
    logger.info('Generating QR code');
    const qrCode = await QRCode.toDataURL(text, {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 300,
    });
    logger.info('QR code generated successfully');
    return qrCode;
  } catch (error) {
    logger.error('Error generating QR code:', error);
    throw ErrorTypes.INTERNAL('Failed to generate QR code');
  }
}

/**
 * Generate a QR code for voucher redemption
 * @param code The voucher code
 * @returns Promise<string> The QR code as a data URL
 */
export async function generateVoucherRedemptionQRCode(code: string): Promise<string> {
  try {
    logger.info(`Generating redemption QR code for voucher code ${code}`);
    const redemptionData = {
      code,
      timestamp: Date.now(),
    };

    const qrCode = await QRCode.toDataURL(JSON.stringify(redemptionData), {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 300,
    });

    logger.info('Redemption QR code generated successfully');
    return qrCode;
  } catch (error) {
    logger.error('Error generating voucher redemption QR code:', error);
    throw ErrorTypes.INTERNAL('Failed to generate voucher redemption QR code');
  }
}
