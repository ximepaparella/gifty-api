import { Request, Response, NextFunction } from 'express';
import { StoreController } from '@modules/store/interface/store.controller';
import { StoreService } from '@modules/store/application/store.service';
import mongoose from 'mongoose';

jest.mock('@modules/store/application/store.service');

describe('Store Controller', () => {
  let storeController: StoreController;
  let mockStoreService: jest.Mocked<StoreService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.MockedFunction<NextFunction>;
  const mockStore = {
    _id: new mongoose.Types.ObjectId(),
    name: 'Test Store',
    ownerId: new mongoose.Types.ObjectId(),
    email: 'store@test.com',
    phone: '1234567890',
    address: '123 Test St'
  };

  beforeEach(() => {
    mockStoreService = {
      createStore: jest.fn(),
      getStores: jest.fn(),
      getStoreById: jest.fn(),
      getStoresByOwnerId: jest.fn(),
      updateStore: jest.fn(),
      deleteStore: jest.fn()
    } as unknown as jest.Mocked<StoreService>;

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
      mockRequest.body = mockStore;
      mockStoreService.createStore.mockResolvedValue(mockStore);

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
      mockRequest.body = { name: 'Updated Store' };
      mockStoreService.updateStore.mockResolvedValue({ ...mockStore, name: 'Updated Store' });

      await storeController.updateStore(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        data: { ...mockStore, name: 'Updated Store' }
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