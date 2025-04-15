import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { AppError, ErrorTypes } from '@shared/types/appError';
import { logger } from '@shared/infrastructure/logging/logger';

/**
 * Download a PDF file from a URL and save it to a temporary file
 * @param url The URL of the PDF to download
 * @param outputPath The path where to save the PDF
 */
export async function downloadPDF(url: string, outputPath: string): Promise<void> {
  let tempFile: string | null = null;

  try {
    logger.info(`Downloading PDF from ${url}`);

    // Create temporary file path
    const tempDir = path.dirname(outputPath);
    tempFile = path.join(tempDir, `temp_${Date.now()}.pdf`);

    // Download file
    const response = await axios.get<ArrayBuffer>(url, {
      responseType: 'arraybuffer',
    });

    const buffer = Buffer.from(response.data);

    // Check if it's a PDF
    const fileHeader = buffer.slice(0, 5).toString();
    if (!fileHeader.startsWith('%PDF-')) {
      throw ErrorTypes.BAD_REQUEST('Downloaded file is not a PDF');
    }

    // Check if file is not empty
    if (!buffer || buffer.length === 0) {
      throw ErrorTypes.BAD_REQUEST('Downloaded PDF is empty');
    }

    // Save to temporary file
    await fs.promises.writeFile(tempFile, buffer);

    // Move to final location
    await fs.promises.rename(tempFile, outputPath);

    logger.info('PDF downloaded and saved successfully');
  } catch (error: any) {
    logger.error('Error downloading PDF:', error);

    // Clean up temp file if it exists
    if (tempFile && fs.existsSync(tempFile)) {
      try {
        await fs.promises.unlink(tempFile);
      } catch (cleanupError) {
        logger.warn('Failed to clean up temporary file:', cleanupError);
      }
    }

    if (error instanceof AppError) {
      throw error;
    }

    throw ErrorTypes.INTERNAL(`Failed to download PDF: ${error.message}`);
  }
}

/**
 * Clean up temporary PDF files
 * @param filePath The path of the file to clean up
 */
export async function cleanupPDF(filePath: string): Promise<void> {
  try {
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
      logger.info(`Cleaned up PDF file: ${filePath}`);
    }
  } catch (error) {
    // Log but don't throw error as this is cleanup
    logger.warn(`Failed to clean up PDF file ${filePath}:`, error);
  }
}
