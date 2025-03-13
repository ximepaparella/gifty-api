import { Router } from 'express';
import { ProductController } from './product.controller';
import { ProductService } from '../application/product.service';
import { authenticate } from '@shared/infrastructure/middleware/auth';

const router = Router();
const service = new ProductService();
const controller = new ProductController(service);

router.use(authenticate);

router
  .route('/')
  .get(controller.getProducts)
  .post(controller.createProduct);

router
  .route('/:id')
  .get(controller.getProductById)
  .put(controller.updateProduct)
  .delete(controller.deleteProduct);

router.get('/store/:storeId', controller.getProductsByStoreId);

export const productRoutes = router; 