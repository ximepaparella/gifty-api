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

// Configure product image storage
const storageForProductImage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    const storeName = req.body.storeName || 'default';
    const uploadPath = path.join(__dirname, '../../../../uploads', storeName, 'products');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req: Request, file: Express.Multer.File, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `product-${Date.now()}${ext}`;
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

// Create multer upload instances
export const uploadStoreLogo = multer({
  storage: storageForStoreLogo,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

export const uploadProductImage = multer({
  storage: storageForProductImage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Function to delete old file if it exists
export const deleteOldFile = async (filePath: string) => {
  try {
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
      logger.info(`Deleted old file: ${filePath}`);
    }
  } catch (error) {
    logger.error(`Error deleting old file: ${error}`);
  }
}; 