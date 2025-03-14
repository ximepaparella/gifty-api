import mongoose from 'mongoose';
import { VoucherRepository } from '@modules/voucher/infrastructure/voucher.repository';
import { IVoucher, IVoucherInput } from '@modules/voucher/domain/voucher.interface';
import VoucherModel from '@modules/voucher/infrastructure/voucher.model';

jest.mock('@modules/voucher/infrastructure/voucher.model');

describe('Voucher Repository', () => {
  let voucherRepository: VoucherRepository;
  
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
    jest.clearAllMocks();
    voucherRepository = new VoucherRepository();
  });

  describe('findAll', () => {
    it('should return all vouchers', async () => {
      const vouchers = [mockVoucher];
      
      (VoucherModel.find as jest.Mock).mockReturnValue({
        lean: jest.fn().mockResolvedValue(vouchers)
      });

      const result = await voucherRepository.findAll();
      
      expect(VoucherModel.find).toHaveBeenCalledWith();
      expect(result).toEqual(vouchers);
    });
  });

  describe('findById', () => {
    it('should return voucher by id', async () => {
      (VoucherModel.findById as jest.Mock).mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockVoucher)
      });

      const result = await voucherRepository.findById(mockVoucher._id!);
      
      expect(VoucherModel.findById).toHaveBeenCalledWith(mockVoucher._id);
      expect(result).toEqual(mockVoucher);
    });

    it('should return null if voucher not found', async () => {
      (VoucherModel.findById as jest.Mock).mockReturnValue({
        lean: jest.fn().mockResolvedValue(null)
      });

      const result = await voucherRepository.findById('non-existent-id');
      
      expect(VoucherModel.findById).toHaveBeenCalledWith('non-existent-id');
      expect(result).toBeNull();
    });
  });

  describe('findByCode', () => {
    it('should return voucher by code', async () => {
      (VoucherModel.findOne as jest.Mock).mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockVoucher)
      });

      const result = await voucherRepository.findByCode(mockVoucher.code);
      
      expect(VoucherModel.findOne).toHaveBeenCalledWith({ code: mockVoucher.code });
      expect(result).toEqual(mockVoucher);
    });

    it('should return null if voucher not found', async () => {
      (VoucherModel.findOne as jest.Mock).mockReturnValue({
        lean: jest.fn().mockResolvedValue(null)
      });

      const result = await voucherRepository.findByCode('NON-EXISTENT');
      
      expect(VoucherModel.findOne).toHaveBeenCalledWith({ code: 'NON-EXISTENT' });
      expect(result).toBeNull();
    });
  });

  describe('findByStoreId', () => {
    it('should return vouchers by store id', async () => {
      const vouchers = [mockVoucher];
      
      (VoucherModel.find as jest.Mock).mockReturnValue({
        lean: jest.fn().mockResolvedValue(vouchers)
      });

      const result = await voucherRepository.findByStoreId(mockVoucher.storeId.toString());
      
      expect(VoucherModel.find).toHaveBeenCalledWith({ storeId: mockVoucher.storeId.toString() });
      expect(result).toEqual(vouchers);
    });
  });

  describe('findByCustomerEmail', () => {
    it('should return vouchers by customer email', async () => {
      const vouchers = [mockVoucher];
      
      (VoucherModel.find as jest.Mock).mockReturnValue({
        lean: jest.fn().mockResolvedValue(vouchers)
      });

      const result = await voucherRepository.findByCustomerEmail(mockVoucher.receiverEmail);
      
      expect(VoucherModel.find).toHaveBeenCalledWith({ receiverEmail: mockVoucher.receiverEmail });
      expect(result).toEqual(vouchers);
    });
  });

  describe('create', () => {
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
      
      (VoucherModel.create as jest.Mock).mockResolvedValue({
        ...mockVoucher,
        toObject: jest.fn().mockReturnValue(mockVoucher)
      });

      const result = await voucherRepository.create(voucherInput);
      
      expect(VoucherModel.create).toHaveBeenCalledWith(voucherInput);
      expect(result).toEqual(mockVoucher);
    });
  });

  describe('update', () => {
    it('should update a voucher', async () => {
      const updateData = {
        message: 'Updated message',
        status: 'active'
      };
      
      const updatedVoucher = { ...mockVoucher, ...updateData };
      
      (VoucherModel.findByIdAndUpdate as jest.Mock).mockReturnValue({
        lean: jest.fn().mockResolvedValue(updatedVoucher)
      });

      const result = await voucherRepository.update(mockVoucher._id!, updateData);
      
      expect(VoucherModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockVoucher._id,
        updateData,
        { new: true }
      );
      expect(result).toEqual(updatedVoucher);
    });

    it('should return null if voucher not found', async () => {
      (VoucherModel.findByIdAndUpdate as jest.Mock).mockReturnValue({
        lean: jest.fn().mockResolvedValue(null)
      });

      const result = await voucherRepository.update('non-existent-id', { message: 'Updated' });
      
      expect(VoucherModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'non-existent-id',
        { message: 'Updated' },
        { new: true }
      );
      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete a voucher', async () => {
      (VoucherModel.findByIdAndDelete as jest.Mock).mockResolvedValue(mockVoucher);

      const result = await voucherRepository.delete(mockVoucher._id!);
      
      expect(VoucherModel.findByIdAndDelete).toHaveBeenCalledWith(mockVoucher._id);
      expect(result).toBe(true);
    });

    it('should return false if voucher not found', async () => {
      (VoucherModel.findByIdAndDelete as jest.Mock).mockResolvedValue(null);

      const result = await voucherRepository.delete('non-existent-id');
      
      expect(VoucherModel.findByIdAndDelete).toHaveBeenCalledWith('non-existent-id');
      expect(result).toBe(false);
    });
  });

  describe('redeem', () => {
    it('should redeem a voucher', async () => {
      const redeemedVoucher = {
        ...mockVoucher,
        isRedeemed: true,
        redeemedAt: new Date(),
        status: 'redeemed'
      };
      
      (VoucherModel.findOneAndUpdate as jest.Mock).mockReturnValue({
        lean: jest.fn().mockResolvedValue(redeemedVoucher)
      });

      const result = await voucherRepository.redeem(mockVoucher.code);
      
      expect(VoucherModel.findOneAndUpdate).toHaveBeenCalledWith(
        { code: mockVoucher.code, isRedeemed: false },
        { isRedeemed: true, redeemedAt: expect.any(Date), status: 'redeemed' },
        { new: true }
      );
      expect(result).toEqual(redeemedVoucher);
    });

    it('should return null if voucher not found or already redeemed', async () => {
      (VoucherModel.findOneAndUpdate as jest.Mock).mockReturnValue({
        lean: jest.fn().mockResolvedValue(null)
      });

      const result = await voucherRepository.redeem('REDEEMED-CODE');
      
      expect(VoucherModel.findOneAndUpdate).toHaveBeenCalledWith(
        { code: 'REDEEMED-CODE', isRedeemed: false },
        { isRedeemed: true, redeemedAt: expect.any(Date), status: 'redeemed' },
        { new: true }
      );
      expect(result).toBeNull();
    });
  });
}); 