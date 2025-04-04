import mongoose from 'mongoose';
import { VoucherRepository } from '@modules/voucher/infrastructure/voucher.repository';
import { IVoucher, IVoucherInput } from '@modules/voucher/domain/voucher.interface';

// Mock the VoucherModel
const mockSave = jest.fn();
const mockExec = jest.fn();
const mockLean = jest.fn();

const mockVoucherModel = {
  create: jest.fn(),
  findById: jest.fn(() => ({ lean: () => mockLean })),
  findByIdAndUpdate: jest.fn(() => ({ lean: () => mockLean })),
  findOneAndUpdate: jest.fn(() => ({ lean: () => mockLean })),
  deleteOne: jest.fn(),
  find: jest.fn(() => ({ lean: () => mockLean })),
  findOne: jest.fn(() => ({ lean: () => mockLean })),
  prototype: {
    save: mockSave
  }
};

jest.mock('@modules/voucher/infrastructure/voucher.model', () => mockVoucherModel);

describe('VoucherRepository', () => {
  let voucherRepository: VoucherRepository;
  const mockId = new mongoose.Types.ObjectId().toString();
  const mockStoreId = new mongoose.Types.ObjectId().toString();
  const mockProductId = new mongoose.Types.ObjectId().toString();
  
  const mockVoucher = {
    _id: mockId,
    code: 'TEST123',
    amount: 100,
    expirationDate: new Date('2025-04-04'),
    senderName: 'John Doe',
    senderEmail: 'john@example.com',
    receiverName: 'Jane Doe',
    receiverEmail: 'jane@example.com',
    storeId: mockStoreId,
    productId: mockProductId,
    template: 'birthday' as const,
    message: 'Happy Birthday!',
    status: 'active' as const,
    isRedeemed: false,
    qrCode: 'qr-code-data',
    customerId: undefined,
    createdAt: new Date(),
    updatedAt: new Date()
  } as IVoucher;

  beforeEach(() => {
    jest.clearAllMocks();
    voucherRepository = new VoucherRepository();

    // Setup default mock implementations
    mockLean.mockResolvedValue(mockVoucher);
    mockSave.mockResolvedValue(mockVoucher);
    mockExec.mockResolvedValue(mockVoucher);
    mockVoucherModel.create.mockResolvedValue(mockVoucher);
    mockVoucherModel.deleteOne.mockResolvedValue({ deletedCount: 1 });
  });

  describe('create', () => {
    it('should create a new voucher', async () => {
      const voucherInput: IVoucherInput = {
        amount: mockVoucher.amount,
        expirationDate: mockVoucher.expirationDate,
        senderName: mockVoucher.senderName,
        senderEmail: mockVoucher.senderEmail,
        receiverName: mockVoucher.receiverName,
        receiverEmail: mockVoucher.receiverEmail,
        storeId: mockVoucher.storeId,
        productId: mockVoucher.productId,
        template: mockVoucher.template,
        message: mockVoucher.message
      };

      const result = await voucherRepository.create(voucherInput);

      expect(mockVoucherModel.create).toHaveBeenCalledWith(expect.objectContaining(voucherInput));
      expect(result).toEqual(mockVoucher);
    });
  });

  describe('findById', () => {
    it('should find a voucher by id', async () => {
      const result = await voucherRepository.findById(mockId);

      expect(mockVoucherModel.findById).toHaveBeenCalledWith(mockId);
      expect(result).toEqual(mockVoucher);
    });
  });

  describe('update', () => {
    it('should update a voucher', async () => {
      const updateData = {
        amount: 200,
        senderName: 'Updated Name'
      };

      const result = await voucherRepository.update(mockId, updateData);

      expect(mockVoucherModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockId,
        { $set: updateData },
        { new: true }
      );
      expect(result).toEqual(mockVoucher);
    });
  });

  describe('delete', () => {
    it('should return true when voucher is deleted', async () => {
      const result = await voucherRepository.delete(mockId);

      expect(mockVoucherModel.deleteOne).toHaveBeenCalledWith({ _id: mockId });
      expect(result).toBe(true);
    });

    it('should return false when voucher is not found', async () => {
      mockVoucherModel.deleteOne.mockResolvedValue({ deletedCount: 0 });

      const result = await voucherRepository.delete('non-existent-id');

      expect(mockVoucherModel.deleteOne).toHaveBeenCalledWith({ _id: 'non-existent-id' });
      expect(result).toBe(false);
    });
  });

  describe('findAll', () => {
    it('should return all vouchers', async () => {
      mockLean.mockResolvedValue([mockVoucher]);

      const result = await voucherRepository.findAll();

      expect(mockVoucherModel.find).toHaveBeenCalled();
      expect(result).toEqual([mockVoucher]);
    });
  });

  describe('findByCode', () => {
    it('should return voucher by code', async () => {
      const result = await voucherRepository.findByCode(mockVoucher.code);

      expect(mockVoucherModel.findOne).toHaveBeenCalledWith({ code: mockVoucher.code });
      expect(result).toEqual(mockVoucher);
    });

    it('should return null if voucher not found', async () => {
      mockLean.mockResolvedValue(null);

      const result = await voucherRepository.findByCode('INVALID-CODE');

      expect(mockVoucherModel.findOne).toHaveBeenCalledWith({ code: 'INVALID-CODE' });
      expect(result).toBeNull();
    });
  });

  describe('findByStoreId', () => {
    it('should find vouchers by store ID', async () => {
      mockLean.mockResolvedValue([mockVoucher]);

      const result = await voucherRepository.findByStoreId(mockVoucher.storeId);

      expect(mockVoucherModel.find).toHaveBeenCalledWith({ storeId: mockVoucher.storeId });
      expect(result).toEqual([mockVoucher]);
    });
  });

  describe('findByCustomerEmail', () => {
    it('should return vouchers by customer email', async () => {
      mockLean.mockResolvedValue([mockVoucher]);

      const result = await voucherRepository.findByCustomerEmail(mockVoucher.receiverEmail);

      expect(mockVoucherModel.find).toHaveBeenCalledWith({ receiverEmail: mockVoucher.receiverEmail });
      expect(result).toEqual([mockVoucher]);
    });
  });

  describe('redeem', () => {
    it('should redeem a voucher', async () => {
      const redeemedVoucher = {
        ...mockVoucher,
        isRedeemed: true,
        redeemedAt: expect.any(Date)
      };
      mockLean.mockResolvedValue(redeemedVoucher);

      const result = await voucherRepository.redeem(mockVoucher.code);

      expect(mockVoucherModel.findOneAndUpdate).toHaveBeenCalledWith(
        { code: mockVoucher.code, isRedeemed: false },
        { $set: { isRedeemed: true, redeemedAt: expect.any(Date) } },
        { new: true, runValidators: true }
      );
      expect(result).toEqual(redeemedVoucher);
    });

    it('should return null if voucher not found or already redeemed', async () => {
      mockLean.mockResolvedValue(null);

      const result = await voucherRepository.redeem('INVALID-CODE');

      expect(mockVoucherModel.findOneAndUpdate).toHaveBeenCalledWith(
        { code: 'INVALID-CODE', isRedeemed: false },
        { $set: { isRedeemed: true, redeemedAt: expect.any(Date) } },
        { new: true, runValidators: true }
      );
      expect(result).toBeNull();
    });
  });
}); 