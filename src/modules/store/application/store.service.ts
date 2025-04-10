import { IStore } from '../domain/store.entity';
import { StoreRepository } from '../infrastructure/store.repository';
import { validateStore } from '../domain/store.schema';
import { AppError, ErrorTypes } from '@shared/types/appError';
import logger from '@shared/infrastructure/logging/logger';
import mongoose from 'mongoose';

export class StoreService {
  private repository: StoreRepository;

  constructor(repository: StoreRepository) {
    this.repository = repository;
  }

  async createStore(storeData: Omit<IStore, '_id'>): Promise<IStore> {
    logger.info('Creating new store');

    const { error } = validateStore(storeData);
    if (error) {
      logger.error(`Validation error creating store: ${error.details[0].message}`);
      throw ErrorTypes.VALIDATION(error.details[0].message);
    }

    // Check if store with email already exists
    const existingStore = await this.repository.findByEmail(storeData.email);
    if (existingStore) {
      logger.error(`Store with email ${storeData.email} already exists`);
      throw ErrorTypes.CONFLICT('Store with this email already exists');
    }

    // Convert ownerId to ObjectId if it's a string
    if (typeof storeData.ownerId === 'string') {
      storeData.ownerId = new mongoose.Types.ObjectId(storeData.ownerId);
    }

    return this.repository.create(storeData);
  }

  async getStores(): Promise<IStore[]> {
    logger.info('Getting all stores');
    return this.repository.findAll();
  }

  async getStoreById(id: string): Promise<IStore> {
    logger.info(`Getting store by ID: ${id}`);
    const store = await this.repository.findById(id);
    if (!store) {
      logger.error(`Store with ID ${id} not found`);
      throw ErrorTypes.NOT_FOUND('Store');
    }
    return store;
  }

  async getStoresByOwnerId(ownerId: string): Promise<IStore[]> {
    logger.info(`Getting stores by owner ID: ${ownerId}`);
    return this.repository.findByOwnerId(ownerId);
  }

  async updateStore(id: string, storeData: Partial<IStore>): Promise<IStore> {
    logger.info(`Updating store ${id}`);

    // If email is being updated, check for uniqueness
    if (storeData.email) {
      const existingStore = await this.repository.findByEmail(storeData.email);
      if (existingStore && existingStore._id?.toString() !== id) {
        logger.error(`Store with email ${storeData.email} already exists`);
        throw ErrorTypes.CONFLICT('Store with this email already exists');
      }
    }

    const store = await this.repository.update(id, storeData);
    if (!store) {
      logger.error(`Store with ID ${id} not found for update`);
      throw ErrorTypes.NOT_FOUND('Store');
    }
    return store;
  }

  async deleteStore(id: string): Promise<IStore> {
    logger.info(`Deleting store ${id}`);
    const store = await this.repository.delete(id);
    if (!store) {
      logger.error(`Store with ID ${id} not found for deletion`);
      throw ErrorTypes.NOT_FOUND('Store');
    }
    return store;
  }

  async updateStoreLogo(id: string, logoPath: string): Promise<IStore> {
    logger.info(`Updating logo for store ${id}`);
    const store = await this.repository.updateLogo(id, logoPath);
    if (!store) {
      logger.error(`Store with ID ${id} not found for logo update`);
      throw ErrorTypes.NOT_FOUND('Store');
    }
    return store;
  }
}
