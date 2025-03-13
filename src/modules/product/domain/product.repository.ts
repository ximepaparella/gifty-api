import mongoose from 'mongoose';
import { IProduct } from './product.entity';
import { ProductSchema } from './product.schema';

export interface IProductRepository {
  create(product: IProduct): Promise<IProduct>;
  findAll(): Promise<IProduct[]>;
  findById(id: string): Promise<IProduct | null>;
  findByStoreId(storeId: string): Promise<IProduct[]>;
  update(id: string, product: Partial<IProduct>): Promise<IProduct | null>;
  delete(id: string): Promise<IProduct | null>;
}

const ProductModel = mongoose.model<IProduct>('Product', ProductSchema);

export class ProductRepository implements IProductRepository {
  async create(product: IProduct): Promise<IProduct> {
    return await ProductModel.create(product);
  }

  async findAll(): Promise<IProduct[]> {
    return await ProductModel.find().exec();
  }

  async findById(id: string): Promise<IProduct | null> {
    return await ProductModel.findById(id).exec();
  }

  async findByStoreId(storeId: string): Promise<IProduct[]> {
    return await ProductModel.find({ storeId: new mongoose.Types.ObjectId(storeId) }).exec();
  }

  async update(id: string, product: Partial<IProduct>): Promise<IProduct | null> {
    return await ProductModel.findByIdAndUpdate(
      id,
      { $set: product },
      { new: true }
    ).exec();
  }

  async delete(id: string): Promise<IProduct | null> {
    return await ProductModel.findByIdAndDelete(id).exec();
  }
} 