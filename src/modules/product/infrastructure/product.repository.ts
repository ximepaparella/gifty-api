import { Types } from 'mongoose';
import { IProduct } from '../domain/product.entity';
import { Product } from '../domain/product.schema';
import logger from '@shared/infrastructure/logging/logger';
import { deleteFile } from '@shared/infrastructure/services/fileUpload';

export class ProductRepository {
  async create(productData: IProduct): Promise<IProduct> {
    const product = new Product(productData);
    return await product.save();
  }

  async findAll(): Promise<IProduct[]> {
    return await Product.find().sort({ createdAt: -1 });
  }

  async findById(id: string): Promise<IProduct | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    return await Product.findById(id);
  }

  async findByStoreId(storeId: string): Promise<IProduct[]> {
    if (!Types.ObjectId.isValid(storeId)) {
      return [];
    }
    return await Product.find({ storeId: new Types.ObjectId(storeId) }).sort({ createdAt: -1 });
  }

  async update(id: string, productData: Partial<IProduct>): Promise<IProduct | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }

    // If updating image, delete the old one from Cloudinary
    if (productData.image) {
      const existingProduct = await this.findById(id);
      if (existingProduct?.image) {
        await deleteFile(existingProduct.image);
      }
    }

    return await Product.findByIdAndUpdate(
      id,
      { $set: productData },
      { new: true, runValidators: true }
    );
  }

  async delete(id: string): Promise<IProduct | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }

    // Delete product image from Cloudinary if it exists
    const product = await this.findById(id);
    if (product?.image) {
      await deleteFile(product.image);
    }

    return await Product.findByIdAndDelete(id);
  }
} 