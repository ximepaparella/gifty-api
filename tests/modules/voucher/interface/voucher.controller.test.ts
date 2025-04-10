import { Request, Response, NextFunction } from 'express';
import { VoucherController } from '@modules/voucher/interface/voucher.controller';
import { VoucherService } from '@modules/voucher/application/voucher.service';
import { IVoucher, IVoucherInput } from '@modules/voucher/domain/voucher.interface';
import mongoose from 'mongoose';

jest.mock('@modules/voucher/application/voucher.service');
jest.mock('@shared/utils/catchAsync', () => (fn: any) => fn);

describe('Voucher Controller', () => {
  let voucherController: VoucherController;
  let mockVoucherService: jest.Mocked<VoucherService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  const mockVoucher: IVoucher = {
    _id: new mongoose.Types.ObjectId().toString(),
    code: 'TEST123',
    storeId: new mongoose.Types.ObjectId().toString(),
    productId: new mongoose.Types.ObjectId().toString(),
    customerId: new mongoose.Types.ObjectId().toString(),
    amount: 50,
    expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    isRedeemed: false,
    status: 'active',
    qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA',
    senderName: 'Test Sender',
    senderEmail: 'sender@test.com',
    receiverName: 'Test Receiver',
    receiverEmail: 'receiver@test.com',
    message: 'Test message',
    template: 'birthday',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    mockVoucherService = {
      getAllVouchers: jest.fn(),
      getVoucherById: jest.fn(),
      getVoucherByCode: jest.fn(),
      getVouchersByStoreId: jest.fn(),
      getVouchersByCustomerEmail: jest.fn(),
      createVoucher: jest.fn(),
      updateVoucher: jest.fn(),
      deleteVoucher: jest.fn(),
      redeemVoucher: jest.fn(),
    } as unknown as jest.Mocked<VoucherService>;

    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn() as unknown as NextFunction;

    voucherController = new VoucherController(mockVoucherService);
  });

  describe('getAllVouchers', () => {
    it('should get all vouchers successfully', async () => {
      const vouchers: IVoucher[] = [mockVoucher];
      mockVoucherService.getAllVouchers.mockResolvedValue(vouchers);

      await voucherController.getAllVouchers(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: vouchers,
      });
    });

    it('should handle errors', async () => {
      const error = new Error('Test error');
      mockVoucherService.getAllVouchers.mockRejectedValue(error);

      await expect(
        voucherController.getAllVouchers(mockRequest as Request, mockResponse as Response, mockNext)
      ).rejects.toThrow('Test error');
    });
  });

  describe('getVoucherById', () => {
    it('should get voucher by id successfully', async () => {
      mockRequest.params = { id: mockVoucher._id! };
      mockVoucherService.getVoucherById.mockResolvedValue(mockVoucher);

      await voucherController.getVoucherById(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockVoucher,
      });
      expect(mockVoucherService.getVoucherById).toHaveBeenCalledWith(mockVoucher._id);
    });

    it('should handle errors when voucher not found', async () => {
      mockRequest.params = { id: 'non-existent-id' };
      const error = new Error('Voucher not found');
      mockVoucherService.getVoucherById.mockRejectedValue(error);

      await expect(
        voucherController.getVoucherById(mockRequest as Request, mockResponse as Response, mockNext)
      ).rejects.toThrow('Voucher not found');

      expect(mockVoucherService.getVoucherById).toHaveBeenCalledWith('non-existent-id');
    });
  });

  describe('getVoucherByCode', () => {
    it('should get voucher by code successfully', async () => {
      mockRequest.params = { code: mockVoucher.code };
      mockVoucherService.getVoucherByCode.mockResolvedValue(mockVoucher);

      await voucherController.getVoucherByCode(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockVoucher,
      });
      expect(mockVoucherService.getVoucherByCode).toHaveBeenCalledWith(mockVoucher.code);
    });

    it('should handle errors when voucher not found by code', async () => {
      mockRequest.params = { code: 'INVALID-CODE' };
      const error = new Error('Voucher not found');
      mockVoucherService.getVoucherByCode.mockRejectedValue(error);

      await expect(
        voucherController.getVoucherByCode(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        )
      ).rejects.toThrow('Voucher not found');

      expect(mockVoucherService.getVoucherByCode).toHaveBeenCalledWith('INVALID-CODE');
    });
  });

  describe('getVouchersByStoreId', () => {
    it('should get vouchers by store id successfully', async () => {
      const vouchers: IVoucher[] = [mockVoucher];
      mockRequest.params = { storeId: mockVoucher.storeId.toString() };
      mockVoucherService.getVouchersByStoreId.mockResolvedValue(vouchers);

      await voucherController.getVouchersByStoreId(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: vouchers,
      });
      expect(mockVoucherService.getVouchersByStoreId).toHaveBeenCalledWith(
        mockVoucher.storeId.toString()
      );
    });

    it('should handle errors when retrieving vouchers by store id fails', async () => {
      mockRequest.params = { storeId: 'invalid-store-id' };
      const error = new Error('Error retrieving vouchers');
      mockVoucherService.getVouchersByStoreId.mockRejectedValue(error);

      await expect(
        voucherController.getVouchersByStoreId(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        )
      ).rejects.toThrow('Error retrieving vouchers');

      expect(mockVoucherService.getVouchersByStoreId).toHaveBeenCalledWith('invalid-store-id');
    });
  });

  describe('getVouchersByCustomerEmail', () => {
    it('should get vouchers by customer email successfully', async () => {
      const vouchers: IVoucher[] = [mockVoucher];
      mockRequest.params = { email: mockVoucher.receiverEmail };
      mockVoucherService.getVouchersByCustomerEmail.mockResolvedValue(vouchers);

      await voucherController.getVouchersByCustomerEmail(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: vouchers,
      });
      expect(mockVoucherService.getVouchersByCustomerEmail).toHaveBeenCalledWith(
        mockVoucher.receiverEmail
      );
    });

    it('should handle errors when retrieving vouchers by customer email fails', async () => {
      mockRequest.params = { email: 'invalid@email.com' };
      const error = new Error('Error retrieving vouchers');
      mockVoucherService.getVouchersByCustomerEmail.mockRejectedValue(error);

      await expect(
        voucherController.getVouchersByCustomerEmail(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        )
      ).rejects.toThrow('Error retrieving vouchers');

      expect(mockVoucherService.getVouchersByCustomerEmail).toHaveBeenCalledWith(
        'invalid@email.com'
      );
    });
  });

  describe('createVoucher', () => {
    it('should create a voucher successfully', async () => {
      const voucherData: IVoucherInput = {
        storeId: mockVoucher.storeId.toString(),
        productId: mockVoucher.productId.toString(),
        customerId: mockVoucher.customerId!.toString(),
        amount: mockVoucher.amount,
        expirationDate: mockVoucher.expirationDate,
        qrCode: mockVoucher.qrCode!,
        senderName: mockVoucher.senderName,
        senderEmail: mockVoucher.senderEmail,
        receiverName: mockVoucher.receiverName,
        receiverEmail: mockVoucher.receiverEmail,
        message: mockVoucher.message,
        template: mockVoucher.template,
      };

      mockRequest.body = voucherData;
      mockVoucherService.createVoucher.mockResolvedValue(mockVoucher);

      await voucherController.createVoucher(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockVoucher,
      });
      expect(mockVoucherService.createVoucher).toHaveBeenCalledWith(voucherData);
    });

    it('should handle errors during creation', async () => {
      const voucherData: Partial<IVoucherInput> = {
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

      mockRequest.body = voucherData;
      const error = new Error('Validation error');
      mockVoucherService.createVoucher.mockRejectedValue(error);

      try {
        await voucherController.createVoucher(mockRequest as Request, mockResponse as Response);
      } catch (err) {
        expect(err).toEqual(error);
      }

      expect(mockVoucherService.createVoucher).toHaveBeenCalledWith(voucherData);
    });
  });

  describe('updateVoucher', () => {
    it('should update a voucher successfully', async () => {
      const updateData: Partial<IVoucherInput> = {
        message: 'Updated message',
        status: 'active',
      };

      mockRequest.params = { id: mockVoucher._id! };
      mockRequest.body = updateData;

      const updatedVoucher = { ...mockVoucher, ...updateData };
      mockVoucherService.updateVoucher.mockResolvedValue(updatedVoucher);

      await voucherController.updateVoucher(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: updatedVoucher,
      });
      expect(mockVoucherService.updateVoucher).toHaveBeenCalledWith(mockVoucher._id, updateData);
    });

    it('should handle errors during update', async () => {
      const updateData: Partial<IVoucherInput> = {
        message: 'Updated message',
      };

      mockRequest.params = { id: 'non-existent-id' };
      mockRequest.body = updateData;

      const error = new Error('Voucher not found');
      mockVoucherService.updateVoucher.mockRejectedValue(error);

      try {
        await voucherController.updateVoucher(mockRequest as Request, mockResponse as Response);
      } catch (err) {
        expect(err).toEqual(error);
      }

      expect(mockVoucherService.updateVoucher).toHaveBeenCalledWith('non-existent-id', updateData);
    });
  });

  describe('deleteVoucher', () => {
    it('should delete a voucher successfully', async () => {
      mockRequest.params = { id: mockVoucher._id! };
      mockVoucherService.deleteVoucher.mockResolvedValue(true);

      await voucherController.deleteVoucher(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Voucher deleted successfully',
      });
      expect(mockVoucherService.deleteVoucher).toHaveBeenCalledWith(mockVoucher._id);
    });

    it('should handle errors during deletion', async () => {
      mockRequest.params = { id: 'non-existent-id' };
      const error = new Error('Voucher not found');
      mockVoucherService.deleteVoucher.mockRejectedValue(error);

      await expect(
        voucherController.deleteVoucher(mockRequest as Request, mockResponse as Response, mockNext)
      ).rejects.toThrow('Voucher not found');

      expect(mockVoucherService.deleteVoucher).toHaveBeenCalledWith('non-existent-id');
    });
  });

  describe('redeemVoucher', () => {
    it('should redeem a voucher successfully', async () => {
      const redeemedVoucher: IVoucher = {
        ...mockVoucher,
        isRedeemed: true,
        redeemedAt: new Date(),
        status: 'redeemed',
      };

      mockRequest.params = { code: mockVoucher.code };
      mockVoucherService.redeemVoucher.mockResolvedValue(redeemedVoucher);

      await voucherController.redeemVoucher(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: redeemedVoucher,
        message: 'Voucher redeemed successfully',
      });
      expect(mockVoucherService.redeemVoucher).toHaveBeenCalledWith(mockVoucher.code);
    });

    it('should handle errors during redemption', async () => {
      mockRequest.params = { code: 'INVALID-CODE' };
      const error = new Error('Voucher not found or already redeemed');
      mockVoucherService.redeemVoucher.mockRejectedValue(error);

      await expect(
        voucherController.redeemVoucher(mockRequest as Request, mockResponse as Response, mockNext)
      ).rejects.toThrow('Voucher not found or already redeemed');

      expect(mockVoucherService.redeemVoucher).toHaveBeenCalledWith('INVALID-CODE');
    });
  });
});
