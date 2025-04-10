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
  secure: true,
});

// Helper function to sanitize folder names
const sanitizeFolderName = (name: string): string => {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '-');
};

// Helper function to delete a file from Cloudinary
export const deleteFile = async (fileUrl: string): Promise<void> => {
  try {
    logger.info('Attempting to delete file:', fileUrl);

    // Extract public ID from Cloudinary URL
    const urlParts = fileUrl.split('/');
    const publicIdWithExtension = urlParts.slice(-2).join('/').split('.')[0];
    logger.info('Extracted public ID:', publicIdWithExtension);

    // Delete the file
    const result = await cloudinary.uploader.destroy(publicIdWithExtension);
    logger.info('Cloudinary delete result:', result);

    if (result.result === 'ok') {
      logger.info('File deleted successfully');
    } else {
      logger.warn('Unexpected delete result:', result);
    }
  } catch (error) {
    logger.error('Error deleting file from Cloudinary:', error);
    throw error;
  }
};

// Configure store logo storage in Cloudinary
const storageForStoreLogo = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req: any, file: any) => {
    try {
      logger.info('Configuring store logo upload:', {
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        params: req.params,
      });

      // For store updates (when we have an ID)
      if (req.params && req.params.id) {
        const storeId = req.params.id;
        logger.info('Using existing store ID for logo:', storeId);

        const config = {
          folder: `stores/${storeId}`,
          format: 'jpg',
          public_id: 'logo',
          overwrite: true,
          transformation: [
            {
              width: 500,
              height: 500,
              crop: 'limit',
              quality: 'auto',
              fetch_format: 'auto',
            },
          ],
          resource_type: 'auto',
        };
        logger.info('Store logo config for existing store:', config);
        return config;
      }

      // For new store creation (no ID yet)
      const tempId = Date.now().toString();
      logger.info('Using temporary ID for new store logo:', tempId);

      const config = {
        folder: 'stores/temp',
        format: 'jpg',
        public_id: `${tempId}-logo`,
        transformation: [
          {
            width: 500,
            height: 500,
            crop: 'limit',
            quality: 'auto',
            fetch_format: 'auto',
          },
        ],
        resource_type: 'auto',
      };
      logger.info('Store logo config for new store:', config);
      return config;
    } catch (error) {
      logger.error('Error in store logo storage configuration:', error);
      throw error;
    }
  },
});

