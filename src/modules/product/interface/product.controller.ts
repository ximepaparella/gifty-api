import { Request, Response, NextFunction } from 'express';
import { ProductService } from '../application/product.service';
import { handleAsync } from '@shared/infrastructure/middleware/asyncHandler';
import { IProduct } from '../domain/product.entity';
import logger from '@shared/infrastructure/logging/logger';
import { deleteOldFile } from '@shared/infrastructure/services/fileUpload';
import path from 'path';

// Extended Request type to include file from multer
interface RequestWithFile extends Request {
  file?: Express.Multer.File;
}

export class ProductController {
  private service: ProductService;

  constructor(service: ProductService) {
    this.service = service;
  }

  createProduct = handleAsync(async (req: RequestWithFile, res: Response, next: NextFunction) => {
    // Parse product data from request body
    const productData = JSON.parse(req.body.data || '{}');

    // If there's an image file, add the path to product data
    if (req.file) {
      const imagePath = req.file.path.replace(/\\/g, '/').split('uploads/')[1];
      productData.image = `/uploads/${imagePath}`;
    }

    const product = await this.service.createProduct(productData);
    
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
    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found'
      });
    }
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

  updateProduct = handleAsync(async (req: RequestWithFile, res: Response, next: NextFunction) => {
    const { id } = req.params;
    
    // Parse product data from request body
    const productData = JSON.parse(req.body.data || '{}');

    // If there's an image file, add the path to product data
    if (req.file) {
      const imagePath = req.file.path.replace(/\\/g, '/').split('uploads/')[1];
      productData.image = `/uploads/${imagePath}`;

      // Delete old image if it exists
      const existingProduct = await this.service.getProductById(id);
      if (existingProduct.image) {
        await deleteOldFile(path.join(__dirname, '../../../../../', existingProduct.image));
      }
    }

    const product = await this.service.updateProduct(id, productData);
    
    res.status(200).json({
      status: 'success',
      data: product
    });
  });

  deleteProduct = handleAsync(async (req: Request, res: Response) => {
    const product = await this.service.deleteProduct(req.params.id);
    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found'
      });
    }
    res.status(200).json({
      status: 'success',
      data: product
    });
  });

  getImage = handleAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const product = await this.service.getProductById(id);
    
    if (!product.image) {
      return res.status(404).json({
        status: 'error',
        message: 'Product image not found'
      });
    }

    // Remove the leading /uploads from the image path
    const imagePath = product.image.replace('/uploads/', '');
    const fullPath = path.join(__dirname, '../../../../../uploads', imagePath);
    
    res.sendFile(fullPath, (err) => {
      if (err) {
        res.status(404).json({
          status: 'error',
          message: 'Image file not found'
        });
      }
    });
  });
} 