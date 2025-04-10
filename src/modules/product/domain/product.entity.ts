import { Types } from 'mongoose';

export interface IProduct {
  _id?: Types.ObjectId;
  storeId: Types.ObjectId;
  name: string;
  description: string;
  price: number;
  isActive: boolean;
  image?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Product implements IProduct {
  _id?: Types.ObjectId;
  storeId: Types.ObjectId;
  name: string;
  description: string;
  price: number;
  isActive: boolean;
  image?: string | null;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(product: IProduct) {
    this._id = product._id;
    this.storeId = product.storeId;
    this.name = product.name;
    this.description = product.description;
    this.price = product.price;
    this.isActive = product.isActive ?? true;
    this.image = product.image;
    this.createdAt = product.createdAt;
    this.updatedAt = product.updatedAt;
  }
}
