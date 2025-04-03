import { Request, Response, NextFunction } from 'express';
import { StoreService } from '../application/store.service';
import { validateStore } from '../domain/store.schema';
import catchAsync from '@utils/catchAsync';
import { IStore } from '../domain/store.entity';
import { handleAsync } from '@shared/infrastructure/middleware/asyncHandler';
import { deleteOldLogo } from '@shared/infrastructure/services/fileUpload';
import path from 'path';
import logger from '@shared/infrastructure/logging/logger';

// Extended Request type to include file from multer
interface RequestWithFile extends Request {
  file?: Express.Multer.File;
}

type CreateStoreBody = Omit<IStore, 'ownerId'> & { ownerId: string };
type UpdateStoreBody = Partial<CreateStoreBody>;

export class StoreController {
  private service: StoreService;

  constructor(service: StoreService = new StoreService()) {
    this.service = service;
  }

  createStore = handleAsync(async (req: RequestWithFile, res: Response, next: NextFunction) => {
    // Parse store data from request body
    const storeData = JSON.parse(req.body.data || '{}');

    // If there's a logo file, add the path to store data
    if (req.file) {
      const logoPath = req.file.path.replace(/\\/g, '/').split('uploads/')[1];
      storeData.logo = `/uploads/${logoPath}`;
    }

    const store = await this.service.createStore(storeData);
    
    res.status(201).json({
      status: 'success',
      data: store
    });
  });

  getStores = catchAsync(async (req: Request, res: Response) => {
    const stores = await this.service.getStores();
    res.status(200).json({
      status: 'success',
      data: stores
    });
  });

  getStoreById = catchAsync(async (req: Request, res: Response) => {
    const store = await this.service.getStoreById(req.params.id);
    if (!store) {
      return res.status(404).json({
        status: 'error',
        message: 'Store not found'
      });
    }
    res.status(200).json({
      status: 'success',
      data: store
    });
  });

  getStoresByOwnerId = catchAsync(async (req: Request, res: Response) => {
    const stores = await this.service.getStoresByOwnerId(req.params.ownerId);
    res.status(200).json({
      status: 'success',
      data: stores
    });
  });

  updateStore = handleAsync(async (req: RequestWithFile, res: Response, next: NextFunction) => {
    const { id } = req.params;
    
    // Parse store data from request body
    const storeData = JSON.parse(req.body.data || '{}');

    // If there's a logo file, add the path to store data
    if (req.file) {
      const logoPath = req.file.path.replace(/\\/g, '/').split('uploads/')[1];
      storeData.logo = `/uploads/${logoPath}`;

      // Delete old logo if it exists
      const existingStore = await this.service.getStoreById(id);
      if (existingStore.logo) {
        await deleteOldLogo(path.join(__dirname, '../../../../../', existingStore.logo));
      }
    }

    const store = await this.service.updateStore(id, storeData);
    
    res.status(200).json({
      status: 'success',
      data: store
    });
  });

  deleteStore = catchAsync(async (req: Request, res: Response) => {
    const store = await this.service.deleteStore(req.params.id);
    res.status(200).json({
      status: 'success',
      data: store
    });
  });

  getLogo = handleAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const store = await this.service.getStoreById(id);
    
    if (!store.logo) {
      return res.status(404).json({
        status: 'error',
        message: 'Store logo not found'
      });
    }

    // Remove the leading /uploads from the logo path
    const logoPath = store.logo.replace('/uploads/', '');
    const fullPath = path.join(__dirname, '../../../../../uploads', logoPath);
    
    res.sendFile(fullPath, (err) => {
      if (err) {
        res.status(404).json({
          status: 'error',
          message: 'Logo file not found'
        });
      }
    });
  });

  uploadLogo = handleAsync(async (req: RequestWithFile, res: Response, next: NextFunction) => {
    const { id } = req.params;
    
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'No file uploaded'
      });
    }

    try {
      // Get the store to check if it has an existing logo
      const store = await this.service.getStoreById(id);
      if (store.logo) {
        // Delete the old logo
        await deleteOldLogo(path.join(__dirname, '../../../../../', store.logo));
      }

      // Update store with new logo path
      const logoPath = req.file.path.replace(/\\/g, '/').split('uploads/')[1];
      const updatedStore = await this.service.updateStore(id, {
        logo: `/uploads/${logoPath}`
      });

      res.status(200).json({
        status: 'success',
        data: updatedStore
      });
    } catch (error: any) {
      // If there's an error, try to delete the uploaded file
      if (req.file) {
        await deleteOldLogo(req.file.path);
      }
      throw error;
    }
  });
} 