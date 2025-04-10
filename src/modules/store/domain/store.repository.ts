import { Types } from 'mongoose';
import Store from './store.schema';
import { IStore } from './store.entity';
import { deleteFile } from '@shared/infrastructure/services/fileUpload';
import logger from '@shared/infrastructure/logging/logger';

export interface IStoreRepository {
  create(store: IStore): Promise<IStore>;
  findById(id: string): Promise<IStore | null>;
  findByEmail(email: string): Promise<IStore | null>;
  findByOwnerId(ownerId: string): Promise<IStore[]>;
  findAll(): Promise<IStore[]>;
  update(id: string, store: Partial<IStore>): Promise<IStore | null>;
  delete(id: string): Promise<IStore | null>;
}

export class StoreRepository implements IStoreRepository {
  async create(store: IStore): Promise<IStore> {
    return Store.create(store);
  }

  async findById(id: string): Promise<IStore | null> {
    return Store.findById(id);
  }

  async findByEmail(email: string): Promise<IStore | null> {
    return Store.findOne({ email });
  }

  async findByOwnerId(ownerId: string): Promise<IStore[]> {
    return Store.find({ ownerId: new Types.ObjectId(ownerId) });
  }

  async findAll(): Promise<IStore[]> {
    return Store.find();
  }

  async update(id: string, store: Partial<IStore>): Promise<IStore | null> {
    // If updating logo, delete the old one
    if (store.logo) {
      const existingStore = await this.findById(id);
      if (existingStore?.logo) {
        await deleteFile(existingStore.logo);
      }
    }
    return Store.findByIdAndUpdate(id, store, { new: true });
  }

  async delete(id: string): Promise<IStore | null> {
    const store = await this.findById(id);
    if (store?.logo) {
      await deleteFile(store.logo);
    }
    return Store.findByIdAndDelete(id);
  }
}
