import express from 'express';
import { ProductController } from './product.controller';
import { ProductService } from '../application/product.service';
import { ProductRepository } from '../infrastructure/product.repository';
import { authenticate } from '@shared/infrastructure/middleware/auth';
import { uploadProductImage } from '@shared/infrastructure/services/fileUpload';
import { NextFunction, Request, Response } from 'express';
import { ErrorTypes } from '@shared/types/appError';
import { logger } from '@shared/infrastructure/logging/logger';

export const productRouter = express.Router();

// Initialize repository, service, and controller
const productRepository = new ProductRepository();
const productService = new ProductService(productRepository);
const productController = new ProductController(productService);

// Public routes
// Get all products
productRouter.get('/', (req, res, next) => productController.getProducts(req, res, next));

// Get product by ID
productRouter.get('/:id', (req, res, next) => productController.getProductById(req, res, next));

// Get products by store ID
productRouter.get('/store/:storeId', (req, res, next) =>
  productController.getProductsByStoreId(req, res, next)
);

// Protected routes
productRouter.use(authenticate);

// Upload product image
productRouter.post(
  '/:id/image',
  uploadProductImage,
  (req, res, next) => productController.uploadImage(req, res, next)
);

// Create new product with image
productRouter.post('/', (req, res, next) => {
  logger.info('Product creation request received:', {
    body: req.body,
    files: req.files,
    file: req.file,
    headers: req.headers,
  });

  handleProductUpload(req, res, next, (req: Request, res: Response, next: NextFunction) => {
    logger.info('Product upload handler completed, calling controller:', {
      body: req.body,
      file: req.file,
    });
    return productController.createProduct(req, res, next);
  });
});

// Helper function to handle file upload and product data
const handleProductUpload = async (
  req: Request,
  res: Response,
  next: NextFunction,
  controllerMethod: Function
) => {
  try {
    logger.info('Starting product upload handler');
    logger.info('Original request:', {
      body: req.body,
      files: req.files,
      file: req.file,
      contentType: req.headers['content-type'],
    });

    // Handle file upload first
    await new Promise((resolve, reject) => {
      logger.info('Starting file upload middleware');
      uploadProductImage(req, res, (err) => {
        if (err) {
          logger.error('File upload error:', err);
          reject(err);
        } else {
          logger.info('File upload middleware completed:', {
            file: req.file,
            body: req.body,
          });
          resolve(true);
        }
      });
    });

    logger.info('After upload middleware:', {
      body: req.body,
      file: req.file,
    });

    // Keep the original request body
    const originalBody = { ...req.body };
    logger.info('Original request body:', originalBody);

    // Parse product data if it exists
    if (originalBody.data) {
      try {
        const parsedData = JSON.parse(originalBody.data);
        logger.info('Parsed product data:', parsedData);

        // Merge parsed data with original body
        req.body = {
          ...parsedData,
        };

        // Add file information if present
        if (req.file) {
          logger.info('File upload successful:', {
            originalname: req.file.originalname,
            path: req.file.path,
            mimetype: req.file.mimetype,
            size: req.file.size,
          });
          // Make sure we're using the secure_url from Cloudinary
          req.body.image = req.file.path;
          logger.info('Added image path to request body:', req.body.image);
        } else {
          logger.info('No file uploaded with request');
          // Only set image to null if it's explicitly being removed
          if (Object.hasOwn(parsedData, 'image') && !parsedData.image) {
            req.body.image = null;
            logger.info('Setting image to null as per request');
          }
        }
      } catch (error) {
        logger.error('Error parsing product data:', error);
        throw ErrorTypes.BAD_REQUEST('Invalid product data format');
      }
    } else {
      logger.warn('No product data found in request body');
    }

    logger.info('Final request body before controller:', req.body);
    // Call the controller method
    return controllerMethod(req, res, next);
  } catch (error: any) {
    logger.error('Product upload handler error:', error);
    return res.status(400).json({
      status: 'error',
      message: error.message || 'Error processing product data',
    });
  }
};

// Update product with image
productRouter.put('/:id', (req, res, next) =>
  handleProductUpload(req, res, next, (req: Request, res: Response, next: NextFunction) =>
    productController.updateProduct(req, res, next)
  )
);

// Delete product
productRouter.delete('/:id', (req, res, next) => productController.deleteProduct(req, res, next));

// Get product image
productRouter.get('/:id/image', (req, res, next) => productController.getImage(req, res, next));