// Configure product image storage in Cloudinary
const storageForProductImage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req: any, file: any) => {
    try {
      logger.info('Starting product image upload configuration');
      logger.info('File details:', {
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        fieldname: file.fieldname,
      });

      let storeId = null;
      let folderPath = 'products/temp'; // Default temp folder

      // Log raw request body
      logger.info('Raw request body:', req.body);

      // Try to parse storeId from form data
      if (req.body && typeof req.body.data === 'string') {
        try {
          const parsedData = JSON.parse(req.body.data);
          logger.info('Successfully parsed product data:', parsedData);
          if (parsedData.storeId) {
            storeId = parsedData.storeId;
            folderPath = `stores/${storeId}/products`;
            logger.info('Using store-specific folder path:', folderPath);
          }
        } catch (error) {
          logger.error('Error parsing product data:', error);
          logger.error('Raw data that failed to parse:', req.body.data);
        }
      }

      // If no storeId in JSON, check direct body
      if (!storeId && req.body && req.body.storeId) {
        storeId = req.body.storeId;
        folderPath = `stores/${storeId}/products`;
        logger.info('Using store ID from direct body:', storeId);
      }

      // For updates, try to get storeId from existing product
      if (!storeId && req.params && req.params.id) {
        try {
          const productId = req.params.id;
          logger.info('Attempting to fetch existing product:', productId);

          const existingProduct = await fetch(
            `${req.protocol}://${req.get('host')}/api/products/${productId}`
          ).then((r) => r.json());

          logger.info('Fetched existing product:', existingProduct);

          if (existingProduct?.data?.storeId) {
            storeId = existingProduct.data.storeId;
            folderPath = `stores/${storeId}/products`;
            logger.info('Using store ID from existing product:', storeId);
          }
        } catch (error) {
          logger.error('Error fetching existing product:', error);
          // Continue with default folder path
        }
      }

      // Generate unique filename
      const timestamp = Date.now();
      const uniqueFilename = `product-${timestamp}`;

      logger.info('Generated unique filename:', uniqueFilename);
      logger.info('Final folder path:', folderPath);

      const config = {
        folder: folderPath,
        format: 'jpg',
        public_id: uniqueFilename,
        transformation: [
          {
            width: 800,
            height: 800,
            crop: 'limit',
            quality: 'auto',
            fetch_format: 'auto',
          },
        ],
        resource_type: 'auto',
        use_filename: true,
        unique_filename: true,
        overwrite: true,
        invalidate: true,
      };

      logger.info('Final upload configuration:', config);
      return config;
    } catch (error) {
      logger.error('Error in product image storage configuration:', error);
      // Return default configuration instead of throwing
      const timestamp = Date.now();
      const defaultConfig = {
        folder: 'products/temp',
        format: 'jpg',
        public_id: `product-${timestamp}`,
        transformation: [
          {
            width: 800,
            height: 800,
            crop: 'limit',
            quality: 'auto',
            fetch_format: 'auto',
          },
        ],
        resource_type: 'auto',
        use_filename: true,
        unique_filename: true,
        overwrite: true,
        invalidate: true,
      };
      logger.info('Using default configuration due to error:', defaultConfig);
      return defaultConfig;
    }
  },
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
        resource_type: 'raw', // Important: Use raw for PDFs
      };
    } catch (error) {
      logger.error('Error in voucher PDF storage configuration:', error);
      logger.error('Request details:', {
        body: req.body,
        params: req.params,
      });
      throw error;
    }
  },
});

// File size limits
const MAX_FILE_SIZE = {
  IMAGE: 5 * 1024 * 1024, // 5MB for images
  PDF: 10 * 1024 * 1024, // 10MB for PDFs
};

// Allowed MIME types
const ALLOWED_MIME_TYPES = {
  IMAGE: ['image/jpeg', 'image/png', 'image/webp'],
  PDF: ['application/pdf'],
};

// File filter for images
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Check file size
  if (file.size > MAX_FILE_SIZE.IMAGE) {
    cb(new Error(`File size too large. Maximum size is ${MAX_FILE_SIZE.IMAGE / (1024 * 1024)}MB`));
    return;
  }

  // Check MIME type
  if (!ALLOWED_MIME_TYPES.IMAGE.includes(file.mimetype)) {
    cb(new Error('File type not allowed. Only JPEG, PNG and WebP images are allowed.'));
    return;
  }

  cb(null, true);
};

// File filter for PDFs
const pdfFileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Check file size
  if (file.size > MAX_FILE_SIZE.PDF) {
    cb(new Error(`File size too large. Maximum size is ${MAX_FILE_SIZE.PDF / (1024 * 1024)}MB`));
    return;
  }

  // Check MIME type
  if (!ALLOWED_MIME_TYPES.PDF.includes(file.mimetype)) {
    cb(new Error('File type not allowed. Only PDF files are allowed.'));
    return;
  }

  cb(null, true);
};

// Create multer upload instances with size limits
export const uploadStoreLogo = multer({
  storage: storageForStoreLogo,
  fileFilter: fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE.IMAGE,
    files: 1,
  },
}).single('logo');

export const uploadProductImage = multer({
  storage: storageForProductImage,
  fileFilter: fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE.IMAGE,
    files: 1,
  },
}).single('image');

export const uploadVoucherPDF = multer({
  storage: storageForVoucherPDF,
  fileFilter: pdfFileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE.PDF,
    files: 1,
  },
}).single('pdf');

// Helper function to get Cloudinary URL
export const getCloudinaryUrl = (publicId: string, transformation = {}) => {
  return cloudinary.url(publicId, {
    secure: true,
    transformation,
  });
};
