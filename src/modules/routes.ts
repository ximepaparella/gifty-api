import { Express } from 'express';
import userRoutes from './user/interface/user.routes';
import storeRoutes from './store/interface/store.routes';
import productRoutes from './product/interface/product.routes';
import orderRoutes from './order/interface/order.routes';
import voucherRoutes from './voucher/interface/voucher.routes';
import customerRoutes from './customer/interface/customer.routes';

export function setupRoutes(app: Express): void {
  app.use('/api/v1/users', userRoutes);
  app.use('/api/v1/stores', storeRoutes);
  app.use('/api/v1/products', productRoutes);
  app.use('/api/v1/orders', orderRoutes);
  app.use('/api/v1/vouchers', voucherRoutes);
  app.use('/api/v1/customers', customerRoutes);
} 