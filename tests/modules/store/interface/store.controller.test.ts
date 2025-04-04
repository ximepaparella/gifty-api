import { Request, Response, NextFunction } from 'express';
import { StoreController } from '@modules/store/interface/store.controller';
import { StoreService } from '@modules/store/application/store.service';
import { IStoreRepository } from '@modules/store/domain/store.repository';
import mongoose from 'mongoose';

jest.mock('@modules/store/application/store.service');

describe('Store Controller', () => {
  let storeController: StoreController;
  let mockStoreService: jest.Mocked<StoreService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.MockedFunction<NextFunction>;
  let mockRepository: jest.Mocked<IStoreRepository>;
  const mockStore = {
    _id: new mongoose.Types.ObjectId(),
    name: 'Test Store',
    ownerId: new mongoose.Types.ObjectId(),
    email: 'store@test.com',
    phone: '1234567890',
    address: '123 Test St',
    logo: 'https://example.com/logo.png',
    social: {
      instagram: 'https://instagram.com/teststore',
      facebook: 'https://facebook.com/teststore',
      twitter: 'https://twitter.com/teststore'
    }
  };

  beforeEach(() => {
    mockRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findByOwnerId: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    } as unknown as jest.Mocked<IStoreRepository>;

    mockStoreService = new StoreService(mockRepository) as jest.Mocked<StoreService>;
    Object.assign(mockStoreService, {
      createStore: jest.fn(),
      getStores: jest.fn(),
      getStoreById: jest.fn(),
      getStoresByOwnerId: jest.fn(),
      updateStore: jest.fn(),
      deleteStore: jest.fn(),
      updateStoreLogo: jest.fn()
    });

    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockNext = jest.fn();

    storeController = new StoreController(mockStoreService);
  });

  describe('createStore', () => {
    it('should create a store successfully', async () => {
      mockRequest.body = {
        data: JSON.stringify({
          name: mockStore.name,
          ownerId: mockStore.ownerId.toString(),
          email: mockStore.email,
          phone: mockStore.phone,
          address: mockStore.address,
          social: mockStore.social
        })
      };
      mockStoreService.createStore.mockResolvedValue(mockStore);

      await storeController.createStore(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockStore
      });
    });

    it('should create a store with logo successfully', async () => {
      mockRequest.body = {
        data: JSON.stringify({
          name: mockStore.name,
          ownerId: mockStore.ownerId.toString(),
          email: mockStore.email,
          phone: mockStore.phone,
          address: mockStore.address,
          social: mockStore.social
        })
      };
      mockRequest.file = {
        path: 'uploads/stores/logo.png'
      } as Express.Multer.File;
      mockStoreService.createStore.mockResolvedValue({ ...mockStore, logo: undefined });
      mockStoreService.updateStore.mockResolvedValue(mockStore);

      await storeController.createStore(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockStore
      });
    });
  });

  describe('getStores', () => {
    it('should get all stores successfully', async () => {
      const stores = [mockStore];
      mockStoreService.getStores.mockResolvedValue(stores);

      await storeController.getStores(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        data: stores
      });
    });
  });

  describe('getStoreById', () => {
    it('should get store by id successfully', async () => {
      mockRequest.params = { id: mockStore._id.toString() };
      mockStoreService.getStoreById.mockResolvedValue(mockStore);

      await storeController.getStoreById(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockStore
      });
    });
  });

  describe('getStoresByOwnerId', () => {
    it('should get stores by owner id successfully', async () => {
      const stores = [mockStore];
      mockRequest.params = { ownerId: mockStore.ownerId.toString() };
      mockStoreService.getStoresByOwnerId.mockResolvedValue(stores);

      await storeController.getStoresByOwnerId(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        data: stores
      });
    });
  });

  describe('updateStore', () => {
    it('should update store successfully', async () => {
      mockRequest.params = { id: mockStore._id.toString() };
      mockRequest.body = { 
        data: JSON.stringify({
          name: 'Updated Store',
          ownerId: mockStore.ownerId.toString(),
          social: {
            instagram: 'https://instagram.com/updatedstore',
            facebook: 'https://facebook.com/updatedstore'
          }
        })
      };
      const updatedStore = { 
        ...mockStore, 
        name: 'Updated Store',
        social: {
          instagram: 'https://instagram.com/updatedstore',
          facebook: 'https://facebook.com/updatedstore',
          twitter: 'https://twitter.com/teststore'
        }
      };
      mockStoreService.updateStore.mockResolvedValue(updatedStore);

      await storeController.updateStore(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        data: updatedStore
      });
    });

    it('should update store with logo successfully', async () => {
      mockRequest.params = { id: mockStore._id.toString() };
      mockRequest.body = { 
        data: JSON.stringify({
          name: 'Updated Store'
        })
      };
      mockRequest.file = {
        path: 'uploads/stores/newlogo.png'
      } as Express.Multer.File;
      
      const updatedStore = {
        ...mockStore,
        name: 'Updated Store',
        logo: 'uploads/stores/newlogo.png'
      };
      mockStoreService.getStoreById.mockResolvedValue(mockStore);
      mockStoreService.updateStore.mockResolvedValue(updatedStore);

      await storeController.updateStore(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        data: updatedStore
      });
    });
  });

  describe('uploadLogo', () => {
    it('should upload store logo successfully', async () => {
      mockRequest.params = { id: mockStore._id.toString() };
      mockRequest.file = {
        path: 'uploads/stores/logo.png'
      } as Express.Multer.File;
      
      const updatedStore = {
        ...mockStore,
        logo: 'uploads/stores/logo.png'
      };
      mockStoreService.getStoreById.mockResolvedValue(mockStore);
      mockStoreService.updateStore.mockResolvedValue(updatedStore);

      await storeController.uploadLogo(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        data: updatedStore
      });
    });

    it('should handle missing file error', async () => {
      mockRequest.params = { id: mockStore._id.toString() };
      mockRequest.file = undefined;

      await storeController.uploadLogo(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'No file uploaded'
      });
    });
  });

  describe('deleteStore', () => {
    it('should delete store successfully', async () => {
      mockRequest.params = { id: mockStore._id.toString() };
      mockStoreService.deleteStore.mockResolvedValue(mockStore);

      await storeController.deleteStore(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockStore
      });
    });
  });
}); 