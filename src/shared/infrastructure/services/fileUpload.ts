import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import { Request } from 'express';
import logger from '../logging/logger';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || '',
  secure: true
});

// Helper function to sanitize folder names
const sanitizeFolderName = (name: string): string => {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '-');
};

// Configure store logo storage in Cloudinary
const storageForStoreLogo = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req: any, file: any) => {
    try {
      // For store updates (when we have an ID)
      if (req.params && req.params.id) {
        const storeId = req.params.id;
        logger.info('Using existing store ID:', storeId);
        
        return {
          folder: `stores/${storeId}`,
          format: 'jpg',
          public_id: 'logo',
          overwrite: true,
          transformation: [{ 
            width: 500, 
            height: 500, 
            crop: 'limit',
            quality: 'auto',
            fetch_format: 'auto'
          }],
          resource_type: 'auto'
        };
      }
      
      // For new store creation (no ID yet)
      const tempId = Date.now().toString();
      logger.info('Using temporary ID:', tempId);
      
      return {
        folder: 'stores/temp',
        format: 'jpg',
        public_id: `${tempId}-logo`,
        transformation: [{ 
          width: 500, 
          height: 500, 
          crop: 'limit',
          quality: 'auto',
          fetch_format: 'auto'
        }],
        resource_type: 'auto'
      };
    } catch (error) {
      logger.error('Error in storage configuration:', error);
      throw error;
    }
  }
});

// Configure product image storage in Cloudinary
const storageForProductImage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req: any, file: any) => {
    try {
      let storeId = null;
      let folderPath = 'products/temp'; // Default temp folder
      
      logger.info('Request body:', req.body);
      
      // Try to parse storeId from form data
      if (req.body && typeof req.body.data === 'string') {
        try {
          const parsedData = JSON.parse(req.body.data);
          if (parsedData.storeId) {
            storeId = parsedData.storeId;
            folderPath = `stores/${storeId}/products`;
            logger.info('Found storeId in parsed JSON data:', storeId);
          }
        } catch (error) {
          logger.error('Error parsing JSON data:', error);
        }
      }
      
      // If no storeId in JSON, check direct body
      if (!storeId && req.body && req.body.storeId) {
        storeId = req.body.storeId;
        folderPath = `stores/${storeId}/products`;
        logger.info('Found storeId in request body:', storeId);
      }

      // For updates, try to get storeId from existing product
      if (!storeId && req.params && req.params.id) {
        try {
          const existingProduct = await fetch(`${req.protocol}://${req.get('host')}/api/products/${req.params.id}`).then(r => r.json());
          if (existingProduct && existingProduct.data && existingProduct.data.storeId) {
            storeId = existingProduct.data.storeId;
            folderPath = `stores/${storeId}/products`;
            logger.info('Found storeId from existing product:', storeId);
          }
        } catch (error) {
          logger.error('Error fetching existing product:', error);
        }
      }

      // Generate timestamp for unique file naming
      const timestamp = Date.now().toString();
      logger.info('Using folder path:', folderPath);
      
      return {
        folder: folderPath,
        format: 'jpg',
        public_id: `product-${timestamp}`,
        transformation: [{ 
          width: 800, 
          height: 800, 
          crop: 'limit',
          quality: 'auto',
          fetch_format: 'auto'
        }],
        resource_type: 'auto'
      };
    } catch (error) {
      logger.error('Error in product image storage configuration:', error);
      logger.error('Request details:', {
        body: req.body,
        params: req.params
      });
      // Return default configuration instead of throwing
      const timestamp = Date.now().toString();
      return {
        folder: 'products/temp',
        format: 'jpg',
        public_id: `product-${timestamp}`,
        transformation: [{ 
          width: 800, 
          height: 800, 
          crop: 'limit',
          quality: 'auto',
          fetch_format: 'auto'
        }],
        resource_type: 'auto'
      };
    }
  }
});

// Configure voucher PDF storage in Cloudinary
const storageForVoucherPDF = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req: any, file: any) => {
    try {
      // Generate timestamp for unique file naming
      const timestamp = Date.now().toString();
      const folderPath = 'vouchers';
      logger.info('Using voucher folder path:', folderPath);
      
      return {
        folder: folderPath,
        format: 'pdf',
        public_id: `voucher-${timestamp}`,
        resource_type: 'raw' // Important: Use raw for PDFs
      };
    } catch (error) {
      logger.error('Error in voucher PDF storage configuration:', error);
      logger.error('Request details:', {
        body: req.body,
        params: req.params
      });
      throw error;
    }
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

// File filter for PDFs
const pdfFileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Accept PDFs only
  if (!file.originalname.match(/\.pdf$/)) {
    return cb(new Error('Only PDF files are allowed!'));
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
}).single('logo');

export const uploadProductImage = multer({
  storage: storageForProductImage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
}).single('image');

export const uploadVoucherPDF = multer({
  storage: storageForVoucherPDF,
  fileFilter: pdfFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit for PDFs
  }
}).single('pdf');

// Function to delete file from Cloudinary
export const deleteFile = async (publicUrl: string) => {
  try {
    if (!publicUrl) return;

    // Extract public_id from the URL
    const urlParts = publicUrl.split('/');
    const folderAndFile = urlParts.slice(-3); // Get folder structure and filename
    const publicId = folderAndFile.join('/').split('.')[0]; // Remove extension

    logger.info('Attempting to delete file with public_id:', publicId);
    const result = await cloudinary.uploader.destroy(publicId);
    
    if (result.result === 'ok') {
      logger.info(`Successfully deleted file from Cloudinary: ${publicId}`);
    } else {
      logger.error(`Error deleting file from Cloudinary: ${result.result}`);
    }
  } catch (error) {
    logger.error(`Error deleting file from Cloudinary: ${error}`);
  }
};

// Helper function to get Cloudinary URL
export const getCloudinaryUrl = (publicId: string, transformation = {}) => {
  return cloudinary.url(publicId, {
    secure: true,
    transformation
  });
}; 