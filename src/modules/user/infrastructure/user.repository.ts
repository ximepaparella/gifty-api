import mongoose from 'mongoose';
import { User, CreateUserDTO, UpdateUserDTO } from '../domain/user.entity';
import { UserRepository } from '../domain/user.repository';
import { UserModel } from './user.model';
import { PaginationOptions, PaginatedResult } from '@shared/types';
import { DatabaseError } from '@shared/infrastructure/errors';
import logger from '@shared/infrastructure/logging/logger';

export class MongoUserRepository implements UserRepository {
  async findAll(
    filter: Partial<User> = {},
    options: PaginationOptions = {}
  ): Promise<PaginatedResult<User>> {
    try {
      const { page = 1, limit = 10, sort = { createdAt: -1 } } = options;
      const skip = (page - 1) * limit;

      // Convert sort string to object if needed
      const sortOptions = typeof sort === 'string' ? this.parseSortString(sort) : sort;

      // Execute query with pagination
      const users = await UserModel.find(filter).sort(sortOptions).skip(skip).limit(limit).lean();

      // Get total count for pagination
      const total = await this.count(filter);

      return {
        data: users.map((user) => ({
          ...user,
          id: user._id.toString(),
        })) as User[],
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Error finding users:', error);
      throw new DatabaseError('Failed to retrieve users');
    }
  }

  async findById(id: string): Promise<User | null> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return null;
      }

      const user = await UserModel.findById(id).lean();

      if (!user) {
        return null;
      }

      return {
        ...user,
        id: user._id.toString(),
      } as User;
    } catch (error) {
      logger.error(`Error finding user by id ${id}:`, error);
      throw new DatabaseError('Failed to retrieve user');
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      const user = await UserModel.findOne({ email }).lean();

      if (!user) {
        return null;
      }

      return {
        ...user,
        id: user._id.toString(),
      } as User;
    } catch (error) {
      logger.error(`Error finding user by email ${email}:`, error);
      throw new DatabaseError('Failed to retrieve user');
    }
  }

  async create(userData: CreateUserDTO): Promise<User> {
    try {
      const user = await UserModel.create(userData);

      return {
        ...user.toJSON(),
        id: user._id.toString(),
      } as User;
    } catch (error) {
      logger.error('Error creating user:', error);
      throw new DatabaseError('Failed to create user');
    }
  }

  async update(id: string, userData: UpdateUserDTO): Promise<User | null> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return null;
      }

      const user = await UserModel.findByIdAndUpdate(
        id,
        { ...userData, updatedAt: new Date() },
        { new: true, runValidators: true }
      ).lean();

      if (!user) {
        return null;
      }

      return {
        ...user,
        id: user._id.toString(),
      } as User;
    } catch (error) {
      logger.error(`Error updating user ${id}:`, error);
      throw new DatabaseError('Failed to update user');
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return false;
      }

      const result = await UserModel.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      logger.error(`Error deleting user ${id}:`, error);
      throw new DatabaseError('Failed to delete user');
    }
  }

  async count(filter: Partial<User> = {}): Promise<number> {
    try {
      return await UserModel.countDocuments(filter);
    } catch (error) {
      logger.error('Error counting users:', error);
      throw new DatabaseError('Failed to count users');
    }
  }

  private parseSortString(sortStr: string): Record<string, 1 | -1> {
    const result: Record<string, 1 | -1> = {};

    sortStr.split(',').forEach((part) => {
      const [field, order] = part.split(':');
      result[field] = order?.toLowerCase() === 'desc' ? -1 : 1;
    });

    return result;
  }
}
