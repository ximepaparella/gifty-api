import express from 'express';
import { StoreController } from './store.controller';
import { StoreService } from '../application/store.service';
import { StoreRepository } from '../infrastructure/store.repository';
import { authenticate } from '@shared/infrastructure/middleware/auth';
import { uploadStoreLogo } from '@shared/infrastructure/services/fileUpload';

export const storeRouter = express.Router();

// Initialize repository, service, and controller
const storeRepository = new StoreRepository();
const storeService = new StoreService(storeRepository);
const storeController = new StoreController(storeService);

// Public routes
// Get all stores
storeRouter.get('/', (req, res, next) => storeController.getStores(req, res, next));

// Get store by ID
storeRouter.get('/:id', (req, res, next) => storeController.getStoreById(req, res, next));

// Get store logo
storeRouter.get('/:id/logo', (req, res, next) => storeController.getLogo(req, res, next));

// Protected routes
storeRouter.use(authenticate);

// Create new store with logo
storeRouter.post('/', uploadStoreLogo, (req, res, next) => storeController.createStore(req, res, next));

// Update store with logo
storeRouter.put('/:id', uploadStoreLogo, (req, res, next) =>
  storeController.updateStore(req, res, next)
);

// Delete store
storeRouter.delete('/:id', (req, res, next) => storeController.deleteStore(req, res, next));
