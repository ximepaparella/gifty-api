import mongoose from 'mongoose';
import { User } from '@modules/user/domain/user.entity';

export interface ICustomer {
  _id?: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId | User | null; // Optional link to User
  fullName: string;
  email: string;
  phoneNumber: string;
  address: string;
  city: string;
  zipCode: string;
  country: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Customer implements ICustomer {
  _id?: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId | User | null;
  fullName: string;
  email: string;
  phoneNumber: string;
  address: string;
  city: string;
  zipCode: string;
  country: string;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(customer: ICustomer) {
    this._id = customer._id;
    this.userId = customer.userId;
    this.fullName = customer.fullName;
    this.email = customer.email;
    this.phoneNumber = customer.phoneNumber;
    this.address = customer.address;
    this.city = customer.city;
    this.zipCode = customer.zipCode;
    this.country = customer.country;
    this.createdAt = customer.createdAt;
    this.updatedAt = customer.updatedAt;
  }
} 