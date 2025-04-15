import { IProduct, Product } from '../domain/product.entity';
import { ProductRepository, IProductRepository } from '../domain/product.repository';
import { validateProduct } from '../domain/product.schema';
import { ErrorTypes } from '@shared/types/appError';
import { logger } from '@shared/infrastructure/logging/logger';
import mongoose from 'mongoose';

export class ProductService {
  private repository: IProductRepository;

  constructor(repository: IProductRepository = new ProductRepository()) {
    this.repository = repository;
  }

  async createProduct(
    productData: Omit<IProduct, 'storeId'> & { storeId: string }
  ): Promise<IProduct> {
    const { error } = validateProduct(productData);
    if (error) {
      logger.error(`Error creating product: ${error.details[0].message}`);
      throw ErrorTypes.VALIDATION(error.details[0].message);
    }

    const product = new Product({
      ...productData,
      storeId: new mongoose.Types.ObjectId(productData.storeId),
    });
    return this.repository.create(product);
  }

  async getProducts(): Promise<IProduct[]> {
    return this.repository.findAll();
  }

  async getProductById(id: string): Promise<IProduct> {
    const product = await this.repository.findById(id);
    if (!product) {
      logger.error(`Product with id ${id} not found`);
      throw ErrorTypes.NOT_FOUND('Product');
    }
    return product;
  }

  async getProductsByStoreId(storeId: string): Promise<IProduct[]> {
    return this.repository.findByStoreId(storeId);
  }

  async updateProduct(
    id: string,
    productData: Partial<Omit<IProduct, 'storeId'>> & { storeId?: string }
  ): Promise<IProduct> {
    const existingProduct = await this.repository.findById(id);
    if (!existingProduct) {
      logger.error(`Product with id ${id} not found`);
      throw ErrorTypes.NOT_FOUND('Product');
    }

    const cleanData = {
      name: productData.name ?? existingProduct.name,
      description: productData.description ?? existingProduct.description,
      price: productData.price ?? existingProduct.price,
      isActive: productData.isActive ?? existingProduct.isActive,
      storeId: productData.storeId ?? existingProduct.storeId.toString(),
    };

    const { error } = validateProduct(cleanData);
    if (error) {
      logger.error(`Error updating product: ${error.details[0].message}`);
      throw ErrorTypes.VALIDATION(error.details[0].message);
    }

    const { storeId, ...restData } = productData;
    const updateData: Partial<IProduct> = {
      ...restData,
      ...(storeId && { storeId: new mongoose.Types.ObjectId(storeId) }),
    };

    const product = await this.repository.update(id, updateData);
    if (!product) {
      logger.error(`Product with id ${id} not found`);
      throw ErrorTypes.NOT_FOUND('Product');
    }
    return product;
  }

  async deleteProduct(id: string): Promise<IProduct> {
    const product = await this.repository.delete(id);
    if (!product) {
      logger.error(`Product with id ${id} not found`);
      throw ErrorTypes.NOT_FOUND('Product');
    }
    return product;
  }
}
