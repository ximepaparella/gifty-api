import { ICustomer } from '../domain/customer.entity';
import { ICustomerRepository, CustomerRepository } from '../domain/customer.repository';
import {
  customerValidationSchema,
  updateCustomerValidationSchema,
} from '../domain/customer.validation';
import { ErrorTypes } from '@shared/types/appError';
import { logger }	 from '@shared/infrastructure/logging/logger';
import mongoose from 'mongoose';

export class CustomerService {
  private repository: ICustomerRepository;

  constructor(repository: ICustomerRepository = new CustomerRepository()) {
    this.repository = repository;
  }

  async createCustomer(
    customerData: Omit<ICustomer, '_id' | 'createdAt' | 'updatedAt'>
  ): Promise<ICustomer> {
    const { error } = customerValidationSchema.validate(customerData);
    if (error) {
      throw ErrorTypes.VALIDATION(error.details[0].message);
    }

    const existingCustomer = await this.repository.findByEmail(customerData.email);
    if (existingCustomer) {
      logger.error(`Customer creation failed: Email ${customerData.email} already exists.`);
      throw ErrorTypes.CONFLICT('Customer with this email already exists');
    }

    // Convert userId string to ObjectId if provided
    const dataToSave: Partial<ICustomer> = { ...customerData };
    if (customerData.userId && typeof customerData.userId === 'string') {
      dataToSave.userId = new mongoose.Types.ObjectId(customerData.userId);
    } else if (customerData.userId) {
      // Handle cases where userId might already be ObjectId (e.g., internal calls)
      dataToSave.userId = customerData.userId;
    }

    logger.info(`Creating customer with email: ${customerData.email}`);
    const customer = await this.repository.create(dataToSave);
    logger.info(`Customer created successfully with ID: ${customer._id}`);
    return customer;
  }

  async getCustomers(query: any = {}): Promise<ICustomer[]> {
    logger.info('Fetching all customers');
    return this.repository.findAll(query);
  }

  async getCustomerById(id: string): Promise<ICustomer> {
    logger.info(`Fetching customer with ID: ${id}`);
    const customer = await this.repository.findById(id);
    if (!customer) {
      logger.error(`Customer with ID ${id} not found.`);
      throw ErrorTypes.NOT_FOUND('Customer');
    }
    return customer;
  }

  async updateCustomer(
    id: string,
    customerData: Partial<Omit<ICustomer, '_id' | 'createdAt' | 'updatedAt'>>
  ): Promise<ICustomer> {
    const { error } = updateCustomerValidationSchema.validate(customerData);
    if (error) {
      throw ErrorTypes.VALIDATION(error.details[0].message);
    }

    // Check for email conflict if email is being updated
    if (customerData.email) {
      const existingCustomer = await this.repository.findByEmail(customerData.email);
      if (existingCustomer && existingCustomer._id?.toString() !== id) {
        logger.error(
          `Customer update failed for ID ${id}: Email ${customerData.email} already exists.`
        );
        throw ErrorTypes.CONFLICT('Another customer with this email already exists');
      }
    }

    // Convert userId string to ObjectId if provided
    const dataToUpdate: Partial<ICustomer> = { ...customerData };
    if (customerData.userId && typeof customerData.userId === 'string') {
      dataToUpdate.userId = new mongoose.Types.ObjectId(customerData.userId);
    } else if (customerData.userId) {
      // Handle cases where userId might already be ObjectId (e.g., internal calls)
      dataToUpdate.userId = customerData.userId;
    }

    logger.info(`Updating customer with ID: ${id}`);
    const customer = await this.repository.update(id, dataToUpdate);
    if (!customer) {
      logger.error(`Customer with ID ${id} not found for update.`);
      throw ErrorTypes.NOT_FOUND('Customer');
    }
    logger.info(`Customer updated successfully with ID: ${id}`);
    return customer;
  }

  async deleteCustomer(id: string): Promise<ICustomer> {
    logger.info(`Attempting to delete customer with ID: ${id}`);
    const customer = await this.repository.delete(id);
    if (!customer) {
      logger.error(`Customer with ID ${id} not found for deletion.`);
      throw ErrorTypes.NOT_FOUND('Customer');
    }
    // We might need to handle related orders here in the future (e.g., anonymize or prevent deletion)
    logger.info(`Customer deleted successfully with ID: ${id}`);
    return customer;
  }

  async getOrCreateCustomer(
    customerData: Omit<ICustomer, '_id' | 'createdAt' | 'updatedAt'>
  ): Promise<ICustomer> {
    const { error } = customerValidationSchema.validate(customerData);
    if (error) {
      throw ErrorTypes.VALIDATION(error.details[0].message);
    }

    // Try to find existing customer by email
    const existingCustomer = await this.repository.findByEmail(customerData.email);
    if (existingCustomer) {
      logger.info(`Found existing customer with email: ${customerData.email}`);
      return existingCustomer;
    }

    // If no existing customer, create new one
    logger.info(
      `No existing customer found with email: ${customerData.email}, creating new customer`
    );
    return this.createCustomer(customerData);
  }
}
