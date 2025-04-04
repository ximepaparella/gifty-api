import express from 'express';
import { StoreController } from './store.controller';
import { StoreService } from '../application/store.service';
import { StoreRepository } from '../infrastructure/store.repository';
import { authenticate } from '@shared/infrastructure/middleware/auth';
import { uploadStoreLogo } from '@shared/infrastructure/services/fileUpload';

const router = express.Router();

// Initialize repository, service, and controller
const storeRepository = new StoreRepository();
const storeService = new StoreService(storeRepository);
const storeController = new StoreController(storeService);

// Public routes
// Get all stores
router.get('/', (req, res, next) => storeController.getStores(req, res, next));

// Get store by ID
router.get('/:id', (req, res, next) => storeController.getStoreById(req, res, next));

// Get store logo
router.get('/:id/logo', (req, res, next) => storeController.getLogo(req, res, next));

// Protected routes
router.use(authenticate);

// Create new store with logo
router.post('/', uploadStoreLogo, (req, res, next) => 
  storeController.createStore(req, res, next)
);

// Update store with logo
router.put('/:id', uploadStoreLogo, (req, res, next) => 
  storeController.updateStore(req, res, next)
);

// Delete store
router.delete('/:id', (req, res, next) => storeController.deleteStore(req, res, next));

export { router as storeRoutes }; 