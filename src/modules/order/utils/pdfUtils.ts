import fs from 'fs';
import path from 'path';
import axios from 'axios';
import winston from 'winston';

// Create logger instance
const logger = winston.createLogger({
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
    }),
  ],
});

/**
 * Downloads a PDF from a URL and verifies it
 */
export const downloadAndVerifyPDF = async (
  pdfUrl: string,
  voucherCode: string
): Promise<string> => {
  try {
    logger.info(`Downloading PDF from ${pdfUrl}`);

    // Create temp directory if it doesn't exist
    const tempDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Generate temp file path
    const tempFilePath = path.join(tempDir, `voucher-${voucherCode}-${Date.now()}.pdf`);

    // Download the file
    const response = await axios({
      method: 'GET',
      url: pdfUrl,
      responseType: 'arraybuffer',
      headers: {
        Accept: 'application/pdf',
      },
    });

    // Verify the response is a PDF
    const contentType = response.headers['content-type'];
    if (!contentType || !contentType.includes('application/pdf')) {
      throw new Error('Downloaded file is not a PDF');
    }

    // Write to temp file
    fs.writeFileSync(tempFilePath, response.data as Buffer);

    // Verify file exists and is not empty
    const stats = fs.statSync(tempFilePath);
    if (stats.size === 0) {
      throw new Error('Downloaded PDF is empty');
    }

    logger.info(`PDF downloaded successfully to ${tempFilePath}`);
    return tempFilePath;
  } catch (error: any) {
    logger.error(`Error downloading PDF: ${error.message}`, error);
    throw new Error(`Failed to download PDF: ${error.message}`);
  }
};

/**
 * Cleans up a temporary PDF file
 */
export const cleanupTempPDF = async (filePath: string): Promise<void> => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      logger.info(`Cleaned up temporary PDF file: ${filePath}`);
    }
  } catch (error: any) {
    logger.error(`Error cleaning up PDF file: ${error.message}`, error);
    // Don't throw error here as this is cleanup
  }
};
