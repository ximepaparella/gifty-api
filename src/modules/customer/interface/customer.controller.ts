import { Request, Response, NextFunction } from 'express';
import { CustomerService } from '../application/customer.service';
import { ICustomer } from '../domain/customer.entity';
import logger from '@shared/infrastructure/logging/logger';
import { ErrorTypes } from '@shared/types/appError';

export class CustomerController {
  constructor(private customerService: CustomerService = new CustomerService()) {}

  createCustomer = async (req: Request, res: Response, next: NextFunction) => {
    try {
      logger.debug('Received request to create customer', req.body);
      const customerData: Omit<ICustomer, '_id' | 'createdAt' | 'updatedAt'> = req.body;

      if (!customerData.email) {
        return next(ErrorTypes.VALIDATION('Email is required'));
      }

      const customer = await this.customerService.createCustomer(customerData);
      if (!customer) {
        return next(ErrorTypes.INTERNAL('Failed to create customer'));
      }

      res.status(201).json({
        success: true,
        data: customer,
      });
    } catch (error) {
      logger.error('Error creating customer:', error);
      next(error);
    }
  };

  getCustomers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      logger.debug('Received request to get all customers', req.query);
      const customers = await this.customerService.getCustomers(req.query);
      res.status(200).json({
        success: true,
        data: customers,
      });
    } catch (error) {
      logger.error('Error getting customers:', error);
      next(error);
    }
  };

  getCustomerById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      logger.debug(`Received request to get customer by ID: ${id}`);
      const customer = await this.customerService.getCustomerById(id);

      if (!customer) {
        return next(ErrorTypes.NOT_FOUND('Customer'));
      }

      res.status(200).json({
        success: true,
        data: customer,
      });
    } catch (error) {
      logger.error('Error getting customer by ID:', error);
      next(error);
    }
  };

  updateCustomer = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      logger.debug(`Received request to update customer ID: ${id}`, req.body);
      const customerData: Partial<Omit<ICustomer, '_id' | 'createdAt' | 'updatedAt'>> = req.body;

      const customer = await this.customerService.updateCustomer(id, customerData);
      if (!customer) {
        return next(ErrorTypes.NOT_FOUND('Customer'));
      }

      res.status(200).json({
        success: true,
        data: customer,
      });
    } catch (error) {
      logger.error('Error updating customer:', error);
      next(error);
    }
  };

  deleteCustomer = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      logger.debug(`Received request to delete customer ID: ${id}`);

      const customer = await this.customerService.deleteCustomer(id);
      if (!customer) {
        return next(ErrorTypes.NOT_FOUND('Customer'));
      }

      res.status(200).json({
        success: true,
        message: 'Customer deleted successfully',
        data: customer,
      });
    } catch (error) {
      logger.error('Error deleting customer:', error);
      next(error);
    }
  };

  getOrCreateCustomer = async (req: Request, res: Response, next: NextFunction) => {
    try {
      logger.debug('Received request to get or create customer', req.body);
      const customerData: Omit<ICustomer, '_id' | 'createdAt' | 'updatedAt'> = req.body;

      if (!customerData.email) {
        return next(ErrorTypes.VALIDATION('Email is required'));
      }

      const customer = await this.customerService.getOrCreateCustomer(customerData);
      if (!customer) {
        return next(ErrorTypes.INTERNAL('Failed to get or create customer'));
      }

      res.status(200).json({
        success: true,
        data: customer,
      });
    } catch (error) {
      logger.error('Error getting or creating customer:', error);
      next(error);
    }
  };
}
