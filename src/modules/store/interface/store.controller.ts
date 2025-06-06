import { Request, Response, NextFunction } from 'express';
import { StoreService } from '../application/store.service';
import { validateStore } from '../domain/store.schema';
import { IStore } from '../domain/store.entity';
import { handleAsync } from '@shared/infrastructure/middleware/asyncHandler';
import { deleteFile } from '@shared/infrastructure/services/fileUpload';
import { logger } from '@shared/infrastructure/logging/logger';
import { v2 as cloudinary } from 'cloudinary';
import { ErrorTypes } from '@shared/types/appError';
import { StoreRepository } from '../infrastructure/store.repository';

// Extended Request type to include file from multer
interface RequestWithFile extends Request {
  file?: Express.Multer.File & { path?: string };
}

type CreateStoreBody = Omit<IStore, 'ownerId'> & { ownerId: string };
type UpdateStoreBody = Partial<CreateStoreBody>;

export class StoreController {
  private service: StoreService;

  constructor(service: StoreService = new StoreService(new StoreRepository())) {
    this.service = service;
  }

  createStore = handleAsync(async (req: RequestWithFile, res: Response, next: NextFunction) => {
    let storeData: any = {};
    let tempLogoPath: string | undefined;

    try {
      // First try to parse JSON data if it exists
      if (req.body.data) {
        storeData = JSON.parse(req.body.data);
      } else {
        // If no JSON data, use form fields
        storeData = {
          name: req.body.name,
          email: req.body.email,
          phone: req.body.phone,
          address: req.body.address,
          social: req.body.social ? JSON.parse(req.body.social) : undefined,
        };
      }

      // Log the store data for debugging
      logger.info('Store data before upload:', storeData);

      // Validate store data
      const validationResult = validateStore(storeData);
      if (!validationResult || validationResult.error) {
        return next(
          ErrorTypes.VALIDATION(validationResult?.error?.message || 'Invalid store data')
        );
      }

      // If there's a logo file, store the temporary path
      if (req.file && req.file.path) {
        tempLogoPath = req.file.path;
        logger.info('Temporary logo path:', tempLogoPath);
      }

      // Create store first without logo
      const store = await this.service.createStore(storeData);

      // If we have a logo, move it to the correct folder
      if (tempLogoPath && store._id) {
        try {
          // Extract the public ID from the temporary path
          const urlParts = tempLogoPath.split('/');
          const fileName = urlParts[urlParts.length - 1].split('.')[0]; // Get filename without extension

          logger.info('Moving file from:', `stores/temp/${fileName}`);
          logger.info('Moving file to:', `stores/${store._id.toString()}/logo`);

          // Move the file to the correct folder
          const result = await cloudinary.uploader.rename(
            `stores/temp/${fileName}`,
            `stores/${store._id.toString()}/logo`,
            { overwrite: true }
          );

          // Update the store with the new logo path
          const updatedStore = await this.service.updateStore(store._id.toString(), {
            logo: result.secure_url,
          });

          res.status(201).json({
            success: true,
            data: updatedStore,
          });
        } catch (error) {
          logger.error('Error moving logo file:', error);
          next(ErrorTypes.INTERNAL('Error processing store logo'));
        }
      } else {
        res.status(201).json({
          success: true,
          data: store,
        });
      }
    } catch (error) {
      logger.error('Error creating store:', error);
      // If there's an error and we uploaded a file, clean it up
      if (tempLogoPath) {
        await deleteFile(tempLogoPath).catch((err) =>
          logger.error('Error deleting temporary logo:', err)
        );
      }
      next(error);
    }
  });

  getStores = handleAsync(async (req: Request, res: Response, next: NextFunction) => {
    const stores = await this.service.getStores();
    res.status(200).json({
      success: true,
      data: stores,
    });
  });

