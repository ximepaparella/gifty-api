import mongoose from 'mongoose';
import { ICustomer } from './customer.entity';
import { CustomerModel } from './customer.schema';

export interface ICustomerRepository {
  create(customerData: Partial<ICustomer>): Promise<ICustomer>;
  findById(id: string): Promise<ICustomer | null>;
  findByEmail(email: string): Promise<ICustomer | null>;
  findAll(query?: any): Promise<ICustomer[]>;
  update(id: string, customerData: Partial<ICustomer>): Promise<ICustomer | null>;
  delete(id: string): Promise<ICustomer | null>;
}

export class CustomerRepository implements ICustomerRepository {
  async create(customerData: Partial<ICustomer>): Promise<ICustomer> {
    const customer = new CustomerModel(customerData);
    return customer.save();
  }

  async findById(id: string): Promise<ICustomer | null> {
    return CustomerModel.findById(id).exec();
  }

  async findByEmail(email: string): Promise<ICustomer | null> {
    return CustomerModel.findOne({ email }).exec();
  }

  async findAll(query: any = {}): Promise<ICustomer[]> {
    // Basic filtering/pagination can be added here if needed
    return CustomerModel.find(query).exec();
  }

  async update(id: string, customerData: Partial<ICustomer>): Promise<ICustomer | null> {
    return CustomerModel.findByIdAndUpdate(id, { $set: customerData }, { new: true }).exec();
  }

  async delete(id: string): Promise<ICustomer | null> {
    return CustomerModel.findByIdAndDelete(id).exec();
  }
}
