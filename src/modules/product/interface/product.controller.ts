import { Request, Response } from 'express';
import { ProductService } from '../application/product.service';
import { handleAsync } from '@shared/infrastructure/middleware/asyncHandler';
import { IProduct } from '../domain/product.entity';

export class ProductController {
  constructor(private service: ProductService) {}

  createProduct = handleAsync(async (req: Request, res: Response) => {
    const product = await this.service.createProduct(req.body);
    res.status(201).json({
      status: 'success',
      data: product
    });
  });

  getProducts = handleAsync(async (_req: Request, res: Response) => {
    const products = await this.service.getProducts();
    res.status(200).json({
      status: 'success',
      data: products
    });
  });

  getProductById = handleAsync(async (req: Request, res: Response) => {
    const product = await this.service.getProductById(req.params.id);
    res.status(200).json({
      status: 'success',
      data: product
    });
  });

  getProductsByStoreId = handleAsync(async (req: Request, res: Response) => {
    const products = await this.service.getProductsByStoreId(req.params.storeId);
    res.status(200).json({
      status: 'success',
      data: products
    });
  });

  updateProduct = handleAsync(async (req: Request, res: Response) => {
    const product = await this.service.updateProduct(req.params.id, req.body);
    res.status(200).json({
      status: 'success',
      data: product
    });
  });

  deleteProduct = handleAsync(async (req: Request, res: Response) => {
    const product = await this.service.deleteProduct(req.params.id);
    res.status(200).json({
      status: 'success',
      data: product
    });
  });
} 