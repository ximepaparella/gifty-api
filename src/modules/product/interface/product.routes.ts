import express from 'express';
import { ProductController } from './product.controller';
import { ProductService } from '../application/product.service';
import { ProductRepository } from '../infrastructure/product.repository';
import { authenticate } from '@shared/infrastructure/middleware/auth';
import { uploadProductImage } from '@shared/infrastructure/services/fileUpload';
import { NextFunction } from 'express';

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

// Create new product with image
router.post('/', (req, res, next) => {
  uploadProductImage(req, res, (err: any) => {
    if (err) {
      return res.status(400).json({
        status: 'error',
        message: `Upload error: ${err.message}`
      });
    }

    // Now that the file is uploaded, parse the product data
    try {
      if (req.body.data) {
        req.body = JSON.parse(req.body.data);
      }
      return productController.createProduct(req, res, next);
    } catch (error) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid product data format'
      });
    }
  });
});

// Update product with image
router.put('/:id', (req, res, next) => {
  uploadProductImage(req, res, (err: any) => {
    if (err) {
      return res.status(400).json({
        status: 'error',
        message: `Upload error: ${err.message}`
      });
    }

    // Now that the file is uploaded, parse the product data
    try {
      if (req.body.data) {
        req.body = JSON.parse(req.body.data);
      }
      return productController.updateProduct(req, res, next);
    } catch (error) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid product data format'
      });
    }
  });
});

// Delete product
router.delete('/:id', (req, res, next) => productController.deleteProduct(req, res, next));

// Get product image
router.get('/:id/image', (req, res, next) => productController.getImage(req, res, next));

export { router as productRoutes }; 