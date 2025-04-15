import { IOrder, IOrderInput, IOrderRepository } from '../domain/order.interface';
import { OrderModel } from '../domain/order.schema';
import { ErrorTypes } from '@shared/types/appError';
import { logger } from '@shared/infrastructure/logging/logger';
import mongoose from 'mongoose';

export class OrderRepository implements IOrderRepository {
  async findAll(): Promise<IOrder[]> {
    return OrderModel.find().exec();
  }

  async findById(id: string): Promise<IOrder | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    return OrderModel.findById(id).exec();
  }

  async findByCustomerId(customerId: string): Promise<IOrder[]> {
    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      return [];
    }
    return OrderModel.find({ customerId }).exec();
  }

  async findByVoucherCode(code: string): Promise<IOrder | null> {
    try {
      return await OrderModel.findOne({ 'voucher.code': code }).exec();
    } catch (error: any) {
      logger.error(`Error finding order by voucher code ${code}:`, error);
      throw error;
    }
  }

  async create(orderInput: IOrderInput): Promise<IOrder> {
    const order: IOrder = {
      ...orderInput,
      voucher: {
        ...orderInput.voucher,
        status: 'active',
        isRedeemed: false,
        redeemedAt: null,
      },
      paymentDetails: {
        ...orderInput.paymentDetails,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      emailsSent: false,
      pdfGenerated: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const newOrder = new OrderModel(order);
    return newOrder.save();
  }

  async update(id: string, order: Partial<IOrderInput>): Promise<IOrder | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    return OrderModel.findByIdAndUpdate(id, order, { new: true }).exec();
  }

  async delete(id: string): Promise<boolean> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return false;
    }
    const result = await OrderModel.findByIdAndDelete(id).exec();
    return result !== null;
  }

  async updateEmailSentStatus(id: string, status: boolean): Promise<IOrder | null> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return null;
      }

      logger.info(`Updating email sent status for order ${id} to ${status}`);

      const updatedOrder = await OrderModel.findByIdAndUpdate(
        id,
        { $set: { emailsSent: status } },
        { new: true }
      ).exec();

      if (!updatedOrder) {
        logger.warn(`Order with ID ${id} not found for email status update`);
        return null;
      }

      logger.info(`Email sent status for order ${id} updated successfully`);
      return updatedOrder;
    } catch (error) {
      logger.error(`Error updating email sent status for order ${id}:`, error);
      throw error;
    }
  }

  async updatePdfGeneratedStatus(id: string, status: boolean): Promise<IOrder | null> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return null;
      }

      logger.info(`Updating PDF generated status for order ${id} to ${status}`);

      const updatedOrder = await OrderModel.findByIdAndUpdate(
        id,
        { $set: { pdfGenerated: status } },
        { new: true }
      ).exec();

      if (!updatedOrder) {
        logger.warn(`Order with ID ${id} not found for PDF status update`);
        return null;
      }

      logger.info(`PDF generated status for order ${id} updated successfully`);
      return updatedOrder;
    } catch (error) {
      logger.error(`Error updating PDF generated status for order ${id}:`, error);
      throw error;
    }
  }

  async redeemVoucher(voucherCode: string): Promise<IOrder | null> {
    try {
      logger.info(`Attempting to redeem voucher with code: ${voucherCode}`);

      // Use atomic findOneAndUpdate to prevent race conditions
      const now = new Date();
      const redeemedOrder = await OrderModel.findOneAndUpdate(
        {
          'voucher.code': voucherCode,
          'voucher.status': 'active',
          'voucher.expirationDate': { $gte: now },
        },
        {
          $set: {
            'voucher.status': 'redeemed',
            'voucher.redeemedAt': now,
          },
        },
        {
          new: true, // Return the updated document
          runValidators: true, // Run model validators
        }
      ).exec();

      if (!redeemedOrder) {
        // Check if the voucher exists but is already redeemed or expired
        const existingOrder = await OrderModel.findOne({ 'voucher.code': voucherCode }).exec();

        if (!existingOrder) {
          logger.warn(`Voucher with code ${voucherCode} not found`);
          throw ErrorTypes.NOT_FOUND(`Voucher with code ${voucherCode}`);
        }

        if (existingOrder.voucher.status === 'redeemed') {
          logger.warn(`Voucher with code ${voucherCode} has already been redeemed`);
          throw ErrorTypes.BAD_REQUEST(
            `Voucher with code ${voucherCode} has already been redeemed`
          );
        }

        if (existingOrder.voucher.expirationDate < now) {
          logger.warn(`Voucher with code ${voucherCode} has expired`);
          throw ErrorTypes.BAD_REQUEST(`Voucher with code ${voucherCode} has expired`);
        }

        logger.warn(`Unable to redeem voucher with code ${voucherCode}`);
        throw ErrorTypes.BAD_REQUEST(`Unable to redeem voucher with code ${voucherCode}`);
      }

      logger.info(`Voucher with code ${voucherCode} redeemed successfully`);
      return redeemedOrder;
    } catch (error: any) {
      logger.error(`Error redeeming voucher with code ${voucherCode}:`, error);
      throw error;
    }
  }

  async updatePdfUrl(id: string, pdfUrl: string): Promise<IOrder | null> {
    try {
      logger.info(`Updating PDF URL for order ${id} to ${pdfUrl}`);
      const updatedOrder = await OrderModel.findByIdAndUpdate(
        id,
        {
          $set: {
            pdfUrl: pdfUrl,
            pdfGenerated: true,
            updatedAt: new Date(),
          },
        },
        { new: true }
      ).exec();

      if (!updatedOrder) {
        logger.warn(`Order with ID ${id} not found when updating PDF URL`);
        return null;
      }

      logger.info(`Successfully updated PDF URL for order ${id}`);
      return updatedOrder;
    } catch (error: any) {
      logger.error(`Error updating PDF URL for order ${id}:`, error);
      throw error;
    }
  }

  async findOneAndUpdate(filter: any, update: any, options: any = {}): Promise<IOrder | null> {
    try {
      return await OrderModel.findOneAndUpdate(filter, update, options).exec();
    } catch (error: any) {
      logger.error('Error updating order:', error);
      throw error;
    }
  }
}
