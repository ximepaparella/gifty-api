import { Types } from 'mongoose';
import Store from './store.schema';
import { IStore } from './store.entity';

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
    return await Store.create(store);
  }

  async findById(id: string): Promise<IStore | null> {
    return await Store.findById(id);
  }

  async findByEmail(email: string): Promise<IStore | null> {
    return await Store.findOne({ email });
  }

  async findByOwnerId(ownerId: string): Promise<IStore[]> {
    return await Store.find({ ownerId: new Types.ObjectId(ownerId) });
  }

  async findAll(): Promise<IStore[]> {
    return await Store.find();
  }

  async update(id: string, store: Partial<IStore>): Promise<IStore | null> {
    return await Store.findByIdAndUpdate(id, store, { new: true });
  }

  async delete(id: string): Promise<IStore | null> {
    return await Store.findByIdAndDelete(id);
  }
} 