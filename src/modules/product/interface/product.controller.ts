import { Request, Response, NextFunction } from 'express';
import { ProductService } from '../application/product.service';
import { handleAsync } from '@shared/infrastructure/middleware/asyncHandler';
import logger from '@shared/infrastructure/logging/logger';
import { deleteFile } from '@shared/infrastructure/services/fileUpload';

// Extended Request type to include file from multer
interface RequestWithFile extends Request {
  file?: Express.Multer.File & { path?: string };
}

interface ProductData {
  name: string;
  description: string;
  price: number;
  storeId: string;
  isActive: boolean;
  image?: string | null;
}

export class ProductController {
  private service: ProductService;

  constructor(service: ProductService) {
    this.service = service;
  }

  createProduct = handleAsync(async (req: RequestWithFile, res: Response) => {
    let productData: ProductData = {
      name: '',
      description: '',
      price: 0,
      storeId: '',
      isActive: true,
    };

    try {
      logger.info('Starting product creation');
      // Parse product data from request body
      if (req.body.data) {
        productData = JSON.parse(req.body.data);
        logger.info('Parsed product data from JSON:', productData);
      } else {
        // If no JSON data, use form fields
        productData = {
          name: req.body.name,
          description: req.body.description,
          price: parseFloat(req.body.price),
          storeId: req.body.storeId,
          isActive: req.body.isActive,
        };
        logger.info('Created product data from form fields:', productData);
      }

      // If there's an image file, store the path
      if (req.file?.path) {
        logger.info('Image file detected:', {
          originalname: req.file.originalname,
          path: req.file.path,
          mimetype: req.file.mimetype,
          size: req.file.size,
        });
        productData.image = req.file.path;
      } else {
        logger.info('No image file in request');
      }

      // Create the product
      logger.info('Creating product with data:', productData);
      const product = await this.service.createProduct(productData);
      logger.info('Product created successfully:', product);

      res.status(201).json({
        status: 'success',
        data: product,
      });
    } catch (error) {
      logger.error('Error creating product:', error);
      // If there's an error and we uploaded a file, clean it up
      if (req.file?.path) {
        try {
          await deleteFile(req.file.path);
          logger.info('Cleaned up image file:', req.file.path);
        } catch (cleanupError) {
          logger.error('Error cleaning up image:', cleanupError);
        }
      }
      throw error;
    }
  });

  getProducts = handleAsync(async (req: Request, res: Response) => {
    const products = await this.service.getProducts();
    res.status(200).json({
      status: 'success',
      data: products,
    });
  });

  getProductById = handleAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const product = await this.service.getProductById(id);
    res.status(200).json({
      status: 'success',
      data: product,
    });
  });

  getProductsByStoreId = handleAsync(async (req: Request, res: Response) => {
    const { storeId } = req.params;
    const products = await this.service.getProductsByStoreId(storeId);
    res.status(200).json({
      status: 'success',
      data: products,
    });
  });

  updateProduct = handleAsync(async (req: RequestWithFile, res: Response) => {
    const { id } = req.params;
    let productData: Partial<ProductData> = {};

    try {
      logger.info(`Starting product update for ID: ${id}`);

      // Get existing product first
      const existingProduct = await this.service.getProductById(id);
      if (!existingProduct) {
        return res.status(404).json({
          status: 'error',
          message: 'Product not found',
        });
      }
      logger.info('Found existing product:', existingProduct);

      // Parse product data from request body
      if (req.body.data) {
        productData = JSON.parse(req.body.data);
        logger.info('Parsed product data:', productData);
      } else {
        // If no JSON data, use form fields
        productData = {
          name: req.body.name,
          description: req.body.description,
          price: req.body.price ? parseFloat(req.body.price) : undefined,
          isActive: req.body.isActive,
        };
        logger.info('Created product data from form fields:', productData);
      }

      // Handle image update
      if (req.file?.path) {
        logger.info('New image file detected:', {
          originalname: req.file.originalname,
          path: req.file.path,
          mimetype: req.file.mimetype,
          size: req.file.size,
        });

        // Delete old image if it exists
        if (existingProduct.image) {
          logger.info('Attempting to delete old image:', existingProduct.image);
          try {
            await deleteFile(existingProduct.image);
            logger.info('Successfully deleted old image');
          } catch (deleteError) {
            logger.error('Error deleting old image:', deleteError);
          }
        }

        // Set the new image path
        productData.image = req.file.path;
        logger.info('Added new image path:', req.file.path);
      } else if ('image' in productData && !productData.image) {
        // Handle image removal
        logger.info('Image removal requested');
        if (existingProduct.image) {
          logger.info('Attempting to delete image:', existingProduct.image);
          try {
            await deleteFile(existingProduct.image);
            logger.info('Successfully deleted image for removal');
          } catch (deleteError) {
            logger.error('Error deleting image for removal:', deleteError);
          }
        }
        productData.image = null;
      }

      logger.info('Updating product with data:', productData);
      const product = await this.service.updateProduct(id, productData);
      logger.info('Product update completed:', product);

      res.status(200).json({
        status: 'success',
        data: product,
      });
    } catch (error) {
      logger.error('Error updating product:', error);
      throw error;
    }
  });

  deleteProduct = handleAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const product = await this.service.deleteProduct(id);
    res.status(200).json({
      status: 'success',
      data: product,
    });
  });

  getImage = handleAsync(async (req: Request, res: Response) => {
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
