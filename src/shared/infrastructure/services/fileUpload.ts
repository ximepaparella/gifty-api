import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { Request } from 'express';
import logger from '../logging/logger';

// Configure store logo storage
const storageForStoreLogo = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    const storeName = req.params.storeName || 'default';
    const uploadPath = path.join(__dirname, '../../../../uploads', storeName, 'logo');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req: Request, file: Express.Multer.File, cb) => {
    // Get file extension
    const ext = path.extname(file.originalname);
    // Create filename: store-logo-timestamp.ext
    const filename = `store-logo-${Date.now()}${ext}`;
    cb(null, filename);
  }
});

// File filter for images
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Accept images only
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
    return cb(new Error('Only image files are allowed!'));
  }
  cb(null, true);
};

// Create multer upload instance for store logos
export const uploadStoreLogo = multer({
  storage: storageForStoreLogo,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Function to delete old logo if it exists
export const deleteOldLogo = async (logoPath: string) => {
  try {
    if (fs.existsSync(logoPath)) {
      await fs.promises.unlink(logoPath);
      logger.info(`Deleted old logo: ${logoPath}`);
    }
  } catch (error) {
    logger.error(`Error deleting old logo: ${error}`);
  }
}; 