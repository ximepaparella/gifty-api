import { Types } from 'mongoose';

export interface IStore {
  _id?: Types.ObjectId;
  name: string;
  ownerId: Types.ObjectId;
  email: string;
  phone: string;
  address: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Store implements IStore {
  public _id?: Types.ObjectId;
  public name: string;
  public ownerId: Types.ObjectId;
  public email: string;
  public phone: string;
  public address: string;
  public createdAt?: Date;
  public updatedAt?: Date;

  constructor(store: IStore) {
    this._id = store._id;
    this.name = store.name;
    this.ownerId = store.ownerId;
    this.email = store.email;
    this.phone = store.phone;
    this.address = store.address;
    this.createdAt = store.createdAt;
    this.updatedAt = store.updatedAt;
  }

  toJSON() {
    return {
      _id: this._id,
      name: this.name,
      ownerId: this.ownerId,
      email: this.email,
      phone: this.phone,
      address: this.address,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
} 