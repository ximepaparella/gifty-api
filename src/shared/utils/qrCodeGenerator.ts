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
        light: '#ffffff'
      }
    });
    
    return qrCodeDataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
} 