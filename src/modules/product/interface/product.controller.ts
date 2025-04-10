import { Request, Response, NextFunction } from 'express';
import { ProductService } from '../application/product.service';
import { handleAsync } from '@shared/infrastructure/middleware/asyncHandler';
import { IProduct } from '../domain/product.entity';
import logger from '@shared/infrastructure/logging/logger';
import { deleteFile } from '@shared/infrastructure/services/fileUpload';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';

// Extended Request type to include file from multer
interface RequestWithFile extends Request {
  file?: Express.Multer.File & { path?: string };
}

export class ProductController {
  private service: ProductService;

  constructor(service: ProductService) {
    this.service = service;
  }

  createProduct = handleAsync(async (req: RequestWithFile, res: Response, next: NextFunction) => {
    let productData: any = {};

    try {
      // Parse product data from request body
      if (req.body.data) {
        productData = JSON.parse(req.body.data);
      } else {
        // If no JSON data, use form fields
        productData = {
          name: req.body.name,
          description: req.body.description,
          price: parseFloat(req.body.price),
          storeId: req.body.storeId,
          isActive: req.body.isActive,
        };
      }

      // Log the product data for debugging
      logger.info('Product data before upload:', productData);

      // If there's an image file, add the Cloudinary URL to product data
      if (req.file && req.file.path) {
        productData.image = req.file.path;
        logger.info('Image path from upload:', req.file.path);
      }

      // Create the product
      const product = await this.service.createProduct(productData);

      res.status(201).json({
        status: 'success',
        data: product,
      });
    } catch (error) {
      logger.error('Error creating product:', error);
      // If there's an error and we uploaded a file, clean it up
      if (req.file?.path) {
        await deleteFile(req.file.path);
      }
      throw error;
    }
  });

  getProducts = handleAsync(async (req: Request, res: Response, next: NextFunction) => {
    const products = await this.service.getProducts();
    res.status(200).json({
      status: 'success',
      data: products,
    });
  });

  getProductById = handleAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const product = await this.service.getProductById(id);
    res.status(200).json({
      status: 'success',
      data: product,
    });
  });

  getProductsByStoreId = handleAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { storeId } = req.params;
    const products = await this.service.getProductsByStoreId(storeId);
    res.status(200).json({
      status: 'success',
      data: products,
    });
  });

  updateProduct = handleAsync(async (req: RequestWithFile, res: Response, next: NextFunction) => {
    const { id } = req.params;
    let productData: any = {};

    try {
      // Parse product data from request body
      if (req.body.data) {
        productData = JSON.parse(req.body.data);
      } else {
        // If no JSON data, use form fields
        productData = {
          name: req.body.name,
          description: req.body.description,
          price: req.body.price ? parseFloat(req.body.price) : undefined,
          isActive: req.body.isActive,
        };
      }

      // If there's an image file, add the Cloudinary URL to product data
      if (req.file && req.file.path) {
        // Get existing product to delete old image
        const existingProduct = await this.service.getProductById(id);
        if (existingProduct?.image) {
          await deleteFile(existingProduct.image);
        }

        productData.image = req.file.path; // Cloudinary returns the full URL in the path
      }

      const product = await this.service.updateProduct(id, productData);

      res.status(200).json({
        status: 'success',
        data: product,
      });
    } catch (error) {
      logger.error('Error updating product:', error);
      // If there's an error and we uploaded a file, clean it up
      if (req.file?.path) {
        await deleteFile(req.file.path);
      }
      throw error;
    }
  });

  deleteProduct = handleAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const product = await this.service.deleteProduct(id);
    res.status(200).json({
      status: 'success',
      data: product,
    });
  });

  getImage = handleAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const product = await this.service.getProductById(id);

    if (!product?.image) {
      return res.status(404).json({
        status: 'error',
        message: 'No image found for this product',
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        imageUrl: product.image,
      },
    });
  });
}