  getStoreById = handleAsync(async (req: Request, res: Response, next: NextFunction) => {
    const store = await this.service.getStoreById(req.params.id);
    if (!store) {
      return next(ErrorTypes.NOT_FOUND('Store'));
    }
    res.status(200).json({
      success: true,
      data: store,
    });
  });

  getStoresByOwnerId = handleAsync(async (req: Request, res: Response, next: NextFunction) => {
    const stores = await this.service.getStoresByOwnerId(req.params.ownerId);
    res.status(200).json({
      success: true,
      data: stores,
    });
  });

  updateStore = handleAsync(async (req: RequestWithFile, res: Response, next: NextFunction) => {
    const { id } = req.params;
    logger.info(`Starting store update for ID: ${id}`);

    try {
      // Parse store data from request body
      const storeData = JSON.parse(req.body.data || '{}');
      logger.info('Parsed store data:', storeData);

      const existingStore = await this.service.getStoreById(id);
      if (!existingStore) {
        return next(ErrorTypes.NOT_FOUND('Store'));
      }

      // If there's a logo file, add the Cloudinary URL to store data
      if (req.file && req.file.path) {
        logger.info('New logo file detected:', req.file);

        // Get existing store to delete old logo
        if (existingStore.logo) {
          logger.info('Attempting to delete old logo:', existingStore.logo);
          try {
            await deleteFile(existingStore.logo);
            logger.info('Successfully deleted old logo');
          } catch (deleteError) {
            logger.error('Error deleting old logo:', deleteError);
          }
        }

        storeData.logo = req.file.path; // Cloudinary returns the full URL in the path
        logger.info('Updated store data with new logo path:', storeData);
      } else {
        logger.info('No new logo file in request');

        // Check if logo should be removed
        if (Object.hasOwn(storeData, 'logo') && !storeData.logo) {
          logger.info('Logo removal requested');
          if (existingStore.logo) {
            logger.info('Attempting to delete logo:', existingStore.logo);
            try {
              await deleteFile(existingStore.logo);
              logger.info('Successfully deleted logo for removal');
            } catch (deleteError) {
              logger.error('Error deleting logo for removal:', deleteError);
            }
          }
        }
      }

      const updatedStore = await this.service.updateStore(id, storeData);
      if (!updatedStore) {
        return next(ErrorTypes.INTERNAL('Failed to update store'));
      }

      logger.info('Store update completed:', updatedStore);
      res.status(200).json({
        success: true,
        data: updatedStore,
      });
    } catch (error) {
      logger.error('Error in updateStore:', error);
      next(error);
    }
  });

  deleteStore = handleAsync(async (req: Request, res: Response, next: NextFunction) => {
    const store = await this.service.deleteStore(req.params.id);
    if (store?.logo) {
      await deleteFile(store.logo);
    }
    res.status(200).json({
      success: true,
      data: store,
    });
  });

  uploadLogo = handleAsync(async (req: RequestWithFile, res: Response, next: NextFunction) => {
    const { id } = req.params;

    if (!req.file || !req.file.path) {
      return res.status(400).json({
        status: 'error',
        message: 'No file uploaded',
      });
    }

    try {
      // Get the store to check if it has an existing logo
      const store = await this.service.getStoreById(id);
      if (store?.logo) {
        // Delete the old logo from Cloudinary
        await deleteFile(store.logo);
      }

      // Update store with new Cloudinary URL
      const updatedStore = await this.service.updateStore(id, {
        logo: req.file.path,
      });

      res.status(200).json({
        status: 'success',
        data: updatedStore,
      });
    } catch (error: any) {
      // If there's an error, try to delete the uploaded file from Cloudinary
      if (req.file?.path) {
        await deleteFile(req.file.path);
      }
      throw error;
    }
  });

  getLogo = handleAsync(async (req: Request, res: Response, next: NextFunction) => {
    const store = await this.service.getStoreById(req.params.id);
    if (!store || !store.logo) {
      return next(ErrorTypes.NOT_FOUND('Store logo'));
    }
    res.redirect(store.logo);
  });
}
