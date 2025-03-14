import { VoucherService } from '@modules/voucher/application/voucher.service';
import { IVoucher, IVoucherInput, IVoucherRepository } from '@modules/voucher/domain/voucher.interface';
import mongoose from 'mongoose';
import { NotFoundError, ValidationError as BadRequestError } from '@shared/infrastructure/errors';

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
    template: 'birthday',
    createdAt: new Date(),
    updatedAt: new Date()
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
      redeem: jest.fn()
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

      await expect(voucherService.getVoucherById('non-existent-id'))
        .rejects
        .toThrow(NotFoundError);
      
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

      await expect(voucherService.getVoucherByCode('NON-EXISTENT'))
        .rejects
        .toThrow(NotFoundError);
      
      expect(mockVoucherRepository.findByCode).toHaveBeenCalledWith('NON-EXISTENT');
    });
  });

  describe('getVouchersByStoreId', () => {
    it('should return vouchers by store id', async () => {
      const vouchers = [mockVoucher];
      mockVoucherRepository.findByStoreId.mockResolvedValue(vouchers);

      const result = await voucherService.getVouchersByStoreId(mockVoucher.storeId.toString());
      
      expect(mockVoucherRepository.findByStoreId).toHaveBeenCalledWith(mockVoucher.storeId.toString());
      expect(result).toEqual(vouchers);
    });
  });

  describe('getVouchersByCustomerEmail', () => {
    it('should get vouchers by customer email', async () => {
      const vouchers = [mockVoucher];
      mockVoucherRepository.findByCustomerEmail.mockResolvedValue(vouchers);

      const result = await voucherService.getVouchersByCustomerEmail(mockVoucher.receiverEmail);

      expect(mockVoucherRepository.findByCustomerEmail).toHaveBeenCalledWith(mockVoucher.receiverEmail);
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
        template: mockVoucher.template
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
        template: mockVoucher.template
      };

      await expect(voucherService.createVoucher(voucherInput))
        .rejects
        .toThrow(BadRequestError);
    });
  });

  describe('updateVoucher', () => {
    it('should update an existing voucher', async () => {
      const updateData: Partial<IVoucherInput> = {
        senderName: mockVoucher.senderName,
        senderEmail: mockVoucher.senderEmail,
        receiverName: mockVoucher.receiverName,
        receiverEmail: mockVoucher.receiverEmail,
        message: 'Updated message'
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

      await expect(voucherService.updateVoucher('non-existent-id', { message: 'Updated' }))
        .rejects
        .toThrow(NotFoundError);
      
      expect(mockVoucherRepository.findById).toHaveBeenCalledWith('non-existent-id');
      expect(mockVoucherRepository.update).not.toHaveBeenCalled();
    });

    it('should throw BadRequestError if trying to update redeemed voucher', async () => {
      const redeemedVoucher = { ...mockVoucher, isRedeemed: true };
      mockVoucherRepository.findById.mockResolvedValue(redeemedVoucher);

      await expect(voucherService.updateVoucher(redeemedVoucher._id!, { message: 'Updated' }))
        .rejects
        .toThrow(BadRequestError);
      
      expect(mockVoucherRepository.findById).toHaveBeenCalledWith(redeemedVoucher._id);
      expect(mockVoucherRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('deleteVoucher', () => {
    it('should delete an existing voucher', async () => {
      mockVoucherRepository.findById.mockResolvedValue(mockVoucher);
      mockVoucherRepository.delete.mockResolvedValue(true);

      const result = await voucherService.deleteVoucher(mockVoucher._id!);
      
      expect(mockVoucherRepository.findById).toHaveBeenCalledWith(mockVoucher._id);
      expect(mockVoucherRepository.delete).toHaveBeenCalledWith(mockVoucher._id);
      expect(result).toBe(true);
    });

    it('should throw NotFoundError if voucher not found', async () => {
      mockVoucherRepository.findById.mockResolvedValue(null);

      await expect(voucherService.deleteVoucher('non-existent-id'))
        .rejects
        .toThrow(NotFoundError);
      
      expect(mockVoucherRepository.findById).toHaveBeenCalledWith('non-existent-id');
      expect(mockVoucherRepository.delete).not.toHaveBeenCalled();
    });
  });

  describe('redeemVoucher', () => {
    it('should redeem a voucher', async () => {
      const redeemedVoucher = {
        ...mockVoucher,
        isRedeemed: true,
        redeemedAt: new Date(),
        status: 'redeemed'
      };
      
      mockVoucherRepository.findByCode.mockResolvedValue(mockVoucher);
      mockVoucherRepository.redeem.mockResolvedValue(redeemedVoucher);

      const result = await voucherService.redeemVoucher(mockVoucher.code);
      
      expect(mockVoucherRepository.findByCode).toHaveBeenCalledWith(mockVoucher.code);
      expect(mockVoucherRepository.redeem).toHaveBeenCalledWith(mockVoucher.code);
      expect(result).toEqual(redeemedVoucher);
    });

    it('should throw NotFoundError if voucher not found', async () => {
      mockVoucherRepository.findByCode.mockResolvedValue(null);

      await expect(voucherService.redeemVoucher('NON-EXISTENT'))
        .rejects
        .toThrow(NotFoundError);
      
      expect(mockVoucherRepository.findByCode).toHaveBeenCalledWith('NON-EXISTENT');
      expect(mockVoucherRepository.redeem).not.toHaveBeenCalled();
    });

    it('should throw BadRequestError if voucher is already redeemed', async () => {
      const redeemedVoucher = { ...mockVoucher, isRedeemed: true };
      mockVoucherRepository.findByCode.mockResolvedValue(redeemedVoucher);

      await expect(voucherService.redeemVoucher(redeemedVoucher.code))
        .rejects
        .toThrow(BadRequestError);
      
      expect(mockVoucherRepository.findByCode).toHaveBeenCalledWith(redeemedVoucher.code);
      expect(mockVoucherRepository.redeem).not.toHaveBeenCalled();
    });

    it('should throw BadRequestError if voucher is expired', async () => {
      const expiredVoucher = { 
        ...mockVoucher, 
        expirationDate: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day in the past
      };
      mockVoucherRepository.findByCode.mockResolvedValue(expiredVoucher);

      await expect(voucherService.redeemVoucher(expiredVoucher.code))
        .rejects
        .toThrow(BadRequestError);
      
      expect(mockVoucherRepository.findByCode).toHaveBeenCalledWith(expiredVoucher.code);
      expect(mockVoucherRepository.redeem).not.toHaveBeenCalled();
    });
  });
}); 