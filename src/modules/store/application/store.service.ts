import { IStore, Store } from '../domain/store.entity';
import { StoreRepository, IStoreRepository } from '../domain/store.repository';
import { validateStore } from '../domain/store.schema';
import { notFoundError, validationError } from '../../../shared/types/appError';
import logger from '../../../shared/infrastructure/logging/logger';
import mongoose from 'mongoose';

export class StoreService {
  private repository: IStoreRepository;

  constructor(repository: IStoreRepository = new StoreRepository()) {
    this.repository = repository;
  }

  async createStore(storeData: Omit<IStore, 'ownerId'> & { ownerId: string }): Promise<IStore> {
    const { error } = validateStore(storeData);
    if (error) {
      logger.error(`Error creating store: ${error.details[0].message}`);
      throw validationError(error.details[0].message);
    }

    const existingStore = await this.repository.findByEmail(storeData.email);
    if (existingStore) {
      logger.error(`Error creating store: Email ${storeData.email} already registered`);
      throw validationError('Email already registered');
    }

    const store = new Store({
      ...storeData,
      ownerId: new mongoose.Types.ObjectId(storeData.ownerId)
    });
    return await this.repository.create(store);
  }

  async getStores(): Promise<IStore[]> {
    return await this.repository.findAll();
  }

  async getStoreById(id: string): Promise<IStore> {
    const store = await this.repository.findById(id);
    if (!store) {
      logger.error(`Store with id ${id} not found`);
      throw notFoundError('Store not found');
    }
    return store;
  }

  async getStoresByOwnerId(ownerId: string): Promise<IStore[]> {
    return await this.repository.findByOwnerId(ownerId);
  }

  async updateStore(id: string, storeData: Partial<Omit<IStore, 'ownerId'>> & { ownerId?: string }): Promise<IStore> {
    const existingStore = await this.repository.findById(id);
    if (!existingStore) {
      logger.error(`Store with id ${id} not found`);
      throw notFoundError('Store not found');
    }

    const dataToValidate = {
      ...existingStore,
      ...storeData,
      ownerId: storeData.ownerId || existingStore.ownerId.toString()
    };

    const { error } = validateStore(dataToValidate);
    if (error) {
      logger.error(`Error updating store: ${error.details[0].message}`);
      throw validationError(error.details[0].message);
    }

    if (storeData.email) {
      const existingStoreWithEmail = await this.repository.findByEmail(storeData.email);
      if (existingStoreWithEmail && existingStoreWithEmail._id?.toString() !== id) {
        logger.error(`Error updating store: Email ${storeData.email} already in use`);
        throw validationError('Email already in use');
      }
    }

    const { ownerId, ...restData } = storeData;
    const updateData: Partial<IStore> = {
      ...restData,
      ...(ownerId && { ownerId: new mongoose.Types.ObjectId(ownerId) })
    };

    const store = await this.repository.update(id, updateData);
    if (!store) {
      logger.error(`Store with id ${id} not found`);
      throw notFoundError('Store not found');
    }
    return store;
  }

  async deleteStore(id: string): Promise<IStore> {
    const store = await this.repository.delete(id);
    if (!store) {
      logger.error(`Store with id ${id} not found`);
      throw notFoundError('Store not found');
    }
    return store;
  }
} 