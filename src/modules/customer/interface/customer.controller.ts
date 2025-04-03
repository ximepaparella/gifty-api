import { Request, Response, NextFunction } from 'express';
import { CustomerService } from '../application/customer.service';
import { handleAsync } from '@shared/infrastructure/middleware/asyncHandler';
import { ICustomer } from '../domain/customer.entity';
import logger from '@shared/infrastructure/logging/logger';

export class CustomerController {
  private service: CustomerService;

  constructor(service: CustomerService = new CustomerService()) {
    this.service = service;
  }

  createCustomer = handleAsync(async (req: Request, res: Response, next: NextFunction) => {
    logger.debug('Received request to create customer', req.body);
    const customerData: Omit<ICustomer, '_id' | 'createdAt' | 'updatedAt'> = req.body;
    const customer = await this.service.createCustomer(customerData);
    res.status(201).json({
      status: 'success',
      data: customer
    });
  });

  getCustomers = handleAsync(async (req: Request, res: Response, next: NextFunction) => {
    logger.debug('Received request to get all customers', req.query);
    const customers = await this.service.getCustomers(req.query); // Pass query params if needed
    res.status(200).json({
      status: 'success',
      data: customers
    });
  });

  getCustomerById = handleAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    logger.debug(`Received request to get customer by ID: ${id}`);
    const customer = await this.service.getCustomerById(id);
    res.status(200).json({
      status: 'success',
      data: customer
    });
  });

  updateCustomer = handleAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    logger.debug(`Received request to update customer ID: ${id}`, req.body);
    const customerData: Partial<Omit<ICustomer, '_id' | 'createdAt' | 'updatedAt'>> = req.body;
    const customer = await this.service.updateCustomer(id, customerData);
    res.status(200).json({
      status: 'success',
      data: customer
    });
  });

  deleteCustomer = handleAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    logger.debug(`Received request to delete customer ID: ${id}`);
    const customer = await this.service.deleteCustomer(id);
    res.status(200).json({
      status: 'success',
      message: 'Customer deleted successfully',
      data: customer // Optionally return the deleted customer
    });
  });

  getOrCreateCustomer = handleAsync(async (req: Request, res: Response, next: NextFunction) => {
    logger.debug('Received request to get or create customer', req.body);
    const customerData: Omit<ICustomer, '_id' | 'createdAt' | 'updatedAt'> = req.body;
    const customer = await this.service.getOrCreateCustomer(customerData);
    res.status(200).json({
      status: 'success',
      data: customer
    });
  });
} 