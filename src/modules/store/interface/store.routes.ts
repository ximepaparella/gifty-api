import express from 'express';
import { StoreController } from './store.controller';
import { authenticate } from '@shared/infrastructure/middleware/auth';
import { authorize } from '@shared/infrastructure/middleware/authorize';

const router = express.Router();
const storeController = new StoreController();

router
  .route('/')
  .get(authenticate, storeController.getStores)
  .post(authenticate, storeController.createStore);

router
  .route('/owner/:ownerId')
  .get(authenticate, storeController.getStoresByOwnerId);

router
  .route('/:id')
  .get(authenticate, storeController.getStoreById)
  .put(authenticate, storeController.updateStore)
  .delete(authenticate, authorize(['admin']), storeController.deleteStore);

export default router; 