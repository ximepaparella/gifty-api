import { IOrder, IOrderInput } from './order.interface';

export interface IOrderRepository {
  findAll(): Promise<IOrder[]>;
  findById(id: string): Promise<IOrder | null>;
  findByVoucherCode(code: string): Promise<IOrder | null>;
  create(order: IOrderInput): Promise<IOrder>;
  update(id: string, order: Partial<IOrder>): Promise<IOrder | null>;
  delete(id: string): Promise<boolean>;
  findOneAndUpdate(
    filter: any,
    update: any,
    options?: any
  ): Promise<IOrder | null>;
} 