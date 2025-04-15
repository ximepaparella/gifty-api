import { Express } from 'express';
import { storeRouter } from './store/interface/store.routes';
import { productRouter } from './product/interface/product.routes';
import { userRouter } from './user/interface/user.routes';
import { orderRouter } from './order/interface/order.routes';
import { voucherRouter } from './voucher/interface/voucher.routes';
import { customerRouter } from './customer/interface/customer.routes';

export const setupRoutes = (app: Express): void => {
  app.use('/api/v1/stores', storeRouter);
  app.use('/api/v1/products', productRouter);
  app.use('/api/v1/users', userRouter);
  app.use('/api/v1/orders', orderRouter);
  app.use('/api/v1/vouchers', voucherRouter);
  app.use('/api/v1/customers', customerRouter);
}; 