import express from 'express';
import { ProductController } from './product.controller';
import { ProductService } from '../application/product.service';
import { ProductRepository } from '../infrastructure/product.repository';
import { authenticate } from '@shared/infrastructure/middleware/auth';
import { uploadProductImage } from '@shared/infrastructure/services/fileUpload';
import { NextFunction, Request, Response } from 'express';
import logger from '@shared/infrastructure/logging/logger';

const router = express.Router();

// Initialize repository, service, and controller
const productRepository = new ProductRepository();
const productService = new ProductService(productRepository);
const productController = new ProductController(productService);

// Public routes
// Get all products
router.get('/', (req, res, next) => productController.getProducts(req, res, next));

// Get product by ID
router.get('/:id', (req, res, next) => productController.getProductById(req, res, next));

// Get products by store ID
router.get('/store/:storeId', (req, res, next) => productController.getProductsByStoreId(req, res, next));

// Protected routes
router.use(authenticate);

// Helper function to handle file upload and product data
const handleProductUpload = async (req: Request, res: Response, next: NextFunction, controllerMethod: Function) => {
  try {
    await new Promise((resolve, reject) => {
      uploadProductImage(req, res, (err) => {
        if (err) {
          logger.error('File upload error:', err);
          reject(err);
        } else {
          resolve(true);
        }
      });
    });

    // Parse product data if it exists
    if (req.body.data) {
      try {
        const parsedData = JSON.parse(req.body.data);
        req.body = { ...parsedData };
        if (req.file) {
          req.body.imageUrl = req.file.path;
        }
      } catch (error) {
        logger.error('Error parsing product data:', error);
        throw new Error('Invalid product data format');
      }
    }

    // Call the controller method
    return controllerMethod(req, res, next);
  } catch (error: any) {
    logger.error('Product upload handler error:', error);
    return res.status(400).json({
      status: 'error',
      message: error.message || 'Error processing product data'
    });
  }
};

// Create new product with image
router.post('/', (req, res, next) => 
  handleProductUpload(req, res, next, (req: Request, res: Response, next: NextFunction) => 
    productController.createProduct(req, res, next)
  )
);

// Update product with image
router.put('/:id', (req, res, next) => 
  handleProductUpload(req, res, next, (req: Request, res: Response, next: NextFunction) => 
    productController.updateProduct(req, res, next)
  )
);

// Delete product
router.delete('/:id', (req, res, next) => productController.deleteProduct(req, res, next));

// Get product image
router.get('/:id/image', (req, res, next) => productController.getImage(req, res, next));

export { router as productRoutes }; 