import { StoreService } from '@modules/store/application/store.service';
import { IStore } from '@modules/store/domain/store.entity';
import { IStoreRepository } from '@modules/store/domain/store.repository';
import mongoose from 'mongoose';

describe('Store Service', () => {
  let storeService: StoreService;
  const mockRepository: jest.Mocked<IStoreRepository> = {
    create: jest.fn(),
    findById: jest.fn(),
    findByEmail: jest.fn(),
    findByOwnerId: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  };

  beforeEach(() => {
    storeService = new StoreService(mockRepository);
    jest.clearAllMocks();
  });

  const mockStoreData = {
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

  const mockStore: IStore = {
    ...mockStoreData,
    _id: new mongoose.Types.ObjectId()
  };

  describe('createStore', () => {
    it('should create a store successfully', async () => {
      mockRepository.findByEmail.mockResolvedValue(null);
      mockRepository.create.mockResolvedValue(mockStore);

      const result = await storeService.createStore(mockStoreData);
      expect(result).toEqual(mockStore);
      expect(mockRepository.create).toHaveBeenCalledWith(expect.objectContaining({
        ...mockStoreData
      }));
    });

    it('should throw error if email already exists', async () => {
      mockRepository.findByEmail.mockResolvedValue(mockStore);

      await expect(storeService.createStore(mockStoreData))
        .rejects
        .toThrow('Store with this email already exists');
    });
  });

  describe('getStores', () => {
    it('should return all stores', async () => {
      const stores = [mockStore];
      mockRepository.findAll.mockResolvedValue(stores);

      const result = await storeService.getStores();
      expect(result).toEqual(stores);
    });
  });

  describe('getStoreById', () => {
    it('should return store by id', async () => {
      mockRepository.findById.mockResolvedValue(mockStore);

      const result = await storeService.getStoreById('someId');
      expect(result).toEqual(mockStore);
    });

    it('should throw error if store not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(storeService.getStoreById('someId'))
        .rejects
        .toThrow('Store not found');
    });
  });

  describe('updateStore', () => {
    const updateData = {
      name: 'Updated Store',
      email: 'updated@test.com',
      phone: '0987654321',
      address: '321 Updated St',
      logo: 'https://example.com/updated-logo.png',
      social: {
        instagram: 'https://instagram.com/updatedstore',
        facebook: 'https://facebook.com/updatedstore',
        twitter: 'https://twitter.com/updatedstore'
      }
    };

    it('should update store successfully', async () => {
      mockRepository.findById.mockResolvedValue(mockStore);
      mockRepository.findByEmail.mockResolvedValue(null);
      mockRepository.update.mockResolvedValue({ ...mockStore, ...updateData });

      const result = await storeService.updateStore('someId', updateData);
      expect(result.name).toBe(updateData.name);
      expect(result.logo).toBe(updateData.logo);
      expect(result.social).toEqual(updateData.social);
    });

    it('should throw error if store not found', async () => {
      mockRepository.findById.mockResolvedValue(null);
      mockRepository.findByEmail.mockResolvedValue(null);
      mockRepository.update.mockResolvedValue(null);

      await expect(storeService.updateStore('someId', updateData))
        .rejects
        .toThrow('Store not found');
    });

    it('should update only social media links', async () => {
      const socialUpdateData = {
        social: {
          instagram: 'https://instagram.com/newstore',
          facebook: 'https://facebook.com/newstore'
        }
      };

      mockRepository.findById.mockResolvedValue(mockStore);
      mockRepository.update.mockResolvedValue({ ...mockStore, ...socialUpdateData });

      const result = await storeService.updateStore('someId', socialUpdateData);
      expect(result.social).toEqual(socialUpdateData.social);
    });

    it('should update logo', async () => {
      const logoUpdateData = {
        logo: 'https://example.com/new-logo.png'
      };

      mockRepository.findById.mockResolvedValue(mockStore);
      mockRepository.update.mockResolvedValue({ ...mockStore, ...logoUpdateData });

      const result = await storeService.updateStore('someId', logoUpdateData);
      expect(result.logo).toBe(logoUpdateData.logo);
    });
  });

  describe('deleteStore', () => {
    it('should delete store successfully', async () => {
      mockRepository.delete.mockResolvedValue(mockStore);

      const result = await storeService.deleteStore('someId');
      expect(result).toEqual(mockStore);
    });

    it('should throw error if store not found', async () => {
      mockRepository.delete.mockResolvedValue(null);

      await expect(storeService.deleteStore('someId'))
        .rejects
        .toThrow('Store not found');
    });
  });
}); 