import { Router } from 'express';
import { ProductController } from './product.controller';
import { ProductService } from '../application/product.service';
import { authenticate } from '@shared/infrastructure/middleware/auth';

const router = Router();
const service = new ProductService();
const controller = new ProductController(service);

// Public routes (no authentication required)
router.get('/', controller.getProducts);
router.get('/store/:storeId', controller.getProductsByStoreId);
router.get('/:id', controller.getProductById);

// Protected routes (authentication required)
router.use(authenticate);

router
  .route('/')
  .post(controller.createProduct);

router
  .route('/:id')
  .put(controller.updateProduct)
  .delete(controller.deleteProduct);

export const productRoutes = router; 