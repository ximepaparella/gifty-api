import { Request, Response, NextFunction } from 'express';
import { ProductService } from '../application/product.service';
import { logger } from '@shared/infrastructure/logging/logger';
import { deleteFile } from '@shared/infrastructure/services/fileUpload';
import { ErrorTypes } from '@shared/types/appError';
import { handleAsync } from '@shared/infrastructure/middleware/asyncHandler';

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
  constructor(private productService: ProductService) {}

  createProduct = async (req: RequestWithFile, res: Response, next: NextFunction) => {
    let productData: ProductData = {
      name: '',
      description: '',
      price: 0,
      storeId: '',
      isActive: true,
    };

    try {
      logger.info('Starting product creation in controller');
      logger.info('Request body:', req.body);
      logger.info('Request file:', req.file);

      if (req.body.data) {
        logger.info('Found data in request body, attempting to parse JSON');
        productData = JSON.parse(req.body.data);
        logger.info('Parsed product data from JSON:', productData);
      } else {
        logger.info('No data field found, using form fields');
        productData = {
          name: req.body.name,
          description: req.body.description,
          price: parseFloat(req.body.price),
          storeId: req.body.storeId,
          isActive: req.body.isActive,
        };
        logger.info('Created product data from form fields:', productData);
      }

      if (!productData.name || !productData.storeId || isNaN(productData.price)) {
        logger.error('Invalid product data:', productData);
        return next(ErrorTypes.VALIDATION('Invalid product data'));
      }

      if (req.file?.path) {
        logger.info('Image file detected:', {
          originalname: req.file.originalname,
          path: req.file.path,
          mimetype: req.file.mimetype,
          size: req.file.size,
        });
        productData.image = req.file.path;
        logger.info('Added image path to product data:', productData.image);
      } else {
        logger.info('No image file detected in request');
      }

      logger.info('Creating product with data:', productData);
      const product = await this.productService.createProduct(productData);
      
      if (!product) {
        logger.error('Failed to create product');
        return next(ErrorTypes.INTERNAL('Failed to create product'));
      }

      logger.info('Product created successfully:', product);
      res.status(201).json({
        success: true,
        data: product,
      });
    } catch (error) {
      logger.error('Error creating product:', error);
      if (req.file?.path) {
        try {
          logger.info('Attempting to clean up uploaded file:', req.file.path);
          await deleteFile(req.file.path);
          logger.info('Successfully cleaned up image file');
        } catch (cleanupError) {
          logger.error('Error cleaning up image:', cleanupError);
        }
      }
      next(error);
    }
  };

  getProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const products = await this.productService.getProducts();
      res.status(200).json({
        success: true,
        data: products,
      });
    } catch (error) {
      logger.error('Error getting products:', error);
      next(error);
    }
  };

  getProductById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const product = await this.productService.getProductById(id);

      if (!product) {
        return next(ErrorTypes.NOT_FOUND('Product'));
      }

      res.status(200).json({
        success: true,
        data: product,
      });
    } catch (error) {
      logger.error('Error getting product by ID:', error);
      next(error);
    }
  };

  getProductsByStoreId = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { storeId } = req.params;
      const products = await this.productService.getProductsByStoreId(storeId);
      res.status(200).json({
        success: true,
        data: products,
      });
    } catch (error) {
      logger.error('Error getting products by store ID:', error);
      next(error);
    }
  };

  updateProduct = async (req: RequestWithFile, res: Response, next: NextFunction) => {
    const { id } = req.params;
    let productData: Partial<ProductData> = {};

    try {
      logger.info(`Starting product update for ID: ${id}`);

      const existingProduct = await this.productService.getProductById(id);
      if (!existingProduct) {
        return next(ErrorTypes.NOT_FOUND('Product'));
      }

      if (req.body.data) {
        productData = JSON.parse(req.body.data);
        logger.info('Parsed product data:', productData);
      } else {
        productData = {
          name: req.body.name,
          description: req.body.description,
          price: req.body.price ? parseFloat(req.body.price) : undefined,
          isActive: req.body.isActive,
        };
        logger.info('Created product data from form fields:', productData);
      }

      if (req.file?.path) {
        logger.info('New image file detected:', {
          originalname: req.file.originalname,
          path: req.file.path,
          mimetype: req.file.mimetype,
          size: req.file.size,
        });

        if (existingProduct.image) {
          logger.info('Attempting to delete old image:', existingProduct.image);
          try {
            await deleteFile(existingProduct.image);
            logger.info('Successfully deleted old image');
          } catch (deleteError) {
            logger.error('Error deleting old image:', deleteError);
          }
        }

        productData.image = req.file.path;
        logger.info('Added new image path:', req.file.path);
      } else if ('image' in productData && !productData.image) {
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
      const updatedProduct = await this.productService.updateProduct(id, productData);
      if (!updatedProduct) {
        return next(ErrorTypes.INTERNAL('Failed to update product'));
      }

      logger.info('Product update completed:', updatedProduct);
      res.status(200).json({
        success: true,
        data: updatedProduct,
      });
    } catch (error) {
      logger.error('Error updating product:', error);
      next(error);
    }
  };

  deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const product = await this.productService.getProductById(id);

      if (!product) {
        return next(ErrorTypes.NOT_FOUND('Product'));
      }

      if (product.image) {
        try {
          await deleteFile(product.image);
          logger.info('Successfully deleted product image:', product.image);
        } catch (deleteError) {
          logger.error('Error deleting product image:', deleteError);
        }
      }

      const result = await this.productService.deleteProduct(id);
      if (!result) {
        return next(ErrorTypes.INTERNAL('Failed to delete product'));
      }

      res.status(200).json({
        success: true,
        message: 'Product deleted successfully',
      });
    } catch (error) {
      logger.error('Error deleting product:', error);
      next(error);
    }
  };

  getImage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const product = await this.productService.getProductById(id);

      if (!product) {
        return next(ErrorTypes.NOT_FOUND('Product'));
      }

      if (!product.image) {
        return next(ErrorTypes.NOT_FOUND('Product image'));
      }

      res.status(200).json({
        success: true,
        data: { imageUrl: product.image },
      });
    } catch (error) {
      logger.error('Error getting product image:', error);
      next(error);
    }
  };

  uploadImage = handleAsync(async (req: RequestWithFile, res: Response, next: NextFunction) => {
    const { id } = req.params;

    if (!req.file || !req.file.path) {
      return res.status(400).json({
        status: 'error',
        message: 'No file uploaded',
      });
    }

    try {
      // Get the product to check if it has an existing image
      const product = await this.productService.getProductById(id);
      if (product?.image) {
        // Delete the old image from Cloudinary
        await deleteFile(product.image);
      }

      // Update product with new Cloudinary URL
      const updatedProduct = await this.productService.updateProduct(id, {
        image: req.file.path,
      });

      res.status(200).json({
        status: 'success',
        data: updatedProduct,
      });
    } catch (error: any) {
      // If there's an error, try to delete the uploaded file from Cloudinary
      if (req.file?.path) {
        await deleteFile(req.file.path);
      }
      throw error;
    }
  });
}
