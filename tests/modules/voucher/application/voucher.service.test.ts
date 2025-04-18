import { VoucherService } from '@modules/voucher/application/voucher.service';
import {
  IVoucher,
  IVoucherInput,
  IVoucherRepository,
} from '@modules/voucher/domain/voucher.interface';
import mongoose from 'mongoose';
import {
  AppError,
  NotFoundError,
  ValidationError as BadRequestError,
} from '@shared/infrastructure/errors';

describe('Voucher Service', () => {
  let voucherService: VoucherService;
  let mockVoucherRepository: jest.Mocked<IVoucherRepository>;

  const mockVoucher: IVoucher = {
    _id: new mongoose.Types.ObjectId().toString(),
    code: 'TEST123',
    storeId: new mongoose.Types.ObjectId().toString(),
    productId: new mongoose.Types.ObjectId().toString(),
    amount: 50,
    expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    isRedeemed: false,
    status: 'active',
    senderName: 'Test Sender',
    senderEmail: 'sender@test.com',
    receiverName: 'Test Receiver',
    receiverEmail: 'receiver@test.com',
    message: 'Test message',
    template: 'template1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    mockVoucherRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByCode: jest.fn(),
      findByStoreId: jest.fn(),
      findByCustomerEmail: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      redeem: jest.fn(),
      generateVoucher: jest.fn(),
    } as unknown as jest.Mocked<IVoucherRepository>;

    voucherService = new VoucherService(mockVoucherRepository);
  });

  describe('getAllVouchers', () => {
    it('should return all vouchers', async () => {
      const vouchers = [mockVoucher];
      mockVoucherRepository.findAll.mockResolvedValue(vouchers);

      const result = await voucherService.getAllVouchers();

      expect(mockVoucherRepository.findAll).toHaveBeenCalled();
      expect(result).toEqual(vouchers);
    });
  });

  describe('getVoucherById', () => {
    it('should return voucher by id', async () => {
      mockVoucherRepository.findById.mockResolvedValue(mockVoucher);

      const result = await voucherService.getVoucherById(mockVoucher._id!);

      expect(mockVoucherRepository.findById).toHaveBeenCalledWith(mockVoucher._id);
      expect(result).toEqual(mockVoucher);
    });

    it('should throw NotFoundError if voucher not found', async () => {
      mockVoucherRepository.findById.mockResolvedValue(null);

      await expect(voucherService.getVoucherById('non-existent-id')).rejects.toThrow(AppError);
      await expect(voucherService.getVoucherById('non-existent-id')).rejects.toThrow(
        'Voucher with ID non-existent-id not found'
      );

      expect(mockVoucherRepository.findById).toHaveBeenCalledWith('non-existent-id');
    });
  });

  describe('getVoucherByCode', () => {
    it('should return voucher by code', async () => {
      mockVoucherRepository.findByCode.mockResolvedValue(mockVoucher);

      const result = await voucherService.getVoucherByCode(mockVoucher.code);

      expect(mockVoucherRepository.findByCode).toHaveBeenCalledWith(mockVoucher.code);
      expect(result).toEqual(mockVoucher);
    });

    it('should throw NotFoundError if voucher not found', async () => {
      mockVoucherRepository.findByCode.mockResolvedValue(null);

      await expect(voucherService.getVoucherByCode('NON-EXISTENT')).rejects.toThrow(AppError);
      await expect(voucherService.getVoucherByCode('NON-EXISTENT')).rejects.toThrow(
        'Voucher with code NON-EXISTENT not found'
      );

      expect(mockVoucherRepository.findByCode).toHaveBeenCalledWith('NON-EXISTENT');
    });
  });

  describe('getVouchersByStoreId', () => {
    it('should return vouchers by store id', async () => {
      const vouchers = [mockVoucher];
      mockVoucherRepository.findByStoreId.mockResolvedValue(vouchers);

      const result = await voucherService.getVouchersByStoreId(mockVoucher.storeId.toString());

      expect(mockVoucherRepository.findByStoreId).toHaveBeenCalledWith(
        mockVoucher.storeId.toString()
      );
      expect(result).toEqual(vouchers);
    });
  });

  describe('getVouchersByCustomerEmail', () => {
    it('should get vouchers by customer email', async () => {
      const vouchers = [mockVoucher];
      mockVoucherRepository.findByCustomerEmail.mockResolvedValue(vouchers);

      const result = await voucherService.getVouchersByCustomerEmail(mockVoucher.receiverEmail);

      expect(mockVoucherRepository.findByCustomerEmail).toHaveBeenCalledWith(
        mockVoucher.receiverEmail
      );
      expect(result).toEqual(vouchers);
    });
  });

  describe('createVoucher', () => {
    it('should create a new voucher', async () => {
      const voucherInput: IVoucherInput = {
        storeId: mockVoucher.storeId.toString(),
        productId: mockVoucher.productId.toString(),
        amount: mockVoucher.amount,
        expirationDate: mockVoucher.expirationDate,
        senderName: mockVoucher.senderName,
        senderEmail: mockVoucher.senderEmail,
        receiverName: mockVoucher.receiverName,
        receiverEmail: mockVoucher.receiverEmail,
        message: mockVoucher.message,
        template: mockVoucher.template,
      };

      mockVoucherRepository.create.mockResolvedValue(mockVoucher);

      const result = await voucherService.createVoucher(voucherInput);

      expect(mockVoucherRepository.create).toHaveBeenCalledWith(voucherInput);
      expect(result).toEqual(mockVoucher);
    });

    it('should handle expirationDate validation', async () => {
      const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // 1 day in the past

      const voucherInput: IVoucherInput = {
        storeId: mockVoucher.storeId.toString(),
        productId: mockVoucher.productId.toString(),
        amount: mockVoucher.amount,
        expirationDate: pastDate,
        senderName: mockVoucher.senderName,
        senderEmail: mockVoucher.senderEmail,
        receiverName: mockVoucher.receiverName,
        receiverEmail: mockVoucher.receiverEmail,
        message: mockVoucher.message,
        template: mockVoucher.template,
      };

      await expect(voucherService.createVoucher(voucherInput)).rejects.toThrow(AppError);
      await expect(voucherService.createVoucher(voucherInput)).rejects.toThrow(
        'Invalid voucher data'
      );
    });
  });

  describe('updateVoucher', () => {
    it('should update an existing voucher', async () => {
      const updateData: Partial<IVoucherInput> = {
        senderName: mockVoucher.senderName,
        senderEmail: mockVoucher.senderEmail,
        receiverName: mockVoucher.receiverName,
        receiverEmail: mockVoucher.receiverEmail,
        message: 'Updated message',
      };

      const updatedVoucher = { ...mockVoucher, ...updateData };

      mockVoucherRepository.findById.mockResolvedValue(mockVoucher);
      mockVoucherRepository.update.mockResolvedValue(updatedVoucher);

      const result = await voucherService.updateVoucher(mockVoucher._id!, updateData);

      expect(mockVoucherRepository.findById).toHaveBeenCalledWith(mockVoucher._id);
      expect(mockVoucherRepository.update).toHaveBeenCalledWith(mockVoucher._id, updateData);
      expect(result).toEqual(updatedVoucher);
    });

    it('should throw NotFoundError if voucher not found', async () => {
      mockVoucherRepository.findById.mockResolvedValue(null);

      await expect(
        voucherService.updateVoucher('non-existent-id', { message: 'Updated' })
      ).rejects.toThrow(AppError);
      await expect(
        voucherService.updateVoucher('non-existent-id', { message: 'Updated' })
      ).rejects.toThrow('Voucher with ID non-existent-id not found');

      expect(mockVoucherRepository.findById).toHaveBeenCalledWith('non-existent-id');
      expect(mockVoucherRepository.update).not.toHaveBeenCalled();
    });

    it('should throw BadRequestError if trying to update redeemed voucher', async () => {
      const redeemedVoucher = { ...mockVoucher, isRedeemed: true };
      mockVoucherRepository.findById.mockResolvedValue(redeemedVoucher);
      mockVoucherRepository.update.mockResolvedValue(null);

      await expect(
        voucherService.updateVoucher(redeemedVoucher._id!, { message: 'Updated' })
      ).rejects.toThrow(AppError);
      await expect(
        voucherService.updateVoucher(redeemedVoucher._id!, { message: 'Updated' })
      ).rejects.toThrow(`Failed to update voucher with ID ${redeemedVoucher._id}`);

      expect(mockVoucherRepository.findById).toHaveBeenCalledWith(redeemedVoucher._id);
      expect(mockVoucherRepository.update).toHaveBeenCalled();
    });
  });

  describe('deleteVoucher', () => {
    it('should delete a voucher', async () => {
      const voucherId = 'valid-id';
      mockVoucherRepository.findById.mockResolvedValue(mockVoucher);
      mockVoucherRepository.delete.mockResolvedValue(true);

      await voucherService.deleteVoucher(voucherId);

      expect(mockVoucherRepository.findById).toHaveBeenCalledWith(voucherId);
      expect(mockVoucherRepository.delete).toHaveBeenCalledWith(voucherId);
    });
  });

  describe('redeemVoucher', () => {
    it('should redeem a valid voucher', async () => {
      const code = 'TEST123';
      const redeemedVoucher = {
        ...mockVoucher,
        isRedeemed: true,
        redeemedAt: new Date(),
      };
      mockVoucherRepository.redeem.mockResolvedValue(redeemedVoucher);

      const result = await voucherService.redeemVoucher(code);

      expect(result).toEqual(redeemedVoucher);
      expect(mockVoucherRepository.redeem).toHaveBeenCalledWith(code);
    });
  });

  describe('generateVoucher', () => {
    it('should generate a new voucher', async () => {
      const voucherInput: IVoucherInput = {
        storeId: mockVoucher.storeId.toString(),
        productId: mockVoucher.productId.toString(),
        amount: mockVoucher.amount,
        expirationDate: mockVoucher.expirationDate,
        senderName: mockVoucher.senderName,
        senderEmail: mockVoucher.senderEmail,
        receiverName: mockVoucher.receiverName,
        receiverEmail: mockVoucher.receiverEmail,
        message: mockVoucher.message,
        template: mockVoucher.template,
      };

      mockVoucherRepository.generateVoucher.mockResolvedValue(mockVoucher);

      const result = await voucherService.generateVoucher(voucherInput);

      expect(result).toEqual(mockVoucher);
      expect(mockVoucherRepository.generateVoucher).toHaveBeenCalledWith(voucherInput);
    });
  });
});
