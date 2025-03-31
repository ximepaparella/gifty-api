import { Router } from 'express';
import { StoreController } from './store.controller';
import { authenticate } from '@shared/infrastructure/middleware/auth';
import { authorize } from '@shared/infrastructure/middleware/authorize';

const router = Router();
const storeController = new StoreController();

// Public routes (no authentication required)
router.get('/', storeController.getStores);
router.get('/:id', storeController.getStoreById);

// Protected routes (authentication required)
router.use(authenticate);

router
  .route('/')
  .post(storeController.createStore);

router
  .route('/owner/:ownerId')
  .get(storeController.getStoresByOwnerId);

router
  .route('/:id')
  .put(storeController.updateStore)
  .delete(authorize(['admin']), storeController.deleteStore);

export const storeRoutes = router; 