import mongoose from 'mongoose';
import { IStore } from '../domain/store.entity';
import { Store } from '../domain/store.schema';
import { logger } from '@shared/infrastructure/logging/logger';

export class StoreRepository {
  async findAll(): Promise<IStore[]> {
    logger.debug('Finding all stores');
    return Store.find();
  }

  async findById(id: string): Promise<IStore | null> {
    logger.debug(`Finding store by ID: ${id}`);
    return Store.findById(id);
  }

  async findByOwnerId(ownerId: string): Promise<IStore[]> {
    logger.debug(`Finding stores by owner ID: ${ownerId}`);
    return Store.find({ ownerId: new mongoose.Types.ObjectId(ownerId) });
  }

  async create(storeData: Omit<IStore, '_id'>): Promise<IStore> {
    logger.debug('Creating new store', storeData);
    const store = new Store(storeData);
    return store.save();
  }

  async update(id: string, storeData: Partial<IStore>): Promise<IStore | null> {
    logger.debug(`Updating store ${id}`, storeData);
    return Store.findByIdAndUpdate(id, { ...storeData, updatedAt: new Date() }, { new: true });
  }

  async delete(id: string): Promise<IStore | null> {
    logger.debug(`Deleting store ${id}`);
    return Store.findByIdAndDelete(id);
  }

  async findByEmail(email: string): Promise<IStore | null> {
    logger.debug(`Finding store by email: ${email}`);
    return Store.findOne({ email });
  }

  async updateLogo(id: string, logoPath: string): Promise<IStore | null> {
    logger.debug(`Updating logo for store ${id}`);
    return Store.findByIdAndUpdate(
      id,
      {
        logo: logoPath,
        updatedAt: new Date(),
      },
      { new: true }
    );
  }
}
