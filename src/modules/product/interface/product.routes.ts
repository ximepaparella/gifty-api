import express from 'express';
import { ProductController } from './product.controller';
import { ProductService } from '../application/product.service';
import { ProductRepository } from '../infrastructure/product.repository';
import { authenticate } from '@shared/infrastructure/middleware/auth';
import { uploadProductImage } from '@shared/infrastructure/services/fileUpload';

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

// Create new product with image
router.post('/', uploadProductImage.single('image'), (req, res, next) => 
  productController.createProduct(req, res, next)
);

// Protected routes
router.use(authenticate);

// Update product with image
router.put('/:id', uploadProductImage.single('image'), (req, res, next) => 
  productController.updateProduct(req, res, next)
);

// Delete product
router.delete('/:id', (req, res, next) => productController.deleteProduct(req, res, next));

// Get product image
router.get('/:id/image', (req, res, next) => productController.getImage(req, res, next));

export { router as productRoutes }; 