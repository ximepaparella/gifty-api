import { Request, Response } from 'express';
import { StoreService } from '../application/store.service';
import catchAsync from '@utils/catchAsync';
import { IStore } from '../domain/store.entity';

type CreateStoreBody = Omit<IStore, 'ownerId'> & { ownerId: string };
type UpdateStoreBody = Partial<CreateStoreBody>;

export class StoreController {
  private service: StoreService;

  constructor(service: StoreService = new StoreService()) {
    this.service = service;
  }

  createStore = catchAsync(async (req: Request, res: Response) => {
    const store = await this.service.createStore(req.body as CreateStoreBody);
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

  updateStore = catchAsync(async (req: Request, res: Response) => {
    const store = await this.service.updateStore(req.params.id, req.body as UpdateStoreBody);
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
} 