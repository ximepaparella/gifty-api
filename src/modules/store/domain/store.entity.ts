import { Types } from 'mongoose';

export interface IStore {
  _id?: Types.ObjectId;
  name: string;
  ownerId: Types.ObjectId;
  email: string;
  phone: string;
  address: string;
  logo?: string | null;
  social?: {
    instagram?: string | null;
    facebook?: string | null;
    tiktok?: string | null;
    youtube?: string | null;
    others?: Array<{
      name: string;
      url: string;
    }>;
  };
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
  public logo?: string | null;
  public social?: {
    instagram?: string | null;
    facebook?: string | null;
    tiktok?: string | null;
    youtube?: string | null;
    others?: Array<{
      name: string;
      url: string;
    }>;
  };

  public createdAt?: Date;
  public updatedAt?: Date;

  constructor(store: IStore) {
    this._id = store._id;
    this.name = store.name;
    this.ownerId = store.ownerId;
    this.email = store.email;
    this.phone = store.phone;
    this.address = store.address;
    this.logo = store.logo;
    this.social = store.social;
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
      logo: this.logo,
      social: this.social,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
